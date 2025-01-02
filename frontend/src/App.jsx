import React, { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

const App = () => {
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();


  // Fetch blogs from backend
  const fetchBlogs = async () => {
    try {
      const res = await fetch("http://localhost:3001/users/blog");
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // Add new blog
  const handleAddBlog = async () => {
    if (!input.trim()) {
      alert("Blog content cannot be empty.");
      return;
    }
  
    try {
      const res = await fetch("http://localhost:3001/users/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogContent: input, username: userData.email }), // Include the user's email
      });
      if (!res.ok) throw new Error("Failed to add blog");
  
      fetchBlogs();
      setInput("");
      setShowInput(false);
    } catch (error) {
      console.error("Error adding blog:", error);
    }
  };
  
  const handleReaction = async (blogId, action) => {
    console.log("Blog ID:", blogId, "Action:", action);  // Add logging here
    
    try {
      const res = await fetch("http://localhost:3001/users/blogs/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, action, username: userData.email }),
      });
      
      if (!res.ok) throw new Error(`Failed to ${action} blog`);
      fetchBlogs(); // Refresh blogs after the reaction
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      alert(`Error during ${action}: ${error.message}`);
    }
  };
  
  const handleDelete = async (blogId) => {
    try {
      const res = await fetch(`http://localhost:3001/users/blogs/${blogId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail: userData.email }), // Pass logged-in user's email
      });
  
      const data = await res.json();
      if (!res.ok) {
        alert(data.error); // Alert the user if they can't delete the blog
        return;
      }
  
      alert(data.message); // Confirm successful deletion
      fetchBlogs(); // Refresh blogs
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete the blog");
    }
  };
  
  
const getUserData = ()=>{
  const userDataString = localStorage.getItem("user");
if (!userDataString) {
  console.log("No user data found, redirecting to login.");
  navigate("/");
  return;
}

const parsedUserData = JSON.parse(userDataString);
setUserData(parsedUserData);
fetchBlogs(parsedUserData.id);
};

// Logout handler
const handleLogout = () => {
  localStorage.removeItem("user");
  navigate("/");
};

useEffect(() => {
  getUserData();
}, []);

  
  return (
    <div className="App">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">BlogSphere</div>
        <div className="navbar-links">
          <a href="#blogs">Blogs</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <h1>Welcome to BlogSphere</h1>
        <p>Share your stories and connect with the world.</p>
        <div>Welcome, {userData.email || "User"}!</div>
     
        <button className="primary-button" onClick={() => setShowInput(true)}>
          Add New Blog
        </button>
      </header>

      {/* Blog Input Section */}
      {showInput && (
        <div className="blog-input">
          <textarea
            value={input}
            placeholder="Write your blog here..."
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <button className="primary-button" onClick={handleAddBlog}>
            Submit
          </button>
        </div>
      )}

      {/* Blogs Section */}
      <section id="blogs" className="blogs-section">
        <h2>Recent Blogs</h2>
        <div className="blog-grid">
          {blogs.length > 0 ? (
            blogs.map((blog) => (
              <div key={blog._id} className="blog-card">
                 <p>{blog.username}</p>
                <p>{blog.content}</p>
                <p>{blog.createdAt}</p>
                <div className="reaction-buttons">
                  <button onClick={() => handleReaction(blog._id, "like")}>
                    👍 {blog.likes.length || 0}
                  </button>
                  <button onClick={() => handleReaction(blog._id, "dislike")}>
                    👎 {blog.dislikes.length || 0}
                  </button>
            <button onClick={() => handleDelete(blog._id)}>🗑️ Delete</button>

                </div>
              </div>
            ))
          ) : (
            <p className="no-blogs">No blogs found. Be the first to create one!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;
