// Import express.js
const express = require("express");

// Create express app
var app = express();

// ===== NEW: Configure PUG =====
app.set('view engine', 'pug');
app.set('views', './views');

// Add static files location (your existing static folder + new public folder)
app.use(express.static("static"));
app.use(express.static("public")); // NEW: for styles.css

// Get the functions in the db.js file to use
const db = require('./services/db');

// ===== YOUR EXISTING ROUTES (KEEP THESE) =====

// Create a route for root - UPDATED to use PUG
app.get("/", function(req, res){
  // Instead of res.send, use res.render with PUG
  res.render('index', { 
    title: 'Home' 
  });
});

// Create a route for testing the db
app.get("/db_test", function(req, res){
  sql = 'select * from test_table';
  db.query(sql).then(results =>{
    console.log(results);
    res.send(results)
  });
});

// Create a route for /goodbye
app.get("/goodbye", function(req, res){
  res.send("Goodbye world!");
});

// Create a dynamic route for /hello/<name>
app.get("/hello/:name", function(req, res){
  console.log(req.params);
  res.send("Hello " + req.params.name);
});

// ===== NEW ROUTES FOR SPRINT 3 =====

// Categories page - YOUR PAGE
app.get("/categories", function(req, res){
  // Sample data - you'll replace this with database queries later
  const categories = [
    { name: 'Food', count: 156 },
    { name: 'Language', count: 89 },
    { name: 'Traditions', count: 124 },
    { name: 'Festivals', count: 67 },
    { name: 'Customs', count: 78 }
  ];
  
  res.render('categories', {
    title: 'Categories',
    categories: categories
  });
});

// Users list page
app.get("/users", function(req, res){
  // You can replace this with a real database query
  const users = [
    { name: 'Maria', country: 'Italy' },
    { name: 'Takashi', country: 'Japan' },
    { name: 'Amara', country: 'Nigeria' }
  ];
  
  res.render('users', {
    title: 'Community',
    users: users
  });
});

// Posts list page
app.get("/posts", function(req, res){
  res.render('posts', {
    title: 'Posts'
  });
});

// Start server on port 3000
app.listen(3000, function(){
  console.log('Server running at http://127.0.0.1:3000/');
  console.log('View your categories page at http://127.0.0.1:3000/categories');
});