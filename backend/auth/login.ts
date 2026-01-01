import { api, Cookie } from "encore.dev/api";
import db from "../db";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  session: Cookie<"session">;
  token: string;
  role: "player" | "manager";
  playerID?: number;
}

export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const user = await db.queryRow`
      SELECT id, username, role, player_id 
      FROM users 
      WHERE LOWER(username) = LOWER(${req.username}) AND LOWER(password) = LOWER(${req.password})
    `;

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = `${req.username}:${req.password}`;

    return {
      session: {
        value: token,
        expires: new Date(Date.now() + 3600 * 1000 * 24 * 30),
        httpOnly: true,
        secure: true,
        sameSite: "None",
        domain: ".lp.dev",
      },
      token,
      role: user.role,
      playerID: user.player_id,
    };
  }
);
