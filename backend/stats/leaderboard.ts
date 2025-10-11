import { api } from "encore.dev/api";
import db from "../db";

interface PlayerStats {
  playerId: number;
  playerName: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  wins: number;
  motm: number;
  cleanSheets: number;
  winPercentage: number;
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
      const winsRow = await db.queryRow<{ total_wins: number }>`
        SELECT COALESCE(COUNT(*), 0) as total_wins
        FROM game_stats gs
        JOIN games g ON gs.game_id = g.game_id
        WHERE gs.player_id = ${row.player_id}
          AND ((gs.team = 'Black' AND g.black_score > g.white_score)
            OR (gs.team = 'White' AND g.white_score > g.black_score))
      `;

      const gamesPlayed = Number(row.games_played);
      const wins = Number(winsRow?.total_wins || 0);

      stats.push({
        playerId: row.player_id,
        playerName: row.player_name,
        gamesPlayed,
        goals: Number(row.total_goals),
        assists: Number(row.total_assists),
        wins,
        motm: Number(row.total_motm),
        cleanSheets: Number(row.total_clean_sheets),
        winPercentage: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0
      });
    }

    return { stats };
  }
);
