const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();

// VIEW ENGINE
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

// STATIC
app.use(express.static("public"));

// DATABASE
const db = new sqlite3.Database("./sd2.db");

// HOME
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

// USERS PAGE
app.get("/users", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.send(err);
    res.render("users", {
      title: "Community",
      users: rows
    });
  });
});

// PROFILE PAGE
app.get("/users/:id", (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err, user) => {
    if (err) return res.send(err);

    res.render("profile", {
      title: "Profile",
      user: user
    });
  });
});

// POSTS PAGE
app.get("/posts", (req, res) => {
  db.all(`
    SELECT posts.*, users.name 
    FROM posts 
    JOIN users ON posts.user_id = users.id
  `, [], (err, posts) => {
    if (err) return res.send(err);

    res.render("posts", {
      title: "Posts",
      posts: posts
    });
  });
});

// CATEGORIES PAGE
app.get("/categories", (req, res) => {
  db.all(`
    SELECT country AS name, COUNT(*) as count 
    FROM posts 
    GROUP BY country
  `, [], (err, categories) => {
    if (err) return res.send(err);

    res.render("categories", {
      title: "Categories",
      categories: categories,
      countries: [],
      tags: []
    });
  });
});

// START SERVER
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

module.exports = app;
