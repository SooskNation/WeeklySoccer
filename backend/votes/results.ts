import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetVoteResultsParams {
  gameId: number;
}

interface VoteResult {
  playerId: number;
  playerName: string;
  firstChoiceVotes: number;
  secondChoiceVotes: number;
  thirdChoiceVotes: number;
  totalPoints: number;
}

interface VoteResultsResponse {
  results: VoteResult[];
}

// Retrieves voting results for a game (3 points for 1st, 2 for 2nd, 1 for 3rd).
export const results = api<GetVoteResultsParams, VoteResultsResponse>(
  { expose: true, method: "GET", path: "/votes/:gameId" },
  async ({ gameId }) => {
    const game = await db.queryRow<{ game_id: number }>`
      SELECT game_id FROM games WHERE game_id = ${gameId}
    `;

    if (!game) {
      throw APIError.notFound("game not found");
    }

    const rows = await db.queryAll<{
      player_id: number;
      player_name: string;
      first_choice_votes: number;
      second_choice_votes: number;
      third_choice_votes: number;
    }>`
      SELECT 
        p.player_id,
        p.name as player_name,
        COALESCE(SUM(CASE WHEN v.first_choice = p.player_id THEN 1 ELSE 0 END), 0) as first_choice_votes,
        COALESCE(SUM(CASE WHEN v.second_choice = p.player_id THEN 1 ELSE 0 END), 0) as second_choice_votes,
        COALESCE(SUM(CASE WHEN v.third_choice = p.player_id THEN 1 ELSE 0 END), 0) as third_choice_votes
      FROM players p
      LEFT JOIN votes v ON (v.first_choice = p.player_id OR v.second_choice = p.player_id OR v.third_choice = p.player_id)
        AND v.game_id = ${gameId}
      GROUP BY p.player_id, p.name
      HAVING SUM(CASE WHEN v.first_choice = p.player_id OR v.second_choice = p.player_id OR v.third_choice = p.player_id THEN 1 ELSE 0 END) > 0
      ORDER BY (COALESCE(SUM(CASE WHEN v.first_choice = p.player_id THEN 3 ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN v.second_choice = p.player_id THEN 2 ELSE 0 END), 0) +
                COALESCE(SUM(CASE WHEN v.third_choice = p.player_id THEN 1 ELSE 0 END), 0)) DESC
    `;

    const results = rows.map(row => ({
      playerId: row.player_id,
      playerName: row.player_name,
      firstChoiceVotes: Number(row.first_choice_votes),
      secondChoiceVotes: Number(row.second_choice_votes),
      thirdChoiceVotes: Number(row.third_choice_votes),
      totalPoints: Number(row.first_choice_votes) * 3 + 
                   Number(row.second_choice_votes) * 2 + 
                   Number(row.third_choice_votes)
    }));

    return { results };
  }
);
