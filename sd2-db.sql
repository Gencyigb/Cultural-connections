-- Use your database
USE sd2-db;

-- Drop tables if they exist
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    country VARCHAR(100),
    language VARCHAR(100),
    interests VARCHAR(100),
    bio TEXT
);

-- Create posts table
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200),
    country VARCHAR(100),
    content TEXT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample users
INSERT INTO users (name, country, language, interests, bio) VALUES
('Layla', 'Turkey', 'Turkish, English', 'Food, Festivals', 'Sharing Turkish traditions'),
('Oliver', 'UK', 'English', 'Tea, History', 'British culture lover'),
('Mei', 'China', 'Chinese, English', 'Calligraphy', 'Asian traditions'),
('Kai', 'Jamaica', 'English, Creole', 'Music', 'Caribbean culture'),
('Amara', 'Nigeria', 'English, Yoruba', 'Storytelling', 'African heritage');

-- Insert sample posts
INSERT INTO posts (title, country, content, user_id) VALUES
('Turkish Breakfast', 'Turkey', 'Olives and tea', 1),
('Diwali Festival', 'India', 'Festival of lights', 2),
('Chinese Tea', 'China', 'Tea rituals', 3),
('Caribbean Dance', 'Jamaica', 'Music culture', 4),
('African Clothing', 'Nigeria', 'Traditional fashion', 5);