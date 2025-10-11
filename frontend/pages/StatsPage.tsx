import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleDot, Footprints, Shield, Trophy } from "lucide-react";
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

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await backend.stats.leaderboard();
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to load stats:", error);
      toast({
        title: "Error",
        description: "Failed to load player statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-muted-foreground">Loading stats...</div>
      </div>
    );
  }

  const topScorer = stats.reduce((max, player) => 
    player.goals > max.goals ? player : max, stats[0]);
  
  const mostGames = stats.reduce((max, player) => 
    player.gamesPlayed > max.gamesPlayed ? player : max, stats[0]);
  
  const mostMOTM = stats.reduce((max, player) => 
    player.motm > max.motm ? player : max, stats[0]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Player Statistics</h1>
        <p className="text-muted-foreground">Complete leaderboard and player stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Scorer</CardTitle>
            <CircleDot className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topScorer?.playerName}</div>
            <p className="text-sm text-muted-foreground">{topScorer?.goals} goals</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most Games</CardTitle>
            <Footprints className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostGames?.playerName}</div>
            <p className="text-sm text-muted-foreground">{mostGames?.gamesPlayed} games</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Most MOTM</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostMOTM?.playerName}</div>
            <p className="text-sm text-muted-foreground">{mostMOTM?.motm} awards</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-center">Games</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <CircleDot className="h-4 w-4" />
                      Goals
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Footprints className="h-4 w-4" />
                      Assists
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Wins</TableHead>
                  <TableHead className="text-center">Win %</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="h-4 w-4" />
                      MOTM
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-4 w-4" />
                      Clean Sheets
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((player) => (
                  <TableRow key={player.playerId} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link 
                        to={`/player/${player.playerId}`}
                        className="hover:text-primary transition-colors"
                      >
                        {player.playerName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">{player.gamesPlayed}</TableCell>
                    <TableCell className="text-center font-semibold">{player.goals}</TableCell>
                    <TableCell className="text-center">{player.assists}</TableCell>
                    <TableCell className="text-center">{player.wins}</TableCell>
                    <TableCell className="text-center">{player.winPercentage}%</TableCell>
                    <TableCell className="text-center">{player.motm}</TableCell>
                    <TableCell className="text-center">{player.cleanSheets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
