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
    const authData = getAuthData();
    
    if (authData?.role !== "manager") {
      throw APIError.permissionDenied("only managers can submit game results");
    }

    if (!date) {
      throw APIError.invalidArgument("date is required");
    }

    if (blackScore === undefined || blackScore === null) {
      throw APIError.invalidArgument("blackScore is required");
    }

    if (whiteScore === undefined || whiteScore === null) {
      throw APIError.invalidArgument("whiteScore is required");
    }

    if (!stats || stats.length === 0) {
      throw APIError.invalidArgument("at least one player stat is required");
    }

    for (const stat of stats) {
      if (!stat.playerId) {
        throw APIError.invalidArgument("playerId is required for all stats");
      }
      if (!stat.team || !['Black', 'White'].includes(stat.team)) {
        throw APIError.invalidArgument("team must be either 'Black' or 'White'");
      }
    }

    const gameResult = await db.queryRow<{ game_id: number }>`
      INSERT INTO games (game_date, black_score, white_score)
      VALUES (${date}, ${blackScore}, ${whiteScore})
      RETURNING game_id
    `;

    const gameId = gameResult!.game_id;

    for (const stat of stats) {
      const ownGoals = stat.ownGoals || 0;
      const isCaptain = stat.isCaptain || false;
      await db.exec`
        INSERT INTO game_stats (game_id, player_id, team, goals, assists, own_goals, is_captain, clean_sheet, man_of_match)
        VALUES (${gameId}, ${stat.playerId}, ${stat.team}, ${stat.goals}, ${stat.assists}, 
                ${ownGoals}, ${isCaptain}, ${stat.cleanSheet}, false)
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
