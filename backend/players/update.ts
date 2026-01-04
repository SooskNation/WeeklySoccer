import { api, APIError } from "encore.dev/api";
import db from "../db";

interface UpdatePlayerParams {
  id: number;
  name?: string;
  nickname?: string;
  profilePicture?: string;
}

interface Player {
  id: number;
  name: string;
  nickname?: string;
  profilePicture?: string;
}

// Updates a player's profile.
export const update = api<UpdatePlayerParams, Player>(
  { auth: true, expose: true, method: "PUT", path: "/players/:id" },
  async ({ id, name, nickname, profilePicture }) => {
    const existing = await db.queryRow<{ player_id: number }>`
      SELECT player_id FROM players WHERE player_id = ${id}
    `;

    if (!existing) {
      throw APIError.notFound("player not found");
    }

    await db.exec`
      UPDATE players
      SET name = COALESCE(${name}, name),
          nickname = COALESCE(${nickname}, nickname),
          profile_picture = COALESCE(${profilePicture}, profile_picture)
      WHERE player_id = ${id}
    `;

    const updated = await db.queryRow<{
      player_id: number;
      name: string;
      nickname: string | null;
      profile_picture: string | null;
    }>`
      SELECT player_id, name, nickname, profile_picture
      FROM players
      WHERE player_id = ${id}
    `;

    return {
      id: updated!.player_id,
      name: updated!.name,
      nickname: updated!.nickname || undefined,
      profilePicture: updated!.profile_picture || undefined
    };
  }
);
