import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthenticatedBackend } from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CircleDot, Footprints, Shield, Trophy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import Top3StatCard from "@/components/Top3StatCard";

interface PlayerStats {
  playerId: number;
  playerName: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  wins: number;
  draws: number;
  losses: number;
  motm: number;
  cleanSheets: number;
  winPercentage: number;
  totalPoints: number;
  pointsPerGame: number;
  last5: string[];
}

interface TopPlayer {
  playerId: number;
  playerName: string;
  value: number;
  gamesPlayed: number;
}

type SortField = 'playerName' | 'gamesPlayed' | 'goals' | 'assists' | 'wins' | 'draws' | 'losses' | 'winPercentage' | 'motm' | 'cleanSheets' | 'totalPoints' | 'pointsPerGame';
type SortDirection = 'asc' | 'desc';

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [topScorers, setTopScorers] = useState<TopPlayer[]>([]);
  const [topAssisters, setTopAssisters] = useState<TopPlayer[]>([]);
  const [topMOTM, setTopMOTM] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>('goals');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const [leaderboard, scorers, assisters, motm] = await Promise.all([
        backend.stats.leaderboard(),
        backend.stats.topScorers({ limit: 3 }),
        backend.stats.topAssisters({ limit: 3 }),
        backend.stats.topMOTM({ limit: 3 })
      ]);
      setStats(leaderboard.stats);
      setTopScorers(scorers.players);
      setTopAssisters(assisters.players);
      setTopMOTM(motm.players);
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

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    const multiplier = sortDir === 'asc' ? 1 : -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return aVal.localeCompare(bVal) * multiplier;
    }
    
    return ((aVal as number) - (bVal as number)) * multiplier;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? '▲' : '▼';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-muted-foreground">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Player Statistics</h1>
        <p className="text-muted-foreground">Complete leaderboard and player stats</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Top3StatCard
          title="Top Scorers"
          players={topScorers}
          icon={CircleDot}
          valueLabel="goals"
        />
        <Top3StatCard
          title="Top Assisters"
          players={topAssisters}
          icon={Footprints}
          valueLabel="assists"
        />
        <Top3StatCard
          title="Most MOTM Awards"
          players={topMOTM}
          icon={Trophy}
          valueLabel="awards"
        />
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
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('playerName')}
                  >
                    <div className="flex items-center gap-1">
                      Player <SortIcon field="playerName" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('gamesPlayed')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Games <SortIcon field="gamesPlayed" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('goals')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <CircleDot className="h-5 w-5" />
                      Goals <SortIcon field="goals" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('assists')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Footprints className="h-5 w-5" />
                      Assists <SortIcon field="assists" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('wins')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Wins <SortIcon field="wins" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('winPercentage')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Win % <SortIcon field="winPercentage" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('motm')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="h-5 w-5" />
                      MOTM <SortIcon field="motm" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('cleanSheets')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-5 w-5" />
                      Clean Sheets <SortIcon field="cleanSheets" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('totalPoints')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Total Pts <SortIcon field="totalPoints" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('pointsPerGame')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Pts/Game <SortIcon field="pointsPerGame" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center">
                    Last 5
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStats.map((player) => (
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
                    <TableCell className="text-center font-semibold">{player.totalPoints}</TableCell>
                    <TableCell className="text-center">{player.pointsPerGame}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, idx) => {
                          const result = player.last5[idx];
                          const isLatest = idx === 0 && result;
                          return (
                            <div
                              key={idx}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                !result
                                  ? 'bg-muted border border-border'
                                  : result === 'W'
                                  ? 'bg-green-500 text-white'
                                  : result === 'D'
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-red-500 text-white'
                              } ${isLatest ? 'ring-2 ring-foreground ring-offset-1' : ''}`}
                              title={!result ? 'No game' : result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                            >
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
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
