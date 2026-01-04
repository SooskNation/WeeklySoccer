import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthenticatedBackend } from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleDot, Footprints, Shield, Trophy, Download, Edit, Trash2 } from "lucide-react";
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
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadPlayerData();
    }
  }, [id]);

  const loadPlayerData = async () => {
    try {
      const playerId = parseInt(id!);
      const backend = getAuthenticatedBackend();
      const [playerData, statsData] = await Promise.all([
        backend.players.get({ id: playerId }),
        backend.stats.playerStats({ id: playerId })
      ]);
      setPlayer(playerData);
      setStats(statsData);
      setName(playerData.name);
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
      const backend = getAuthenticatedBackend();
      await backend.players.update({
        id: parseInt(id!),
        name: name || undefined,
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

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${player?.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      const backend = getAuthenticatedBackend();
      await backend.players.deletePlayer({ id: parseInt(id!) });
      toast({
        title: "Success",
        description: "Player deleted successfully",
      });
      navigate("/stats");
    } catch (error) {
      console.error("Failed to delete player:", error);
      toast({
        title: "Error",
        description: "Failed to delete player",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-2xl sm:text-3xl">{player.name}</CardTitle>
            {player.nickname && (
              <p className="text-muted-foreground mt-1">"{player.nickname}"</p>
            )}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button onClick={downloadCSV} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button onClick={() => setEditing(!editing)} variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Edit className="h-4 w-4 mr-2" />
              {editing ? "Cancel" : "Edit"}
            </Button>
            <Button 
              onClick={handleDelete} 
              variant="destructive" 
              size="sm" 
              className="flex-1 sm:flex-none"
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name"
                />
              </div>
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-primary/10">
                <CircleDot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Goals</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.goals}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-purple-500/10">
                <Footprints className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Assists</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.assists}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-yellow-500/10">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">MOTM</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.motm}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-blue-500/10">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Clean Sheets</p>
                  <p className="text-xl sm:text-2xl font-bold">{stats.cleanSheets}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Games Played</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.gamesPlayed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Wins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.wins}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {stats.winPercentage}% win rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.goals + stats.assists}</div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Goals + Assists
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
