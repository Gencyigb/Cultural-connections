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
('Sofia Martinez', 'Spain', 'Spanish, English', 'Food, Travel, Festivals', 'I enjoy sharing Spanish culture and learning about traditions from other countries.'),
('Ahmed Hassan', 'Egypt', 'Arabic, English', 'History, Music, Culture', 'I love discussing Egyptian history, cultural traditions, and meeting new people.'),
('Mei Lin', 'China', 'Chinese, English', 'Art, Tea Culture, Calligraphy', 'I enjoy sharing Chinese traditions and learning about cultures around the world.'),
('Lucas Silva', 'Brazil', 'Portuguese, English', 'Football, Music, Dance', 'Brazilian culture is full of energy, music, and celebration, which I love to share.'),
('Anna Schmidt', 'Germany', 'German, English', 'Travel, Technology, Food', 'I like learning about new cultures and exchanging ideas with people from different backgrounds.');
