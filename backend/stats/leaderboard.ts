import { api } from "encore.dev/api";
import db from "../db";

interface PlayerStats {
  playerId: number;
  playerName: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  wins: number;
  draws: number;
  losses: number;
  motm: number;
  cleanSheets: number;
  winPercentage: number;
  totalPoints: number;
  pointsPerGame: number;
  last5: string[];
}

interface LeaderboardResponse {
  stats: PlayerStats[];
}

// Retrieves leaderboard with all player statistics.
export const leaderboard = api<void, LeaderboardResponse>(
  { expose: true, method: "GET", path: "/stats/leaderboard" },
  async () => {
    const rows = await db.queryAll<{
      player_id: number;
      player_name: string;
      games_played: number;
      total_goals: number;
      total_assists: number;
      total_motm: number;
      total_clean_sheets: number;
    }>`
      SELECT 
        p.player_id,
        p.name as player_name,
        COUNT(gs.stat_id) as games_played,
        COALESCE(SUM(gs.goals), 0) as total_goals,
        COALESCE(SUM(gs.assists), 0) as total_assists,
        COALESCE(SUM(CASE WHEN gs.man_of_match THEN 1 ELSE 0 END), 0) as total_motm,
        COALESCE(SUM(CASE WHEN gs.clean_sheet THEN 1 ELSE 0 END), 0) as total_clean_sheets
      FROM players p
      LEFT JOIN game_stats gs ON p.player_id = gs.player_id
      GROUP BY p.player_id, p.name
      ORDER BY total_goals DESC, games_played DESC
    `;

    const stats: PlayerStats[] = [];

    for (const row of rows) {
      const recordRow = await db.queryRow<{ total_wins: number; total_draws: number; total_losses: number }>`
        SELECT 
          COALESCE(SUM(CASE WHEN (gs.team = 'Black' AND g.black_score > g.white_score) 
                             OR (gs.team = 'White' AND g.white_score > g.black_score) 
                        THEN 1 ELSE 0 END), 0) as total_wins,
          COALESCE(SUM(CASE WHEN g.black_score = g.white_score THEN 1 ELSE 0 END), 0) as total_draws,
          COALESCE(SUM(CASE WHEN (gs.team = 'Black' AND g.black_score < g.white_score) 
                             OR (gs.team = 'White' AND g.white_score < g.black_score) 
                        THEN 1 ELSE 0 END), 0) as total_losses
        FROM game_stats gs
        JOIN games g ON gs.game_id = g.game_id
        WHERE gs.player_id = ${row.player_id}
      `;

      const last5Rows = await db.queryAll<{ result: string }>`
        SELECT 
          CASE 
            WHEN (gs.team = 'Black' AND g.black_score > g.white_score) 
              OR (gs.team = 'White' AND g.white_score > g.black_score) THEN 'W'
            WHEN g.black_score = g.white_score THEN 'D'
            ELSE 'L'
          END as result
        FROM game_stats gs
        JOIN games g ON gs.game_id = g.game_id
        WHERE gs.player_id = ${row.player_id}
        ORDER BY g.game_date DESC, g.game_id DESC
        LIMIT 5
      `;

      const gamesPlayed = Number(row.games_played);
      const wins = Number(recordRow?.total_wins || 0);
      const draws = Number(recordRow?.total_draws || 0);
      const losses = Number(recordRow?.total_losses || 0);
      const totalPoints = wins * 3 + draws * 1;
      const pointsPerGame = gamesPlayed > 0 ? Number((totalPoints / gamesPlayed).toFixed(2)) : 0;

      stats.push({
        playerId: row.player_id,
        playerName: row.player_name,
        gamesPlayed,
        goals: Number(row.total_goals),
        assists: Number(row.total_assists),
        wins,
        draws,
        losses,
        motm: Number(row.total_motm),
        cleanSheets: Number(row.total_clean_sheets),
        winPercentage: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
        totalPoints,
        pointsPerGame,
        last5: last5Rows.map(r => r.result)
      });
    }

    return { stats };
  }
);
