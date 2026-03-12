const express = require("express");

const app = express();

// Configure PUG
app.set("view engine", "pug");
app.set("views", "./views");

// Static files
app.use(express.static("static"));
app.use(express.static("public"));

// Home page
app.get("/", function(req, res){
  res.render("index", {
    title: "Home"
  });
});

// Categories page
app.get("/categories", function(req, res){

  const categories = [
    { name: "Food", count: 156 },
    { name: "Language", count: 89 },
    { name: "Traditions", count: 124 },
    { name: "Festivals", count: 67 },
    { name: "Customs", count: 78 },
    { name: "History", count: 45 }
  ];

  const countries = [
    { name: "Italy", flag: "🇮🇹", postCount: 45 },
    { name: "Japan", flag: "🇯🇵", postCount: 38 },
    { name: "Nigeria", flag: "🇳🇬", postCount: 27 },
    { name: "Mexico", flag: "🇲🇽", postCount: 22 },
    { name: "India", flag: "🇮🇳", postCount: 35 }
  ];

  const tags = [
    { name: "recipes", count: 89 },
    { name: "cooking", count: 78 },
    { name: "traditions", count: 67 },
    { name: "language", count: 56 },
    { name: "holidays", count: 45 },
    { name: "history", count: 34 }
  ];

  res.render("categories", {
    title: "Categories",
    categories: categories,
    countries: countries,
    tags: tags
  });
});

// USERS PAGE
app.get("/users", function(req, res){

  const users = [
    {
      id: 1,
      name: "Layla",
      country: "Middle Eastern Culture",
      language: "Arabic, English",
      interests: "Traditional food, cultural festivals, music",
      bio: "I enjoy sharing Middle Eastern traditions, food, and cultural celebrations."
    },
    {
      id: 2,
      name: "Oliver",
      country: "British Culture",
      language: "English",
      interests: "History, tea culture, literature",
      bio: "I enjoy discussing British traditions, historical sites, and cultural heritage."
    },
    {
      id: 3,
      name: "Mei",
      country: "Asian Culture",
      language: "Chinese, English",
      interests: "Tea culture, calligraphy, traditional festivals",
      bio: "I enjoy sharing Asian traditions and learning about cultures from around the world."
    },
    {
      id: 4,
      name: "Kai",
      country: "Caribbean Culture",
      language: "English, Creole",
      interests: "Music, dance, Caribbean festivals",
      bio: "Caribbean culture is vibrant with music and festivals that I love sharing."
    },
    {
      id: 5,
      name: "Amara",
      country: "African Culture",
      language: "English, Yoruba",
      interests: "Traditional clothing, storytelling, festivals",
      bio: "I enjoy sharing African traditions, storytelling, and cultural celebrations."
    }
  ];

  res.render("users", {
    title: "Community",
    users: users
  });
});

// USER PROFILE PAGE
app.get("/users/:id", function(req, res){

  const users = [
    {
      id: 1,
      name: "Layla",
      country: "Middle Eastern Culture",
      language: "Arabic, English",
      interests: "Traditional food, cultural festivals, music",
      bio: "I enjoy sharing Middle Eastern traditions, food, and cultural celebrations."
    },
    {
      id: 2,
      name: "Oliver",
      country: "British Culture",
      language: "English",
      interests: "History, tea culture, literature",
      bio: "I enjoy discussing British traditions, historical sites, and cultural heritage."
    },
    {
      id: 3,
      name: "Mei",
      country: "Asian Culture",
      language: "Chinese, English",
      interests: "Tea culture, calligraphy, traditional festivals",
      bio: "I enjoy sharing Asian traditions and learning about cultures from around the world."
    },
    {
      id: 4,
      name: "Kai",
      country: "Caribbean Culture",
      language: "English, Creole",
      interests: "Music, dance, Caribbean festivals",
      bio: "Caribbean culture is vibrant with music and festivals that I love sharing."
    },
    {
      id: 5,
      name: "Amara",
      country: "African Culture",
      language: "English, Yoruba",
      interests: "Traditional clothing, storytelling, festivals",
      bio: "I enjoy sharing African traditions, storytelling, and cultural celebrations."
    }
  ];

  const user = users.find(u => u.id == req.params.id);

  res.render("profile", {
    title: "Profile",
    user: user
  });
});

// POSTS PAGE
app.get("/posts", function(req, res){
  res.render("posts", {
    title: "Posts"
  });
});

// START SERVER
app.listen(3000, function(){
  console.log("Server running at http://127.0.0.1:3000/");
});
