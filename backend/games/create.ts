import { api } from "encore.dev/api";
import db from "../db";

interface PlayerStat {
  playerId: number;
  team: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  manOfMatch: boolean;
}

interface CreateGameParams {
  date: string;
  blackScore: number;
  whiteScore: number;
  stats: PlayerStat[];
}

interface Game {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
}

// Creates a new game with player statistics.
export const create = api<CreateGameParams, Game>(
  { auth: true, expose: true, method: "POST", path: "/games" },
  async ({ date, blackScore, whiteScore, stats }) => {
    const gameResult = await db.queryRow<{ game_id: number }>`
      INSERT INTO games (game_date, black_score, white_score)
      VALUES (${date}, ${blackScore}, ${whiteScore})
      RETURNING game_id
    `;

    const gameId = gameResult!.game_id;

    for (const stat of stats) {
      await db.exec`
        INSERT INTO game_stats (game_id, player_id, team, goals, assists, clean_sheet, man_of_match)
        VALUES (${gameId}, ${stat.playerId}, ${stat.team}, ${stat.goals}, ${stat.assists}, 
                ${stat.cleanSheet}, ${stat.manOfMatch})
      `;
    }

    return {
      id: gameId,
      date,
      blackScore,
      whiteScore
    };
  }
);
