// Main server file - handles all routes
const express = require("express");
const app = express();

// Set up Pug
app.set("view engine", "pug");
app.set("views", "./views");

// Static files (CSS)
app.use(express.static("public"));

// ---------------- SAMPLE DATA ----------------

// Users (requirement)
const users = [
  { id: 1, name: "Layla", country: "Turkey", language: "Arabic, English", interests: "Food, Festivals", bio: "Sharing Turkish traditions" },
  { id: 2, name: "Oliver", country: "UK", language: "English", interests: "Tea, History", bio: "British culture lover" },
  { id: 3, name: "Mei", country: "China", language: "Chinese, English", interests: "Calligraphy", bio: "Asian traditions" },
  { id: 4, name: "Kai", country: "Jamaica", language: "English", interests: "Music", bio: "Caribbean vibes" },
  { id: 5, name: "Amara", country: "Nigeria", language: "English", interests: "Storytelling", bio: "African heritage" }
];

// Listings (IMPORTANT)
const posts = [
  { id: 1, title: "Turkish Breakfast", category: "Food", country: "Turkey", content: "Olives, cheese and tea", user_id: 1 },
  { id: 2, title: "Diwali Festival", category: "Festivals", country: "India", content: "Festival of lights", user_id: 2 },
  { id: 3, title: "Chinese Tea Culture", category: "Traditions", country: "China", content: "Tea rituals", user_id: 3 },
  { id: 4, title: "Caribbean Dance", category: "Music", country: "Jamaica", content: "Dance & rhythm", user_id: 4 },
  { id: 5, title: "African Clothing", category: "Customs", country: "Nigeria", content: "Traditional styles", user_id: 5 }
];

// ---------------- ROUTES ----------------

// Homepage
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

// USERS PAGE
app.get("/users", (req, res) => {
  res.render("users", { users });
});

// USER PROFILE
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  res.render("profile", { user });
});

// LISTING PAGE (ALL POSTS)
app.get("/posts", (req, res) => {
  res.render("posts", { posts });
});

// DETAIL PAGE (IMPORTANT)
app.get("/posts/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  res.render("post-detail", { post });
});

// CATEGORIES PAGE
app.get("/categories", (req, res) => {
  res.render("categories", { posts });
});

// START SERVER
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
