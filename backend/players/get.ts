import { api, APIError } from "encore.dev/api";
import db from "../db";

interface GetPlayerParams {
  id: number;
}

interface Player {
  id: number;
  userId?: string;
  name: string;
  nickname?: string;
  profilePicture?: string;
  role: string;
}

// Retrieves a player by ID.
export const get = api<GetPlayerParams, Player>(
  { expose: true, method: "GET", path: "/players/:id" },
  async ({ id }) => {
    const row = await db.queryRow<{
      player_id: number;
      user_id: string | null;
      name: string;
      nickname: string | null;
      profile_picture: string | null;
      role_name: string;
    }>`
      SELECT p.player_id, p.user_id, p.name, p.nickname, p.profile_picture, r.role_name
      FROM players p
      LEFT JOIN roles r ON p.role_id = r.role_id
      WHERE p.player_id = ${id}
    `;

    if (!row) {
      throw APIError.notFound("player not found");
    }

    return {
      id: row.player_id,
      userId: row.user_id || undefined,
      name: row.name,
      nickname: row.nickname || undefined,
      profilePicture: row.profile_picture || undefined,
      role: row.role_name
    };
  }
);
