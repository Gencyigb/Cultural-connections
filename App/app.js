const express = require("express");
const app = express();
const db = require('./services/db');
const session = require('express-session');
const bcrypt = require('bcrypt');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

app.set("view engine", "pug");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'cultural_connections_secret',
    resave: false,
    saveUninitialized: false
}))

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next(); 
}

async function getCountryInfo(countryName) {
    try {
        const countryMap = {
            'UK': 'united-kingdom',
            'United Kingdom': 'united-kingdom',
            'England': 'united-kingdom',
            'USA': 'united-states',
            'United States': 'united-states',
            'UAE': 'united-arab-emirates',
            'Turkey': 'turkey',
            'China': 'china',
            'Nigeria': 'nigeria',
            'Jamaica': 'jamaica',
            'France': 'france',
            'Italy': 'italy',
            'India': 'india',
            'Germany': 'germany',
            'Spain': 'spain',
            'Japan': 'japan',
            'Canada': 'canada',
            'Australia': 'australia',
            'Mexico': 'mexico',
            'Brazil': 'brazil',
            'Russia': 'russia',
            'South Africa': 'south-africa'
        };
        
        let searchName = countryMap[countryName];
        if (!searchName) {
            searchName = countryName.toLowerCase().replace(/ /g, '-');
        }
        
        const response = await fetch(`https://worldfactbook.io/api/v1/countries/${encodeURIComponent(searchName)}`);
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        
        if (!data || !data.name) {
            return null;
        }
        
        return {
            name: data.name,
            flag: null,
            capital: data.capital || 'Information not available',
            population: data.population ? parseInt(data.population).toLocaleString() : 'Information not available',
            currency: 'Information not available',
            region: data.region || 'Information not available'
        };
    } catch (error) {
        console.error(`Error fetching country info for ${countryName}:`, error.message);
        return null;
    }
}

// === ROUTES ===

app.get("/dashboard", requireLogin, async (req, res) => {
    res.render('Dashboard', { user: req.session.user });
});

app.get("/register", (req, res) => {
    res.render("signup");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/register", async (req, res) => {
    try {
        const { name, email, password, country, language, interests, bio } = req.body;

        if (!name || !email || !password) {
            return res.send("Name, email and password are required.");
        }

        const [existingUsers] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.send("Email already exists.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (name, email, password, country, language, interests, bio, points)
             VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
            [name, email, hashedPassword, country, language, interests, bio]
        );

        res.redirect("/login");
    } catch (error) {
        console.error(error);
        res.send("Registration failed.");
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.send("Invalid email or password.");
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.send("Invalid email or password.");
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            country: user.country,
            language: user.language,
            interests: user.interests,
            points: user.points
        };

        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.send("Login failed.");
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

app.post("/rate", requireLogin, async (req, res) => {
    try {
        const { post_id, rating } = req.body;
        const userId = req.session.user.id;
        const numericRating = parseInt(rating);

        if (numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5." });
        }

        // Check if user already rated this post
        const [existingRating] = await db.query(
            "SELECT rating FROM ratings WHERE user_id = ? AND post_id = ?",
            [userId, post_id]
        );

        let pointsToAdd = 0;
        let message = "";
        let newPoints = 0;

        if (existingRating.length === 0) {
            // First time rating - add 1 point
            pointsToAdd = 1;
            message = "Thank you for rating! You earned 1 point.";
            
            // Insert new rating
            await db.query(
                "INSERT INTO ratings (user_id, post_id, rating) VALUES (?, ?, ?)",
                [userId, post_id, numericRating]
            );
        } else {
            // Already rated before - update rating but NO points
            pointsToAdd = 0;
            message = "Rating updated! (No points added - you already rated this post before)";
            
            // Update existing rating
            await db.query(
                "UPDATE ratings SET rating = ? WHERE user_id = ? AND post_id = ?",
                [numericRating, userId, post_id]
            );
        }

        // Add points to user (only if first time rating)
        if (pointsToAdd > 0) {
            await db.query(
                "UPDATE users SET points = points + ? WHERE id = ?",
                [pointsToAdd, userId]
            );
            
            // Update session points
            req.session.user.points = (req.session.user.points || 0) + pointsToAdd;
        }

        // Get updated user points
        const [userPoints] = await db.query(
            "SELECT points FROM users WHERE id = ?",
            [userId]
        );
        
        newPoints = userPoints[0]?.points || 0;

        // Return JSON response (no redirect)
        res.json({
            success: true,
            message: message,
            points: newPoints,
            rating: numericRating
        });
        
    } catch (error) {
        console.error("Rating error:", error);
        res.status(500).json({ error: "Could not save rating." });
    }
});

app.get("/recommendations", requireLogin, async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [userRows] = await db.query(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        const user = userRows[0];

        const [posts] = await db.query("SELECT * FROM posts");

        const userInterests = (user.interests || "")
            .toLowerCase()
            .split(",")
            .map(item => item.trim());

        const scoredPosts = posts.map(post => {
            let score = 0;

            if (post.country && user.country && post.country.toLowerCase() === user.country.toLowerCase()) {
                score += 3;
            }

            if (post.title) {
                const titleLower = post.title.toLowerCase();
                userInterests.forEach(interest => {
                    if (interest && titleLower.includes(interest)) {
                        score += 4;
                    }
                });
            }

            return { ...post, matchScore: score };
        });

        scoredPosts.sort((a, b) => b.matchScore - a.matchScore);

        res.render("recommendations", {
            user,
            posts: scoredPosts.slice(0, 5)
        });
    } catch (error) {
        console.error(error);
        res.send("Could not load recommendations.");
    }
});

app.get('/matches', requireLogin, async (req, res) => {
    try {
        const userId = req.session.user.id;

        const [currentUserRows] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [userId]
        );

        if (currentUserRows.length === 0) {
            return res.send('Current user not found.');
        }

        const currentUser = currentUserRows[0];

        const [otherUsers] = await db.query(
            'SELECT * FROM users WHERE id != ?',
            [userId]
        );

        const currentInterests = (currentUser.interests || '')
            .toLowerCase()
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);

        const matches = otherUsers.map(user => {
            let score = 0;

            if (
                currentUser.country &&
                user.country &&
                currentUser.country.toLowerCase() === user.country.toLowerCase()
            ) {
                score += 3;
            }

            if (
                currentUser.language &&
                user.language &&
                currentUser.language.toLowerCase() === user.language.toLowerCase()
            ) {
                score += 2;
            }

            const otherInterests = (user.interests || '')
                .toLowerCase()
                .split(',')
                .map(item => item.trim())
                .filter(Boolean);

            currentInterests.forEach(interest => {
                if (otherInterests.includes(interest)) {
                    score += 4;
                }
            });

            return {
                ...user,
                matchScore: score
            };
        });

        matches.sort((a, b) => b.matchScore - a.matchScore);

        res.render('matches', {
            currentUser,
            matches
        });
    } catch (error) {
        console.error(error);
        res.send('Could not load matches.');
    }
});

app.get("/categories", async (req, res) => {
    try {
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
        
        const [countriesData] = await db.query(`
            SELECT DISTINCT country FROM users WHERE country IS NOT NULL
        `);
        
        const countries = [];
        for (const c of countriesData) {
            const countryInfo = await getCountryInfo(c.country);
            countries.push({
                name: c.country,
                flag: null,
                postCount: 0
            });
        }
        
        const [postCounts] = await db.query(`
            SELECT country, COUNT(*) as count FROM posts GROUP BY country
        `);
        
        for (const country of countries) {
            const found = postCounts.find(p => p.country === country.name);
            country.postCount = found ? found.count : 0;
        }
        
        const tags = [
            { name: "food", count: 45 },
            { name: "traditions", count: 32 },
            { name: "language", count: 28 }
        ];
        
        res.render("categories", { categories, countries, tags });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error: " + err.message);
    }
});

app.get("/users", async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users");
        
        const usersWithFlags = [];
        for (const user of users) {
            const countryInfo = await getCountryInfo(user.country);
            usersWithFlags.push({
                ...user,
                flag: null,
                countryInfo: countryInfo
            });
        }
        
        res.render("users", { users: usersWithFlags });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error: " + err.message);
    }
});

app.get("/users/:id", async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
        if (users.length === 0) {
            return res.status(404).send("User not found");
        }
        
        const user = users[0];
        const countryInfo = await getCountryInfo(user.country);
        
        res.render("profile", { 
            user: user,
            countryInfo: countryInfo
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error: " + err.message);
    }
});

app.get("/posts", async (req, res) => {
    try {
        const [posts] = await db.query("SELECT * FROM posts");
        res.render("posts", { posts });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error: " + err.message);
    }
});

app.get("/posts/:id", async (req, res) => {
    try {
        const [posts] = await db.query("SELECT * FROM posts WHERE id = ?", [req.params.id]);
        if (posts.length === 0) {
            return res.status(404).send("Post not found");
        }
        
        const post = posts[0];
        let userRating = 0;
        
        if (req.session.user) {
            const [ratingResult] = await db.query(
                "SELECT rating FROM ratings WHERE user_id = ? AND post_id = ?",
                [req.session.user.id, req.params.id]
            );
            if (ratingResult.length > 0) {
                userRating = ratingResult[0].rating;
            }
        }
        
        post.userRating = userRating;
        
        res.render("post-detail", { post: post });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error: " + err.message);
    }
});

// MESSAGING SYSTEM 

// Open chat between users
app.get("/chat/:userId", requireLogin, async (req, res) => {
  try {
    const currentUserId = req.session.user.id;
    const otherUserId = req.params.userId;

    const [messages] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?)
       OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [currentUserId, otherUserId, otherUserId, currentUserId]
    );

    const [otherUser] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [otherUserId]
    );

    res.render("chat", {
      messages,
      otherUser: otherUser[0],
      currentUser: req.session.user
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading chat");
  }
});


// Send message
app.post("/chat/send", requireLogin, async (req, res) => {
  try {
    const senderId = req.session.user.id;
    const { receiver_id, content } = req.body;

    if (!content) {
      return res.send("Message cannot be empty");
    }

    await db.query(
      "INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)",
      [senderId, receiver_id, content]
    );

    res.redirect(`/chat/${receiver_id}`);

  } catch (err) {
    console.error(err);
    res.send("Error sending message");
  }
});

app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

// CHAT PAGE
app.get("/chat/:id", requireLogin, async (req, res) => {
  const otherUserId = req.params.id;

  res.render("chat", {
    otherUserId
  });
});

// SEND MESSAGE (temporary)
app.post("/chat/:id", requireLogin, (req, res) => {
  res.redirect(`/chat/${req.params.id}`);
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on http://localhost:3000");
});
