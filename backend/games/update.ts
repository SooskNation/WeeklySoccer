import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface PlayerStat {
  playerId: number;
  team: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  manOfMatch: boolean;
}

interface UpdateGameParams {
  id: number;
  date?: string;
  blackScore?: number;
  whiteScore?: number;
  stats?: PlayerStat[];
}

interface Game {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
}

// Updates an existing game and its statistics.
export const update = api<UpdateGameParams, Game>(
  { auth: true, expose: true, method: "PUT", path: "/games/:id" },
  async ({ id, date, blackScore, whiteScore, stats }) => {
    const authData = getAuthData();
    
    if (authData?.role !== "manager") {
      throw APIError.permissionDenied("only managers can update game results");
    }

    const existing = await db.queryRow<{ game_id: number }>`
      SELECT game_id FROM games WHERE game_id = ${id}
    `;

    if (!existing) {
      throw APIError.notFound("game not found");
    }

    if (date || blackScore !== undefined || whiteScore !== undefined) {
      await db.exec`
        UPDATE games
        SET game_date = COALESCE(${date || null}, game_date),
            black_score = COALESCE(${blackScore ?? null}, black_score),
            white_score = COALESCE(${whiteScore ?? null}, white_score)
        WHERE game_id = ${id}
      `;
    }

    if (stats && stats.length > 0) {
      await db.exec`DELETE FROM game_stats WHERE game_id = ${id}`;

      for (const stat of stats) {
        await db.exec`
          INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match)
          VALUES (${id}, ${stat.playerId}, ${stat.team}, ${stat.goals}, ${stat.assists}, 
                  ${stat.cleanSheet}, ${stat.manOfMatch})
        `;
      }
    }

    const updated = await db.queryRow<{
      game_id: number;
      game_date: Date;
      black_score: number;
      white_score: number;
    }>`
      SELECT game_id, game_date, black_score, white_score
      FROM games
      WHERE game_id = ${id}
    `;

    return {
      id: updated!.game_id,
      date: updated!.game_date.toISOString().split('T')[0],
      blackScore: updated!.black_score,
      whiteScore: updated!.white_score
    };
  }
);
