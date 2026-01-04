import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import db from "../db";

interface DeleteGameParams {
  id: number;
}

export const deleteGame = api<DeleteGameParams, { success: boolean }>(
  { auth: true, expose: true, method: "DELETE", path: "/games/:id" },
  async ({ id }) => {
    try {
      const authData = getAuthData();
      
      if (authData?.role !== "manager") {
        throw APIError.permissionDenied("only managers can delete games");
      }

      const existing = await db.queryRow<{ game_id: number }>`
        SELECT game_id FROM games WHERE game_id = ${id}
      `;

      if (!existing) {
        throw APIError.notFound("game not found");
      }

      await db.exec`DELETE FROM games WHERE game_id = ${id}`;

      return { success: true };
    } catch (error) {
      console.error("Error deleting game:", error);
      throw error;
    }
  }
);
