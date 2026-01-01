import { api, APIError } from "encore.dev/api";
import db from "../db";

interface FinalizeVotingParams {
  gameId: number;
}

interface FinalizeVotingResponse {
  success: boolean;
  motmPlayerId: number;
  motmPlayerName: string;
}

export const finalize = api<FinalizeVotingParams, FinalizeVotingResponse>(
  { expose: true, method: "POST", path: "/votes/:gameId/finalize", auth: true },
  async ({ gameId }) => {
    const game = await db.queryRow<{ game_id: number }>`
      SELECT game_id FROM games WHERE game_id = ${gameId}
    `;

    if (!game) {
      throw APIError.notFound("game not found");
    }

    const topPlayer = await db.queryRow<{
      player_id: number;
      player_name: string;
      total_points: number;
    }>`
      SELECT 
        p.player_id,
        p.name as player_name,
        COALESCE(SUM(CASE WHEN v.first_choice = p.player_id THEN 3 ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN v.second_choice = p.player_id THEN 2 ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN v.third_choice = p.player_id THEN 1 ELSE 0 END), 0) as total_points
      FROM players p
      LEFT JOIN votes v ON (v.first_choice = p.player_id OR v.second_choice = p.player_id OR v.third_choice = p.player_id)
        AND v.game_id = ${gameId}
      GROUP BY p.player_id, p.name
      HAVING SUM(CASE WHEN v.first_choice = p.player_id OR v.second_choice = p.player_id OR v.third_choice = p.player_id THEN 1 ELSE 0 END) > 0
      ORDER BY total_points DESC
      LIMIT 1
    `;

    if (!topPlayer) {
      throw APIError.invalidArgument("no votes found for this game");
    }

    await db.exec`
      UPDATE game_stats
      SET man_of_match = CASE WHEN player_id = ${topPlayer.player_id} THEN TRUE ELSE FALSE END
      WHERE game_id = ${gameId}
    `;

    await db.exec`
      UPDATE games
      SET motm_finalized = TRUE
      WHERE game_id = ${gameId}
    `;

    return {
      success: true,
      motmPlayerId: topPlayer.player_id,
      motmPlayerName: topPlayer.player_name
    };
  }
);
