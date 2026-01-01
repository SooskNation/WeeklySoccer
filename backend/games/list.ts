import { api } from "encore.dev/api";
import db from "../db";

interface Game {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
  winner?: string;
  motmFinalized: boolean;
  motmPlayerName?: string;
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
      motm_finalized: boolean;
      motm_player_name: string | null;
    }>`
      SELECT 
        g.game_id, 
        to_char(g.game_date, 'YYYY-MM-DD') as game_date, 
        g.black_score, 
        g.white_score,
        COALESCE(g.motm_finalized, false) as motm_finalized,
        p.name as motm_player_name
      FROM games g
      LEFT JOIN game_stats gs ON g.game_id = gs.game_id AND gs.man_of_match = true
      LEFT JOIN players p ON gs.player_id = p.player_id
      ORDER BY g.game_date DESC
    `;

    const games = rows.map(row => ({
      id: row.game_id,
      date: row.game_date,
      blackScore: row.black_score,
      whiteScore: row.white_score,
      winner: row.black_score > row.white_score ? 'Black' :
              row.white_score > row.black_score ? 'White' : 'Draw',
      motmFinalized: row.motm_finalized,
      motmPlayerName: row.motm_player_name || undefined
    }));

    return { games };
  }
);
