CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('player', 'manager')),
  player_id INTEGER REFERENCES players(player_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, role) VALUES ('admin', 'admin', 'manager');
INSERT INTO users (username, password, role, player_id) VALUES ('player', 'player', 'player', 1);
