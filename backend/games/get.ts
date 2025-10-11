import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetGameParams {
  id: number;
}

interface PlayerStat {
  playerId: number;
  playerName: string;
  team: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  manOfMatch: boolean;
}

interface Game {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
  winner?: string;
  stats: PlayerStat[];
}

// Retrieves a game with all player statistics.
export const get = api<GetGameParams, Game>(
  { expose: true, method: "GET", path: "/games/:id" },
  async ({ id }) => {
    const game = await db.queryRow<{
      game_id: number;
      game_date: Date;
      black_score: number;
      white_score: number;
    }>`
      SELECT game_id, game_date, black_score, white_score
      FROM games
      WHERE game_id = ${id}
    `;

    if (!game) {
      throw APIError.notFound("game not found");
    }

    const statsRows = await db.queryAll<{
      player_id: number;
      player_name: string;
      team: string;
      goals: number;
      assists: number;
      clean_sheet: boolean;
      man_of_match: boolean;
    }>`
      SELECT gs.player_id, p.name as player_name, gs.team, gs.goals, gs.assists, 
             gs.clean_sheet, gs.man_of_match
      FROM game_stats gs
      JOIN players p ON gs.player_id = p.player_id
      WHERE gs.game_id = ${id}
      ORDER BY gs.team, p.name
    `;

    return {
      id: game.game_id,
      date: game.game_date.toISOString().split('T')[0],
      blackScore: game.black_score,
      whiteScore: game.white_score,
      winner: game.black_score > game.white_score ? 'Black' :
              game.white_score > game.black_score ? 'White' : 'Draw',
      stats: statsRows.map(row => ({
        playerId: row.player_id,
        playerName: row.player_name,
        team: row.team,
        goals: row.goals,
        assists: row.assists,
        cleanSheet: row.clean_sheet,
        manOfMatch: row.man_of_match
      }))
    };
  }
);
