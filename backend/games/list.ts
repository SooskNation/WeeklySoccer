import { api } from "encore.dev/api";
import db from "../db";

interface Game {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
  winner?: string;
}

interface ListGamesResponse {
  games: Game[];
}

// Lists all games ordered by date descending.
export const list = api<void, ListGamesResponse>(
  { expose: true, method: "GET", path: "/games" },
  async () => {
    const rows = await db.queryAll<{
      game_id: number;
      game_date: string;
      black_score: number;
      white_score: number;
    }>`
      SELECT game_id, game_date, black_score, white_score
      FROM games
      ORDER BY game_date DESC
    `;

    const games = rows.map(row => ({
      id: row.game_id,
      date: row.game_date,
      blackScore: row.black_score,
      whiteScore: row.white_score,
      winner: row.black_score > row.white_score ? 'Black' :
              row.white_score > row.black_score ? 'White' : 'Draw'
    }));

    return { games };
  }
);
