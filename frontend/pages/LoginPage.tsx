import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import backend from "~backend/client";

interface LoginPageProps {
  onLogin: (role: "player" | "manager", playerID?: number) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await backend.auth.login({ username, password });
      localStorage.setItem("authToken", response.token);
      onLogin(response.role, response.playerID);
    } catch (err) {
      setError("Invalid credentials");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1e3d] p-4">
      <Card className="w-full max-w-md bg-[#0f2847] border-[#1a3a5c]">
        <CardHeader>
          <CardTitle className="text-[#ffd700]">Soccer Stats Tracker</CardTitle>
          <CardDescription className="text-gray-400">Login to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#1a3a5c] border-[#2a4a6c] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#1a3a5c] border-[#2a4a6c] text-white"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-[#1a3a5c] text-white hover:bg-[#234a6f] border border-[#2a4a6c]">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
