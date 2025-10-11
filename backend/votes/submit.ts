import { api, APIError } from "encore.dev/api";
import db from "../db";

interface SubmitVoteParams {
  gameId: number;
  voterId: number;
  firstChoice: number;
  secondChoice?: number;
  thirdChoice?: number;
}

interface VoteResponse {
  message: string;
}

// Submits a vote for Man of the Match.
export const submit = api<SubmitVoteParams, VoteResponse>(
  { auth: true, expose: true, method: "POST", path: "/votes" },
  async ({ gameId, voterId, firstChoice, secondChoice, thirdChoice }) => {
    const game = await db.queryRow<{ game_id: number }>`
      SELECT game_id FROM games WHERE game_id = ${gameId}
    `;

    if (!game) {
      throw APIError.notFound("game not found");
    }

    const existing = await db.queryRow<{ vote_id: number }>`
      SELECT vote_id FROM votes WHERE game_id = ${gameId} AND voter_id = ${voterId}
    `;

    if (existing) {
      await db.exec`
        UPDATE votes
        SET first_choice = ${firstChoice},
            second_choice = ${secondChoice || null},
            third_choice = ${thirdChoice || null}
        WHERE vote_id = ${existing.vote_id}
      `;
    } else {
      await db.exec`
        INSERT INTO votes (game_id, voter_id, first_choice, second_choice, third_choice)
        VALUES (${gameId}, ${voterId}, ${firstChoice}, ${secondChoice || null}, ${thirdChoice || null})
      `;
    }

    return { message: "Vote submitted successfully" };
  }
);
