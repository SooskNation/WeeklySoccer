import { api } from "encore.dev/api";
import db from "../db";

interface TopPlayerParams {
  limit?: number;
}

interface TopPlayer {
  playerId: number;
  playerName: string;
  value: number;
  gamesPlayed: number;
}

interface TopScorersResponse {
  players: TopPlayer[];
}

export const topScorers = api<TopPlayerParams, TopScorersResponse>(
  { expose: true, method: "GET", path: "/stats/top-scorers" },
  async ({ limit = 3 }) => {
    const rows = await db.queryAll<{
      player_id: number;
      player_name: string;
      total_goals: number;
      games_played: number;
    }>`
      SELECT 
        p.player_id,
        p.name as player_name,
        COALESCE(SUM(gs.goals), 0) as total_goals,
        COUNT(gs.stat_id) as games_played
      FROM players p
      LEFT JOIN game_stats gs ON p.player_id = gs.player_id
      GROUP BY p.player_id, p.name
      HAVING COALESCE(SUM(gs.goals), 0) > 0
      ORDER BY total_goals DESC
      LIMIT ${limit}
    `;

    const players = rows.map(row => ({
      playerId: row.player_id,
      playerName: row.player_name,
      value: Number(row.total_goals),
      gamesPlayed: Number(row.games_played)
    }));

    return { players };
  }
);

export const topAssisters = api<TopPlayerParams, TopScorersResponse>(
  { expose: true, method: "GET", path: "/stats/top-assisters" },
  async ({ limit = 3 }) => {
    const rows = await db.queryAll<{
      player_id: number;
      player_name: string;
      total_assists: number;
      games_played: number;
    }>`
      SELECT 
        p.player_id,
        p.name as player_name,
        COALESCE(SUM(gs.assists), 0) as total_assists,
        COUNT(gs.stat_id) as games_played
      FROM players p
      LEFT JOIN game_stats gs ON p.player_id = gs.player_id
      GROUP BY p.player_id, p.name
      HAVING COALESCE(SUM(gs.assists), 0) > 0
      ORDER BY total_assists DESC
      LIMIT ${limit}
    `;

    const players = rows.map(row => ({
      playerId: row.player_id,
      playerName: row.player_name,
      value: Number(row.total_assists),
      gamesPlayed: Number(row.games_played)
    }));

    return { players };
  }
);

export const topMOTM = api<TopPlayerParams, TopScorersResponse>(
  { expose: true, method: "GET", path: "/stats/top-motm" },
  async ({ limit = 3 }) => {
    const rows = await db.queryAll<{
      player_id: number;
      player_name: string;
      total_motm: number;
      games_played: number;
    }>`
      SELECT 
        p.player_id,
        p.name as player_name,
        COALESCE(SUM(CASE WHEN gs.man_of_match THEN 1 ELSE 0 END), 0) as total_motm,
        COUNT(gs.stat_id) as games_played
      FROM players p
      LEFT JOIN game_stats gs ON p.player_id = gs.player_id
      GROUP BY p.player_id, p.name
      HAVING COALESCE(SUM(CASE WHEN gs.man_of_match THEN 1 ELSE 0 END), 0) > 0
      ORDER BY total_motm DESC
      LIMIT ${limit}
    `;

    const players = rows.map(row => ({
      playerId: row.player_id,
      playerName: row.player_name,
      value: Number(row.total_motm),
      gamesPlayed: Number(row.games_played)
    }));

    return { players };
  }
);

export const topCleanSheets = api<TopPlayerParams, TopScorersResponse>(
  { expose: true, method: "GET", path: "/stats/top-clean-sheets" },
  async ({ limit = 3 }) => {
    const rows = await db.queryAll<{
      player_id: number;
      player_name: string;
      total_clean_sheets: number;
      games_played: number;
    }>`
      SELECT 
        p.player_id,
        p.name as player_name,
        COALESCE(SUM(CASE WHEN gs.clean_sheet THEN 1 ELSE 0 END), 0) as total_clean_sheets,
        COUNT(gs.stat_id) as games_played
      FROM players p
      LEFT JOIN game_stats gs ON p.player_id = gs.player_id
      GROUP BY p.player_id, p.name
      HAVING COALESCE(SUM(CASE WHEN gs.clean_sheet THEN 1 ELSE 0 END), 0) > 0
      ORDER BY total_clean_sheets DESC
      LIMIT ${limit}
    `;

    const players = rows.map(row => ({
      playerId: row.player_id,
      playerName: row.player_name,
      value: Number(row.total_clean_sheets),
      gamesPlayed: Number(row.games_played)
    }));

    return { players };
  }
);
