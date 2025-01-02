const express = require('express');
const cors = require('cors');
const path=require("path");

const usersRoutes = require('./routes/users'); // Import user routes

const app = express(); // Create an Express application instance
app.use(cors({
  origin: '*', // Allow all origins
  methods: 'GET,POST,PUT,DELETE', // Allow these HTTP methods
  credentials: false, // Disable cookies/authorization headers for all origins
}));
app.use(express.json());
app.use(express.static(path.join(__dirname,"dist/index.html")));
app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname,"dist/index.html"));
})


// MongoDB Connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://kuchi:kuchi1428@cluster0.sjwduyx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Make MongoDB client accessible to routes
app.use((req, res, next) => {
  req.dbClient = client;
  next();
});

// Test MongoDB connection
client.connect().then(() => {
  console.log("Connected to MongoDB successfully!");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
});

// Root route
app.get('/', (req, res) => {
  res.send("Welcome to the homepage!");
});

// Use routes
app.use('/users', usersRoutes); // Mount the users route on '/users'

// Start the server
const PORT = 3001; // Ensure this matches your fetch URL
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
