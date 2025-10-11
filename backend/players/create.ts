import { api, APIError } from "encore.dev/api";
import db from "../db";

interface CreatePlayerParams {
  name: string;
  nickname?: string;
  userId?: string;
  roleName: string;
}

interface Player {
  id: number;
  userId?: string;
  name: string;
  nickname?: string;
  role: string;
}

// Creates a new player.
export const create = api<CreatePlayerParams, Player>(
  { expose: true, method: "POST", path: "/players" },
  async ({ name, nickname, userId, roleName }) => {
    const role = await db.queryRow<{ role_id: number }>`
      SELECT role_id FROM roles WHERE role_name = ${roleName}
    `;

    if (!role) {
      throw APIError.invalidArgument("invalid role name");
    }

    const existing = userId ? await db.queryRow<{ player_id: number }>`
      SELECT player_id FROM players WHERE user_id = ${userId}
    ` : null;

    if (existing) {
      throw APIError.alreadyExists("player with this user_id already exists");
    }

    const result = await db.queryRow<{ player_id: number }>`
      INSERT INTO players (name, nickname, user_id, role_id)
      VALUES (${name}, ${nickname || null}, ${userId || null}, ${role.role_id})
      RETURNING player_id
    `;

    return {
      id: result!.player_id,
      userId: userId || undefined,
      name,
      nickname: nickname || undefined,
      role: roleName
    };
  }
);
