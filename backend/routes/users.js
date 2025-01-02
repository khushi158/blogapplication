const express = require('express');
const router = express.Router();
const { MongoClient,ServerApiVersion,ObjectId } = require('mongodb');

const uri = "mongodb+srv://kuchi:kuchi1428@cluster0.sjwduyx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Test MongoDB connection
client.connect().then(() => {
  console.log("Connected to MongoDB successfully!");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
});

// Route to fetch all blogs
router.get("/blog", async (req, res) => {
  try {
    const blogs = await client.db("Blog").collection("blogs").find().toArray(); // Fetch all blogs
    res.json(blogs); // Return the blogs in the response
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send("Failed to fetch blogs");
  }
});

// Route to create a new blog
router.post("/blogs", async (req, res) => {
  const { blogContent, username } = req.body;

  if (!blogContent || !username) {
    return res.status(400).json({ error: "Blog content and username are required" });
  }

  try {
    const newBlog = {
      content: blogContent,
      username, // Store the username/email of the user
      likes: [],
      dislikes: [],
      createdAt: new Date(), // Add timestamp
    };

    // Insert new blog into the database
    await client.db("Blog").collection("blogs").insertOne(newBlog);
    res.status(201).json({ message: "Blog created successfully!" });
  } catch (error) {
    console.error("Error inserting blog:", error);
    res.status(500).json({ error: "Failed to insert blog" });
  }
});

// Route to sign up a new user
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const existingUser = await client.db("Blog").collection("signup").findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
   
    const newUser = {
      username,
      email,
      password,
      createdAt: new Date(),
    };

    // Insert new user into the database
    await client.db("Blog").collection("signup").insertOne(newUser);
    res.status(201).json({ message: "User signed up successfully!" });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ error: "Failed to sign up user" });
  }
});

// Route to log in a user
router.post("/login", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await client.db("Blog").collection("signup").findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Login successful!", user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Failed to log in user" });
  }
});
// Like a blog
const isValidObjectId = (id) => {
  return /^[a-fA-F0-9]{24}$/.test(id);  // MongoDB ObjectId is a 24-character hex string
};
router.post("/blogs/reaction", async (req, res) => {
  const { blogId, action, username } = req.body;

  if (!isValidObjectId(blogId)) {
    return res.status(400).json({ error: "Invalid Blog ID" });
  }

  if (!["like", "dislike"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const blog = await client.db("Blog").collection("blogs").findOne({ _id: new ObjectId(blogId) });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const hasLiked = blog.likes.includes(username);
    const hasDisliked = blog.dislikes.includes(username);

    // Logic for handling reactions
    if (action === "like") {
      if (hasLiked) {
        // If already liked, remove like
        await client.db("Blog").collection("blogs").updateOne(
          { _id: new ObjectId(blogId) },
          { $pull: { likes: username } } // Remove username from likes
        );
        return res.status(200).json({ message: "Like removed" });
      } else {
        // If disliked, remove dislike and add like
        if (hasDisliked) {
          await client.db("Blog").collection("blogs").updateOne(
            { _id: new ObjectId(blogId) },
            { $pull: { dislikes: username } } // Remove username from dislikes
          );
        }
        await client.db("Blog").collection("blogs").updateOne(
          { _id: new ObjectId(blogId) },
          { $addToSet: { likes: username } } // Add username to likes
        );
        return res.status(200).json({ message: "Blog liked" });
      }
    } else if (action === "dislike") {
      if (hasDisliked) {
        // If already disliked, remove dislike
        await client.db("Blog").collection("blogs").updateOne(
          { _id: new ObjectId(blogId) },
          { $pull: { dislikes: username } } // Remove username from dislikes
        );
        return res.status(200).json({ message: "Dislike removed" });
      } else {
        // If liked, remove like and add dislike
        if (hasLiked) {
          await client.db("Blog").collection("blogs").updateOne(
            { _id: new ObjectId(blogId) },
            { $pull: { likes: username } } // Remove username from likes
          );
        }
        await client.db("Blog").collection("blogs").updateOne(
          { _id: new ObjectId(blogId) },
          { $addToSet: { dislikes: username } } // Add username to dislikes
        );
        return res.status(200).json({ message: "Blog disliked" });
      }
    }
  } catch (error) {
    console.error(`Error during ${action}:`, error);
    res.status(500).json({ error: `Failed to ${action} blog` });
  }
});

// Route to delete a blog
router.delete("/blogs/:id", async (req, res) => {
  const { id } = req.params; // Blog ID
  const { userEmail } = req.body; // User email from the request body

  if (!userEmail) {
    return res.status(400).json({ error: "User email is required" });
  }

  try {
    const blog = await client.db("Blog").collection("blogs").findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Check if the logged-in user is the owner of the blog
    if (blog.username !== userEmail) {
      return res.status(403).json({ error: "You are not authorized to delete this blog" });
    }

    // Delete the blog
    await client.db("Blog").collection("blogs").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ error: "Failed to delete blog" });
  }
});


module.exports = router;
