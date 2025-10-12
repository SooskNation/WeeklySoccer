import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleDot, Footprints, Shield, Trophy, Download, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface PlayerStats {
  playerId: number;
  playerName: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  wins: number;
  motm: number;
  cleanSheets: number;
  winPercentage: number;
}

interface Player {
  id: number;
  name: string;
  nickname?: string;
  profilePicture?: string;
  role: string;
}

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadPlayerData();
    }
  }, [id]);

  const loadPlayerData = async () => {
    try {
      const playerId = parseInt(id!);
      const [playerData, statsData] = await Promise.all([
        backend.players.get({ id: playerId }),
        backend.stats.playerStats({ id: playerId })
      ]);
      setPlayer(playerData);
      setStats(statsData);
      setNickname(playerData.nickname || "");
    } catch (error) {
      console.error("Failed to load player data:", error);
      toast({
        title: "Error",
        description: "Failed to load player data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await backend.players.update({
        id: parseInt(id!),
        nickname: nickname || undefined
      });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      setEditing(false);
      loadPlayerData();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const downloadCSV = () => {
    if (!stats) return;

    const csv = [
      "Metric,Value",
      `Player Name,${stats.playerName}`,
      `Games Played,${stats.gamesPlayed}`,
      `Goals,${stats.goals}`,
      `Assists,${stats.assists}`,
      `Wins,${stats.wins}`,
      `Win Percentage,${stats.winPercentage}%`,
      `Man of the Match,${stats.motm}`,
      `Clean Sheets,${stats.cleanSheets}`
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${stats.playerName}_stats.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!player || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-muted-foreground">Player not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-3xl">{player.name}</CardTitle>
            {player.nickname && (
              <p className="text-muted-foreground mt-1">"{player.nickname}"</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={downloadCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setEditing(!editing)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              {editing ? "Cancel" : "Edit"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter nickname"
                />
              </div>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10">
                <CircleDot className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Goals</p>
                  <p className="text-2xl font-bold">{stats.goals}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
                <Footprints className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Assists</p>
                  <p className="text-2xl font-bold">{stats.assists}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">MOTM</p>
                  <p className="text-2xl font-bold">{stats.motm}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                <Shield className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Clean Sheets</p>
                  <p className="text-2xl font-bold">{stats.cleanSheets}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Games Played</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.gamesPlayed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.wins}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.winPercentage}% win rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.goals + stats.assists}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Goals + Assists
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
