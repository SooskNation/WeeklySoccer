import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface PlayerStat {
  playerId: number;
  team: string;
  goals: number;
  assists: number;
  ownGoals: number;
  isGoalkeeper: boolean;
  isCaptain: boolean;
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
    try {
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
        const dateValue = date ? date : null;
        const blackScoreValue = blackScore !== undefined ? blackScore : null;
        const whiteScoreValue = whiteScore !== undefined ? whiteScore : null;
        
        await db.exec`
          UPDATE games
          SET game_date = COALESCE(${dateValue}, game_date),
              black_score = COALESCE(${blackScoreValue}, black_score),
              white_score = COALESCE(${whiteScoreValue}, white_score)
          WHERE game_id = ${id}
        `;
      }

      if (stats && stats.length > 0) {
        await db.exec`DELETE FROM game_stats WHERE game_id = ${id}`;

        for (const stat of stats) {
          const ownGoals = stat.ownGoals || 0;
          const isGoalkeeper = stat.isGoalkeeper ?? false;
          const isCaptain = stat.isCaptain ?? false;
          const cleanSheet = stat.cleanSheet ?? false;
          const manOfMatch = stat.manOfMatch ?? false;
          
          await db.exec`
            INSERT INTO game_stats (game_id, player_id, team, goals, assists, own_goals, is_goalkeeper, is_captain, clean_sheet, man_of_match)
            VALUES (${id}, ${stat.playerId}, ${stat.team}, ${stat.goals}, ${stat.assists}, 
                    ${ownGoals}, ${isGoalkeeper}, ${isCaptain}, ${cleanSheet}, ${manOfMatch})
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
    } catch (error) {
      console.error("Error updating game:", error);
      throw error;
    }
  }
);
