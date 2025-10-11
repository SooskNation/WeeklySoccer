-- Insert dummy players
INSERT INTO players (name, nickname, role_id) VALUES
  ('Iman', 'Iman', 1),
  ('Hamed', 'Hamed', 1),
  ('Emad', 'Emad', 1),
  ('Abe', 'Abe', 1),
  ('Doc', 'Doc', 1),
  ('Hesam', 'Hesam', 1),
  ('Steve', 'Steve', 1);

-- Insert dummy games (5 games for various win scenarios)
INSERT INTO games (game_date, black_score, white_score) VALUES
  ('2025-01-01', 3, 2),
  ('2025-01-08', 2, 4),
  ('2025-01-15', 5, 3),
  ('2025-01-22', 1, 1),
  ('2025-01-29', 4, 2);

-- Insert dummy stats to match the provided table
-- Iman: 5 games, 1 goal, 1 assist, 2 wins, 1 MOTM
INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match) VALUES
  (1, 1, 'Black', 1, 0, FALSE, TRUE),
  (2, 1, 'White', 0, 1, FALSE, FALSE),
  (3, 1, 'Black', 0, 0, FALSE, FALSE),
  (4, 1, 'White', 0, 0, FALSE, FALSE),
  (5, 1, 'Black', 0, 0, FALSE, FALSE);

-- Hamed: 4 games, 1 goal, 2 assists, 2 wins
INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match) VALUES
  (1, 2, 'Black', 1, 1, FALSE, FALSE),
  (2, 2, 'White', 0, 1, FALSE, FALSE),
  (3, 2, 'Black', 0, 0, FALSE, FALSE),
  (5, 2, 'Black', 0, 0, FALSE, FALSE);

-- Emad: 6 games (would need 6 games, using available 5), 2 goals, 5 assists, 3 wins, 1 MOTM
INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match) VALUES
  (1, 3, 'Black', 1, 1, FALSE, FALSE),
  (2, 3, 'White', 0, 1, FALSE, FALSE),
  (3, 3, 'Black', 1, 2, FALSE, TRUE),
  (4, 3, 'White', 0, 1, FALSE, FALSE),
  (5, 3, 'Black', 0, 0, FALSE, FALSE);

-- Abe: 2 games, 0 goals, 1 assist, 2 wins, 1 clean sheet
INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match) VALUES
  (1, 4, 'Black', 0, 1, TRUE, FALSE),
  (5, 4, 'Black', 0, 0, FALSE, FALSE);

-- Doc: 10 games (using all 5 available games), 0 goals, 0 assists, 1 win
INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match) VALUES
  (1, 5, 'White', 0, 0, FALSE, FALSE),
  (2, 5, 'White', 0, 0, FALSE, FALSE),
  (3, 5, 'White', 0, 0, FALSE, FALSE),
  (4, 5, 'Black', 0, 0, FALSE, FALSE),
  (5, 5, 'White', 0, 0, FALSE, FALSE);

-- Hesam: 7 games, 0 goals, 1 assist, 3 wins
INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match) VALUES
  (1, 6, 'Black', 0, 0, FALSE, FALSE),
  (2, 6, 'White', 0, 0, FALSE, FALSE),
  (3, 6, 'Black', 0, 1, FALSE, FALSE),
  (4, 6, 'White', 0, 0, FALSE, FALSE),
  (5, 6, 'Black', 0, 0, FALSE, FALSE);

-- Steve: 3 games, 4 goals, 1 assist, 3 wins, 2 MOTM
INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match) VALUES
  (2, 7, 'White', 2, 0, FALSE, TRUE),
  (3, 7, 'Black', 2, 1, FALSE, TRUE),
  (5, 7, 'Black', 0, 0, FALSE, FALSE);
