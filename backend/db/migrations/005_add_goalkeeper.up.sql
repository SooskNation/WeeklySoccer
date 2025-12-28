-- Add is_goalkeeper column to game_stats table
ALTER TABLE game_stats
ADD COLUMN is_goalkeeper BOOLEAN DEFAULT FALSE;
