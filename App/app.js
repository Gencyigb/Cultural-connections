const express = require("express");
const app = express();
const db = require('./Services/db');  // ← ADD THIS - connects to MySQL

// Set view engine
app.set("view engine", "pug");
app.set("views", "./views");

// Static files (CSS etc)
app.use(express.static("public"));

/* -----------------------------
   ROUTES - USING REAL DATABASE
--------------------------------*/

// Homepage 
app.get("/", async (req, res) => {
  res.render("index", { title: "Home" });
});

// Categories page - GETS DATA FROM MYSQL
app.get("/categories", async (req, res) => {
  try {
    // Get category counts from posts table
    const [categories] = await db.query(`
      SELECT 
        CASE 
          WHEN title LIKE '%Breakfast%' OR title LIKE '%Food%' THEN 'Food'
          WHEN title LIKE '%Festival%' OR title LIKE '%Diwali%' THEN 'Festivals'
          WHEN title LIKE '%Tea%' OR title LIKE '%Culture%' THEN 'Traditions'
          ELSE 'Other'
        END as name,
        COUNT(*) as count
      FROM posts 
      GROUP BY name
    `);
    
    // Get countries from users table
    const [countriesData] = await db.query(`
      SELECT country, COUNT(*) as count 
      FROM users 
      GROUP BY country
    `);
    
    const countries = countriesData.map(c => ({ 
      name: c.country, 
      flag: "🌍", 
      postCount: c.count 
    }));
    
    // Tags (can be from database or static)
    const tags = [
      { name: "food", count: 45 },
      { name: "traditions", count: 32 },
      { name: "language", count: 28 }
    ];
    
    res.render("categories", { categories, countries, tags });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Database error");
  }
});

// Users list page - GETS REAL DATA FROM MYSQL
app.get("/users", async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users");
    res.render("users", { users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Single user profile - GETS REAL DATA FROM MYSQL
app.get("/users/:id", async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (users.length === 0) {
      return res.status(404).send("User not found");
    }
    res.render("profile", { user: users[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Posts list page - GETS REAL DATA FROM MYSQL
app.get("/posts", async (req, res) => {
  try {
    const [posts] = await db.query("SELECT * FROM posts");
    res.render("posts", { posts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

// Single post detail page - GETS REAL DATA FROM MYSQL
app.get("/posts/:id", async (req, res) => {
  try {
    const [posts] = await db.query("SELECT * FROM posts WHERE id = ?", [req.params.id]);
    if (posts.length === 0) {
      return res.status(404).send("Post not found");
    }
    res.render("post-detail", { post: posts[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

/* -----------------------------
   SERVER START
--------------------------------*/

app.listen(3000, '0.0.0.0', () => {
  console.log("Server running on http://localhost:3000");
});