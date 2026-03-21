DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS posts;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    country TEXT,
    language TEXT,
    interests TEXT,
    bio TEXT
);

CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    country TEXT,
    content TEXT,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT INTO users (name, country, language, interests, bio) VALUES
('Layla', 'Turkey', 'Arabic, English', 'Food, Festivals', 'Sharing Turkish traditions'),
('Oliver', 'UK', 'English', 'History, Tea', 'British culture lover'),
('Mei', 'China', 'Chinese, English', 'Calligraphy', 'Asian traditions'),
('Kai', 'Jamaica', 'English, Creole', 'Music', 'Caribbean culture'),
('Amara', 'Nigeria', 'English, Yoruba', 'Storytelling', 'African heritage');

INSERT INTO posts (title, country, content, user_id) VALUES
('Turkish Breakfast', 'Turkey', 'Olives, cheese and tea', 1),
('Diwali Festival', 'India', 'Festival of lights', 2),
('Chinese Tea Culture', 'China', 'Traditional tea rituals', 3),
('Caribbean Dance', 'Jamaica', 'Music and movement', 4),
('African Clothing', 'Nigeria', 'Traditional fashion styles', 5);
