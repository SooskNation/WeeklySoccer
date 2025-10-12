import { api, Cookie } from "encore.dev/api";
import db from "../db";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  session: Cookie<"session">;
  role: "player" | "manager";
  playerID?: number;
}

export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const user = await db.queryRow`
      SELECT id, username, role, player_id 
      FROM users 
      WHERE username = ${req.username} AND password = ${req.password}
    `;

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = `${req.username}:${req.password}`;

    return {
      session: {
        value: token,
        expires: new Date(Date.now() + 3600 * 24 * 30),
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
      role: user.role,
      playerID: user.player_id,
    };
  }
);
