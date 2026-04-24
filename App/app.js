const express = require("express");
const app = express();
const db = require('./services/db');
const session = require('express-session');
const bcrypt = require('bcrypt');

// ===== NEW: Import fetch for API calls =====
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Set view engine
app.set("view engine", "pug");
app.set("views", "./views");

// Static files (CSS etc)
app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'cultural_connections_secret',
    resave: false,
    saveUninitialized: false
}))

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next(); 
}
/* -----------------------------
   HELPER FUNCTION - GET COUNTRY INFO FROM API
--------------------------------*/

// ===== NEW: Function to fetch country data from Rest Countries API =====
async function getCountryInfo(countryName) {
    try {
        // Handle common country name variations
        const countryMap = {
            'UK': 'United Kingdom',
            'USA': 'United States',
            'UAE': 'United Arab Emirates'
        };
        
        const searchName = countryMap[countryName] || countryName;
        
        // Call the Rest Countries API
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(searchName)}`);
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            return null;
        }
        
        const country = data[0];
        
        // Extract only the information we need
        return {
            name: country.name.common,
            flag: country.flags?.png || country.flags?.svg || null,
            flagAlt: country.flags?.alt || `Flag of ${country.name.common}`,
            capital: country.capital ? country.capital[0] : 'N/A',
            population: country.population ? country.population.toLocaleString() : 'N/A',
            currency: country.currencies ? Object.values(country.currencies)[0].name : 'N/A',
            region: country.region || 'N/A',
            maps: country.maps?.googleMaps || null
        };
    } catch (error) {
        console.error(`Error fetching country info for ${countryName}:`, error.message);
        return null;
    }
}

/* -----------------------------
   ROUTES
--------------------------------*/

// Homepage 
app.get("/dashboard", requireLogin, async (req, res) => {
    res.render('Dashboard', { user: req.session.user });

});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/register", (req, res) => {
  res.render("register");
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
            return res.send("Rating must be between 1 and 5.");
        }

        await db.query(
            `INSERT INTO ratings (user_id, post_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
            [userId, post_id, numericRating]
        );

        await db.query(
            "UPDATE users SET points = points + 5 WHERE id = ?",
            [userId]
        );

        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.send("Could not save rating.");
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

// Categories page
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
        
        // ===== NEW: Fetch flags for each country from API =====
        const countries = [];
        for (const c of countriesData) {
            const countryInfo = await getCountryInfo(c.country);
            countries.push({
                name: c.country,
                flag: countryInfo?.flag || '🌍',
                postCount: 0
            });
        }
        
        // Get post counts per country
        const [postCounts] = await db.query(`
            SELECT country, COUNT(*) as count FROM posts GROUP BY country
        `);
        
        // Update post counts
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

// Users list page - WITH FLAGS FROM API
app.get("/users", async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users");
        
        // ===== NEW: Fetch flag for each user from API =====
        const usersWithFlags = [];
        for (const user of users) {
            const countryInfo = await getCountryInfo(user.country);
            usersWithFlags.push({
                ...user,
                flag: countryInfo?.flag || null,
                countryInfo: countryInfo
            });
        }
        
        res.render("users", { users: usersWithFlags });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error: " + err.message);
    }
});

// Single user profile - WITH FULL COUNTRY INFO FROM API
app.get("/users/:id", async (req, res) => {
    try {
        const [users] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
        if (users.length === 0) {
            return res.status(404).send("User not found");
        }
        
        const user = users[0];
        
        // ===== NEW: Fetch detailed country information from API =====
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

// Posts list page
app.get("/posts", async (req, res) => {
    try {
        const [posts] = await db.query("SELECT * FROM posts");
        res.render("posts", { posts });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error: " + err.message);
    }
});

// Single post detail page
app.get("/posts/:id", async (req, res) => {
    try {
        const [posts] = await db.query("SELECT * FROM posts WHERE id = ?", [req.params.id]);
        if (posts.length === 0) {
            return res.status(404).send("Post not found");
        }
        res.render("post-detail", { post: posts[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error: " + err.message);
    }
});

// ===== PUBLIC HOMEPAGE - No login required =====
app.get("/", (req, res) => {
    res.render("index", { title: "Home" });
});

/* -----------------------------
   SERVER START
--------------------------------*/

app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on http://localhost:3000");
});
