DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    language VARCHAR(150) NOT NULL,
    interests VARCHAR(255) NOT NULL,
    bio TEXT NOT NULL,
    PRIMARY KEY (id)
);

INSERT INTO users (name, country, language, interests, bio) VALUES
('Layla', 'Middle Eastern Culture', 'Arabic, English', 'Traditional food, cultural festivals, music', 'I enjoy sharing Middle Eastern traditions, food, and cultural celebrations.'),
('Oliver', 'British Culture', 'English', 'History, tea culture, literature', 'I enjoy discussing British traditions, historical sites, and cultural heritage.'),
('Mei', 'Asian Culture', 'Chinese, English', 'Tea culture, calligraphy, traditional festivals', 'I enjoy sharing Asian traditions and learning about cultures from around the world.'),
('Kai', 'Caribbean Culture', 'English, Creole', 'Music, dance, Caribbean festivals', 'Caribbean culture is vibrant with music and festivals that I love sharing.'),
('Amara', 'African Culture', 'English, Yoruba', 'Traditional clothing, storytelling, festivals', 'I enjoy sharing African traditions, storytelling, and cultural celebrations.');
