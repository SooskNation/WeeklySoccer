import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetPlayerStatsParams {
  id: number;
}

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

// Retrieves aggregated statistics for a player.
export const playerStats = api<GetPlayerStatsParams, PlayerStats>(
  { expose: true, method: "GET", path: "/stats/player/:id" },
  async ({ id }) => {
    const player = await db.queryRow<{ player_id: number; name: string }>`
      SELECT player_id, name FROM players WHERE player_id = ${id}
    `;

    if (!player) {
      throw APIError.notFound("player not found");
    }

    const stats = await db.queryRow<{
      games_played: number;
      total_goals: number;
      total_assists: number;
      total_motm: number;
      total_clean_sheets: number;
    }>`
      SELECT 
        COUNT(*) as games_played,
        COALESCE(SUM(goals), 0) as total_goals,
        COALESCE(SUM(assists), 0) as total_assists,
        COALESCE(SUM(CASE WHEN man_of_match THEN 1 ELSE 0 END), 0) as total_motm,
        COALESCE(SUM(CASE WHEN clean_sheet THEN 1 ELSE 0 END), 0) as total_clean_sheets
      FROM game_stats
      WHERE player_id = ${id}
    `;

    const winsRow = await db.queryRow<{ total_wins: number }>`
      SELECT COALESCE(COUNT(*), 0) as total_wins
      FROM game_stats gs
      JOIN games g ON gs.game_id = g.game_id
      WHERE gs.player_id = ${id}
        AND ((gs.team = 'Black' AND g.black_score > g.white_score)
          OR (gs.team = 'White' AND g.white_score > g.black_score))
    `;

    const gamesPlayed = Number(stats?.games_played || 0);
    const wins = Number(winsRow?.total_wins || 0);

    return {
      playerId: player.player_id,
      playerName: player.name,
      gamesPlayed,
      goals: Number(stats?.total_goals || 0),
      assists: Number(stats?.total_assists || 0),
      wins,
      motm: Number(stats?.total_motm || 0),
      cleanSheets: Number(stats?.total_clean_sheets || 0),
      winPercentage: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0
    };
  }
);
