import { api, APIError } from "encore.dev/api";
import db from "../db";

interface DeletePlayerParams {
  id: number;
}

interface DeletePlayerResponse {
  success: boolean;
}

export const deletePlayer = api<DeletePlayerParams, DeletePlayerResponse>(
  { auth: true, expose: true, method: "DELETE", path: "/players/:id" },
  async ({ id }) => {
    const existing = await db.queryRow<{ player_id: number }>`
      SELECT player_id FROM players WHERE player_id = ${id}
    `;

    if (!existing) {
      throw APIError.notFound("player not found");
    }

    await db.exec`
      DELETE FROM players WHERE player_id = ${id}
    `;

    return { success: true };
  }
);
