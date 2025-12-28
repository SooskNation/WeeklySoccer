-- Add own_goals and is_captain columns to game_stats table
ALTER TABLE game_stats
ADD COLUMN own_goals INT NOT NULL DEFAULT 0,
ADD COLUMN is_captain BOOLEAN DEFAULT FALSE;
