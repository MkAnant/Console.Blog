CREATE TABLE Articles(
	id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	image VARCHAR(255),
	blog TEXT,
	author VARCHAR(255)
);