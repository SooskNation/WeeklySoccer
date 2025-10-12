import { Header, Cookie, APIError, Gateway } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import db from "../db";

interface AuthParams {
  authorization?: Header<"Authorization">;
  session?: Cookie<"session">;
}

export interface AuthData {
  userID: string;
  username: string;
  role: "player" | "manager";
  playerID: number | null;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (data) => {
    let token = data.authorization?.replace("Bearer ", "");
    if (!token) {
      token = data.session?.value;
    }
    if (!token) {
      throw APIError.unauthenticated("missing token");
    }

    try {
      const parts = token.split(":");
      if (parts.length !== 2) {
        throw APIError.unauthenticated("invalid token format");
      }

      const [username, password] = parts;
      
      const user = await db.queryRow`
        SELECT id, username, role, player_id 
        FROM users 
        WHERE username = ${username} AND password = ${password}
      `;

      if (!user) {
        throw APIError.unauthenticated("invalid credentials");
      }

      return {
        userID: user.id.toString(),
        username: user.username,
        role: user.role,
        playerID: user.player_id,
      };
    } catch (err) {
      throw APIError.unauthenticated("invalid token", err as Error);
    }
  }
);

export const gw = new Gateway({ authHandler: auth });
