const express = require("express");
const app = express();

// Set view engine
app.set("view engine", "pug");
app.set("views", "./views");

// Static files (CSS etc)
app.use(express.static("public"));

/* -----------------------------
   SAMPLE DATA (like database)
--------------------------------*/

// Users 
const users = [
  { id: 1, name: "Layla", country: "Turkey", language: "Turkish, English", interests: "Food, Festivals", bio: "I love sharing Turkish culture and traditions." },
  { id: 2, name: "Oliver", country: "UK", language: "English", interests: "Tea, History", bio: "British culture enthusiast." },
  { id: 3, name: "Mei", country: "China", language: "Chinese, English", interests: "Calligraphy, Tea", bio: "Passionate about Chinese traditions." },
  { id: 4, name: "Kai", country: "Jamaica", language: "English, Creole", interests: "Music, Dance", bio: "Caribbean culture is vibrant!" },
  { id: 5, name: "Amara", country: "Nigeria", language: "English, Yoruba", interests: "Storytelling", bio: "African heritage lover." }
];

// Cultural posts (listing page + detail page)
const posts = [
  { id: 1, title: "Turkish Breakfast", country: "Turkey", content: "Olives, cheese and tea.", user_id: 1 },
  { id: 2, title: "Diwali Festival", country: "India", content: "Festival of lights.", user_id: 2 },
  { id: 3, title: "Chinese Tea Culture", country: "China", content: "Traditional tea rituals.", user_id: 3 },
  { id: 4, title: "Caribbean Dance", country: "Jamaica", content: "Music and movement.", user_id: 4 },
  { id: 5, title: "African Clothing", country: "Nigeria", content: "Traditional fashion styles.", user_id: 5 }
];

/* -----------------------------
   ROUTES
--------------------------------*/

// Homepage 
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

// Categories page
app.get("/categories", (req, res) => {
  const categories = [
    { name: "Food", count: 120 },
    { name: "Languages", count: 80 },
    { name: "Traditions", count: 95 },
    { name: "Festivals", count: 60 }
  ];

  res.render("categories", { categories });
});

// Users list page
app.get("/users", (req, res) => {
  res.render("users", { users });
});

// Single user profile
app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id == req.params.id);
  res.render("profile", { user });
});

// Posts list page 
app.get("/posts", (req, res) => {
  res.render("posts", { posts });
});

// Single post detail page
app.get("/posts/:id", (req, res) => {
  const post = posts.find(p => p.id == req.params.id);
  res.render("post-detail", { post });
});

/* -----------------------------
   SERVER START
--------------------------------*/

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
