-- Roles table
CREATE TABLE roles (
  role_id BIGSERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Players table
CREATE TABLE players (
  player_id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  nickname VARCHAR(255),
  profile_picture TEXT,
  role_id BIGINT REFERENCES roles(role_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  game_id BIGSERIAL PRIMARY KEY,
  game_date DATE NOT NULL,
  black_score INT NOT NULL DEFAULT 0,
  white_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game stats table
CREATE TABLE game_stats (
  stat_id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(game_id) ON DELETE CASCADE,
  player_id BIGINT REFERENCES players(player_id) ON DELETE CASCADE,
  team VARCHAR(10) NOT NULL CHECK (team IN ('Black', 'White')),
  goals INT NOT NULL DEFAULT 0,
  assists INT NOT NULL DEFAULT 0,
  clean_sheet BOOLEAN DEFAULT FALSE,
  man_of_match BOOLEAN DEFAULT FALSE
);

-- Votes table
CREATE TABLE votes (
  vote_id BIGSERIAL PRIMARY KEY,
  game_id BIGINT REFERENCES games(game_id) ON DELETE CASCADE,
  voter_id BIGINT REFERENCES players(player_id) ON DELETE CASCADE,
  first_choice BIGINT REFERENCES players(player_id),
  second_choice BIGINT REFERENCES players(player_id),
  third_choice BIGINT REFERENCES players(player_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, voter_id)
);

-- Insert default roles
INSERT INTO roles (role_name) VALUES ('Player'), ('Manager');
