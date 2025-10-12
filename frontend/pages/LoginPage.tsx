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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Soccer Stats Tracker</CardTitle>
          <CardDescription>Login to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <div className="mt-6 pt-6 border-t space-y-2">
            <p className="text-sm text-muted-foreground font-semibold">Demo Credentials:</p>
            <div className="space-y-1 text-sm">
              <p className="text-muted-foreground">
                <span className="font-medium">Manager:</span> admin / admin
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Player:</span> player / player
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
