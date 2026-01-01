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
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = async (e: React.FormEvent) => {
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

  const handlePlayerEnter = () => {
    onLogin("player", undefined);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1e3d] p-4">
      <div className="w-full max-w-md space-y-6">
        <p className="text-center text-[#ffd700] text-sm italic px-4 font-bold">
          Tracking the stats for a game that nobody can play but everyone can referee. A game that starts 30 minutes late and ends in a shouting match.
        </p>
        <Card className="w-full bg-[#0f2847] border-[#1a3a5c]">
        <CardHeader>
          <CardTitle className="text-[#ffd700] text-center">Sunday Soccer Stats Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          {!showAdminLogin ? (
            <div className="space-y-4">
              <Button 
                onClick={handlePlayerEnter} 
                className="w-full bg-[#1a3a5c] text-white hover:bg-[#234a6f] border border-[#2a4a6c]"
              >
                Enter
              </Button>
              <Button 
                onClick={() => setShowAdminLogin(true)} 
                variant="outline"
                className="w-full bg-transparent text-[#ffd700] border-[#ffd700] hover:bg-[#ffd700]/10"
              >
                Admin Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-4">
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
              <div className="space-y-2">
                <Button type="submit" className="w-full bg-[#1a3a5c] text-white hover:bg-[#234a6f] border border-[#2a4a6c]">
                  Login
                </Button>
                <Button 
                  type="button"
                  onClick={() => setShowAdminLogin(false)} 
                  variant="outline"
                  className="w-full bg-transparent text-gray-400 border-[#2a4a6c] hover:bg-[#1a3a5c]"
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
