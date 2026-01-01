import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthenticatedBackend } from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Shield, Trophy, Download } from "lucide-react";
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

type SortField = 'playerName' | 'gamesPlayed' | 'goals' | 'assists' | 'wins' | 'draws' | 'losses' | 'winPercentage' | 'motm' | 'cleanSheets' | 'totalPoints' | 'pointsPerGame' | 'goalsPerGame' | 'assistsPerGame';
type SortDirection = 'asc' | 'desc';

export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [topScorers, setTopScorers] = useState<TopPlayer[]>([]);
  const [topAssisters, setTopAssisters] = useState<TopPlayer[]>([]);
  const [topMOTM, setTopMOTM] = useState<TopPlayer[]>([]);
  const [topCleanSheets, setTopCleanSheets] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortField>('pointsPerGame');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const [leaderboard, scorers, assisters, motm, cleanSheets] = await Promise.all([
        backend.stats.leaderboard(),
        backend.stats.topScorers({ limit: 3 }),
        backend.stats.topAssisters({ limit: 3 }),
        backend.stats.topMOTM({ limit: 3 }),
        backend.stats.topCleanSheets({ limit: 3 })
      ]);
      setStats(leaderboard.stats);
      setTopScorers(scorers.players);
      setTopAssisters(assisters.players);
      setTopMOTM(motm.players);
      setTopCleanSheets(cleanSheets.players);
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

  const handleExportCSV = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const response = await backend.stats.exportStats();
      
      const blob = new Blob([response.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `season-stats-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Season statistics exported successfully",
      });
    } catch (error) {
      console.error("Failed to export stats:", error);
      toast({
        title: "Error",
        description: "Failed to export statistics",
        variant: "destructive",
      });
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
    let aVal: number | string;
    let bVal: number | string;

    if (sortBy === 'goalsPerGame') {
      aVal = a.gamesPlayed > 0 ? a.goals / a.gamesPlayed : 0;
      bVal = b.gamesPlayed > 0 ? b.goals / b.gamesPlayed : 0;
    } else if (sortBy === 'assistsPerGame') {
      aVal = a.gamesPlayed > 0 ? a.assists / a.gamesPlayed : 0;
      bVal = b.gamesPlayed > 0 ? b.assists / b.gamesPlayed : 0;
    } else {
      aVal = a[sortBy];
      bVal = b[sortBy];
    }

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
      <div className="flex items-center justify-center h-64 bg-[#0a1e3d] min-h-screen">
        <div className="text-xl text-gray-400">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 bg-[#0a1e3d] min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 text-[#ffd700]">Player Statistics</h1>
            <p className="text-sm sm:text-base text-gray-400">Complete leaderboard and player stats</p>
          </div>
          <Button 
            onClick={handleExportCSV}
            className="bg-[#ffd700] text-[#0a1e3d] hover:bg-[#ffed4e] font-semibold w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Top3StatCard
          title="Top Scorers"
          players={topScorers}
          valueLabel="goals"
        />
        <Top3StatCard
          title="Top Assisters"
          players={topAssisters}
          valueLabel="assists"
        />
        <Top3StatCard
          title="Most MOTM Awards"
          players={topMOTM}
          icon={Trophy}
          valueLabel="awards"
        />
        <Top3StatCard
          title="Most Clean Sheets"
          players={topCleanSheets}
          icon={Shield}
          valueLabel="clean sheets"
        />
      </div>

      <Card className="bg-[#0f2847] border-[#1a3a5c]">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg lg:text-xl text-[#ffd700]">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow className="border-[#1a3a5c]">
                  <TableHead 
                    className="cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300 text-xs sm:text-sm sticky left-0 bg-[#0f2847] z-10"
                    onClick={() => handleSort('playerName')}
                  >
                    <div className="flex items-center gap-1">
                      Player <SortIcon field="playerName" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300 text-xs sm:text-sm whitespace-nowrap"
                    onClick={() => handleSort('gamesPlayed')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      GP <SortIcon field="gamesPlayed" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300 text-xs sm:text-sm whitespace-nowrap"
                    onClick={() => handleSort('pointsPerGame')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Pts/GP <SortIcon field="pointsPerGame" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('totalPoints')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      TotPts <SortIcon field="totalPoints" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('wins')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      W <SortIcon field="wins" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('draws')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      D <SortIcon field="draws" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('losses')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      L <SortIcon field="losses" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('goals')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      G <SortIcon field="goals" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('assists')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      A <SortIcon field="assists" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('cleanSheets')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Shield className="h-4 w-4" />
                      CS <SortIcon field="cleanSheets" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('motm')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Trophy className="h-4 w-4" />
                      MOTM <SortIcon field="motm" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('winPercentage')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Win% <SortIcon field="winPercentage" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('goalsPerGame')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      G/GP <SortIcon field="goalsPerGame" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer hover:bg-[#1a3a5c]/50 text-gray-300"
                    onClick={() => handleSort('assistsPerGame')}
                  >
                    <div className="flex items-center justify-center gap-1">
                      A/GP <SortIcon field="assistsPerGame" />
                    </div>
                  </TableHead>
                  <TableHead className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">
                    Last5
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStats.map((player) => {
                  const goalsPerGame = player.gamesPlayed > 0 ? (player.goals / player.gamesPlayed).toFixed(2) : '0.00';
                  const assistsPerGame = player.gamesPlayed > 0 ? (player.assists / player.gamesPlayed).toFixed(2) : '0.00';
                  return (
                  <TableRow key={player.playerId} className="hover:bg-[#1a3a5c]/50 border-[#1a3a5c]">
                    <TableCell className="font-medium text-white text-xs sm:text-sm sticky left-0 bg-[#0f2847] z-10">
                      <Link 
                        to={`/player/${player.playerId}`}
                        className="hover:text-[#ffd700] transition-colors"
                      >
                        {player.playerName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.gamesPlayed}</TableCell>
                    <TableCell className="text-center font-semibold text-[#ffd700] text-xs sm:text-sm whitespace-nowrap">{player.pointsPerGame}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.totalPoints}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.wins}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.draws}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.losses}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.goals}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.assists}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.cleanSheets}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.motm}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{player.winPercentage}%</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{goalsPerGame}</TableCell>
                    <TableCell className="text-center text-gray-300 text-xs sm:text-sm whitespace-nowrap">{assistsPerGame}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-0.5 sm:gap-1">
                        {[...Array(5)].map((_, idx) => {
                          const result = player.last5[idx];
                          const isLatest = idx === 0 && result;
                          return (
                            <div
                              key={idx}
                              className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                !result
                                  ? 'bg-[#1a3a5c] border border-[#2a4a6c]'
                                  : result === 'W'
                                  ? 'bg-green-500 text-white'
                                  : result === 'D'
                                  ? 'bg-gray-400 text-white'
                                  : 'bg-red-500 text-white'
                              } ${isLatest ? 'ring-1 sm:ring-2 ring-[#ffd700] ring-offset-1 ring-offset-[#0f2847]' : ''}`}
                              title={!result ? 'No game' : result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
                            >
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
