import { api } from "encore.dev/api";
import db from "../db";

interface Player {
  id: number;
  userId?: string;
  name: string;
  nickname?: string;
  profilePicture?: string;
  role: string;
}

interface ListPlayersResponse {
  players: Player[];
}

// Lists all players.
export const list = api<void, ListPlayersResponse>(
  { expose: true, method: "GET", path: "/players" },
  async () => {
    const rows = await db.queryAll<{
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
      ORDER BY p.name
    `;

    const players = rows.map(row => ({
      id: row.player_id,
      userId: row.user_id || undefined,
      name: row.name,
      nickname: row.nickname || undefined,
      profilePicture: row.profile_picture || undefined,
      role: row.role_name
    }));

    return { players };
  }
);
