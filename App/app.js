// Import express.js
const express = require("express");

// Create express app
var app = express();

// Configure PUG
app.set('view engine', 'pug');
app.set('views', './views');

// Add static files location 
app.use(express.static("static"));
app.use(express.static("public")); 

// Get the functions in the db.js file to use
const db = require('./services/db');

// Create a route for root - UPDATED to use PUG
app.get("/", function(req, res){
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

// SAMPLE DATA WITHOUT PULLING FROM SQL DATABASE (FOR NOW)

// Categories page (Lucies)
app.get("/categories", function(req, res){
  // Sample data - you'll replace this with database queries later
  const categories = [
    { name: 'Food', count: 156 },
    { name: 'Language', count: 89 },
    { name: 'Traditions', count: 124 },
    { name: 'Festivals', count: 67 },
    { name: 'Customs', count: 78 },
    { name: 'History', count: 45 }
  ];
  
  // Countries data
  const countries = [
    { name: 'Italy', flag: '🇮🇹', postCount: 45 },
    { name: 'Japan', flag: '🇯🇵', postCount: 38 },
    { name: 'Nigeria', flag: '🇳🇬', postCount: 27 },
    { name: 'Mexico', flag: '🇲🇽', postCount: 22 },
    { name: 'India', flag: '🇮🇳', postCount: 35 }
  ];
  
  // Tags data
  const tags = [
    { name: 'recipes', count: 89 },
    { name: 'cooking', count: 78 },
    { name: 'traditions', count: 67 },
    { name: 'language', count: 56 },
    { name: 'holidays', count: 45 },
    { name: 'history', count: 34 }
  ];
  
  // Pass ALL variables to the template
  res.render('categories', {
    title: 'Categories',
    categories: categories,
    countries: countries,
    tags: tags
  });
});

// Users list page
app.get("/users", function(req, res){
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