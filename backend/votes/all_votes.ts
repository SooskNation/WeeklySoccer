import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetAllVotesParams {
  gameId: number;
}

interface VoteDetail {
  voteId: number;
  firstChoice: string;
  secondChoice: string | null;
  thirdChoice: string | null;
  createdAt: Date;
}

interface AllVotesResponse {
  votes: VoteDetail[];
  aggregate: {
    playerId: number;
    playerName: string;
    firstChoiceVotes: number;
    secondChoiceVotes: number;
    thirdChoiceVotes: number;
    totalPoints: number;
  }[];
}

export const allVotes = api<GetAllVotesParams, AllVotesResponse>(
  { expose: true, method: "GET", path: "/votes/:gameId/all" },
  async ({ gameId }) => {
    const game = await db.queryRow<{ game_id: number }>`
      SELECT game_id FROM games WHERE game_id = ${gameId}
    `;

    if (!game) {
      throw APIError.notFound("game not found");
    }

    const voteRows = await db.queryAll<{
      vote_id: number;
      first_choice_name: string;
      second_choice_name: string | null;
      third_choice_name: string | null;
      created_at: Date;
    }>`
      SELECT 
        v.vote_id,
        p1.name as first_choice_name,
        p2.name as second_choice_name,
        p3.name as third_choice_name,
        v.created_at
      FROM votes v
      LEFT JOIN players p1 ON v.first_choice = p1.player_id
      LEFT JOIN players p2 ON v.second_choice = p2.player_id
      LEFT JOIN players p3 ON v.third_choice = p3.player_id
      WHERE v.game_id = ${gameId}
      ORDER BY v.created_at DESC
    `;

    const votes: VoteDetail[] = voteRows.map(row => ({
      voteId: row.vote_id,
      firstChoice: row.first_choice_name,
      secondChoice: row.second_choice_name,
      thirdChoice: row.third_choice_name,
      createdAt: row.created_at,
    }));

    const aggregateRows = await db.queryAll<{
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

    const aggregate = aggregateRows.map(row => ({
      playerId: row.player_id,
      playerName: row.player_name,
      firstChoiceVotes: Number(row.first_choice_votes),
      secondChoiceVotes: Number(row.second_choice_votes),
      thirdChoiceVotes: Number(row.third_choice_votes),
      totalPoints: Number(row.first_choice_votes) * 3 + 
                   Number(row.second_choice_votes) * 2 + 
                   Number(row.third_choice_votes)
    }));

    return { votes, aggregate };
  }
);
