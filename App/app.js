const express = require("express");
const app = express();
const db = require('./Services/db');

// ===== NEW: Import fetch for API calls =====
const fetch = require('node-fetch');

// Set view engine
app.set("view engine", "pug");
app.set("views", "./views");

// Static files (CSS etc)
app.use(express.static("public"));

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
app.get("/", async (req, res) => {
    res.render("index", { title: "Home" });
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

/* -----------------------------
   SERVER START
--------------------------------*/

app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on http://localhost:3000");
});