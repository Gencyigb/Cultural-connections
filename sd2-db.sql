DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    language TEXT NOT NULL,
    interests TEXT NOT NULL,
    bio TEXT NOT NULL,
    profile_image TEXT
);

INSERT INTO users (name, country, language, interests, bio, profile_image) VALUES
('Layla', 'Turkey', 'Arabic, English', 'Food, Festivals, Traditions', 'I love sharing Turkish breakfast culture and traditions.', 'https://randomuser.me/api/portraits/women/1.jpg'),
('Oliver', 'United Kingdom', 'English', 'History, Tea Culture', 'Passionate about British traditions and historical culture.', 'https://randomuser.me/api/portraits/men/2.jpg'),
('Mei', 'China', 'Chinese, English', 'Calligraphy, Tea', 'I enjoy sharing Chinese traditions and cultural arts.', 'https://randomuser.me/api/portraits/women/3.jpg'),
('Kai', 'Jamaica', 'English, Creole', 'Music, Dance', 'Caribbean culture is vibrant and full of energy!', 'https://randomuser.me/api/portraits/men/4.jpg'),
('Amara', 'Nigeria', 'English, Yoruba', 'Storytelling, Fashion', 'African traditions and storytelling inspire me.', 'https://randomuser.me/api/portraits/women/5.jpg');
