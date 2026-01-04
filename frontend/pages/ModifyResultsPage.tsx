import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAuthenticatedBackend } from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, GripVertical, Shirt, Menu, X, HandHelping, AlertTriangle } from "lucide-react";
import { useSubmitOnce } from "@/hooks/useSubmitOnce";

interface Player {
  id: number;
  name: string;
}

interface PlayerStat {
  playerId: number;
  playerName: string;
  team: string;
  goals: number;
  assists: number;
  ownGoals: number;
  isGoalkeeper: boolean;
  isCaptain: boolean;
  cleanSheet: boolean;
  manOfMatch: boolean;
}

interface GameDetails {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
  stats: PlayerStat[];
}

interface PlayerStatInput {
  playerId: number;
  team: string;
  goals: number;
  assists: number;
  ownGoals: number;
  isGoalkeeper: boolean;
  isCaptain: boolean;
  cleanSheet: boolean;
  manOfMatch: boolean;
}

export default function ModifyResultsPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [date, setDate] = useState("");
  const [blackTeam, setBlackTeam] = useState<number[]>([]);
  const [whiteTeam, setWhiteTeam] = useState<number[]>([]);
  const [playerStats, setPlayerStats] = useState<Map<number, PlayerStatInput>>(new Map());
  const [loading, setLoading] = useState(true);
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [showPlayers, setShowPlayers] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const [playersData, gameData] = await Promise.all([
        backend.players.list(),
        backend.games.get({ id: Number(gameId) })
      ]);

      setPlayers(playersData.players);
      setGameDetails(gameData);
      
      const gameDate = new Date(gameData.date);
      const formattedDate = gameDate.toISOString().split('T')[0];
      setDate(formattedDate);

      const statsMap = new Map<number, PlayerStatInput>();
      const black: number[] = [];
      const white: number[] = [];

      gameData.stats.forEach(stat => {
        statsMap.set(stat.playerId, {
          playerId: stat.playerId,
          team: stat.team,
          goals: stat.goals,
          assists: stat.assists,
          ownGoals: stat.ownGoals,
          isGoalkeeper: stat.isGoalkeeper,
          isCaptain: stat.isCaptain,
          cleanSheet: stat.cleanSheet,
          manOfMatch: stat.manOfMatch
        });

        if (stat.team === 'Black') {
          black.push(stat.playerId);
        } else {
          white.push(stat.playerId);
        }
      });

      setPlayerStats(statsMap);
      setBlackTeam(black);
      setWhiteTeam(white);
    } catch (error) {
      console.error("Failed to load game data:", error);
      toast({
        title: "Error",
        description: "Failed to load game data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToTeam = (playerId: number, team: 'black' | 'white') => {
    if (team === 'black') {
      if (!blackTeam.includes(playerId) && !whiteTeam.includes(playerId)) {
        setBlackTeam([...blackTeam, playerId]);
        setPlayerStats(new Map(playerStats.set(playerId, {
          playerId,
          team: 'Black',
          goals: 0,
          assists: 0,
          ownGoals: 0,
          isGoalkeeper: false,
          isCaptain: false,
          cleanSheet: false,
          manOfMatch: false
        })));
      }
    } else {
      if (!whiteTeam.includes(playerId) && !blackTeam.includes(playerId)) {
        setWhiteTeam([...whiteTeam, playerId]);
        setPlayerStats(new Map(playerStats.set(playerId, {
          playerId,
          team: 'White',
          goals: 0,
          assists: 0,
          ownGoals: 0,
          isGoalkeeper: false,
          isCaptain: false,
          cleanSheet: false,
          manOfMatch: false
        })));
      }
    }
  };

  const removeFromTeam = (playerId: number) => {
    setBlackTeam(blackTeam.filter(id => id !== playerId));
    setWhiteTeam(whiteTeam.filter(id => id !== playerId));
    const newStats = new Map(playerStats);
    newStats.delete(playerId);
    setPlayerStats(newStats);
  };

  const updatePlayerStat = (playerId: number, field: keyof PlayerStatInput, value: any) => {
    const stat = playerStats.get(playerId);
    if (stat) {
      setPlayerStats(new Map(playerStats.set(playerId, { ...stat, [field]: value })));
    }
  };

  const incrementStat = (playerId: number, field: 'goals' | 'assists' | 'ownGoals') => {
    const stat = playerStats.get(playerId);
    if (stat) {
      const newValue = stat[field] + 1;
      updatePlayerStat(playerId, field, newValue);
      
      if (field === 'goals' || field === 'ownGoals') {
        setTimeout(() => updateCleanSheets(), 0);
      }
    }
  };

  const calculateScores = () => {
    let black = 0;
    let white = 0;
    playerStats.forEach(stat => {
      if (stat.team === 'Black') {
        black += stat.goals;
        white += stat.ownGoals;
      } else {
        white += stat.goals;
        black += stat.ownGoals;
      }
    });
    return { black, white };
  };

  const updateCleanSheets = () => {
    const scores = calculateScores();
    const newStats = new Map(playerStats);
    let updated = false;

    newStats.forEach((stat, playerId) => {
      if (stat.isGoalkeeper) {
        const teamConceded = stat.team === 'Black' ? scores.white : scores.black;
        const shouldHaveCleanSheet = teamConceded === 0;
        
        if (stat.cleanSheet !== shouldHaveCleanSheet) {
          newStats.set(playerId, { ...stat, cleanSheet: shouldHaveCleanSheet });
          updated = true;
        }
      }
    });

    if (updated) {
      setPlayerStats(newStats);
    }
  };

  const toggleGoalkeeper = (playerId: number) => {
    const stat = playerStats.get(playerId);
    if (stat) {
      const isGoalkeeper = !stat.isGoalkeeper;
      const scores = calculateScores();
      const teamConceded = stat.team === 'Black' ? scores.white : scores.black;
      const cleanSheet = isGoalkeeper && teamConceded === 0;
      
      setPlayerStats(new Map(playerStats.set(playerId, { 
        ...stat, 
        isGoalkeeper, 
        cleanSheet 
      })));
    }
  };

  const toggleCaptain = (playerId: number) => {
    const stat = playerStats.get(playerId);
    if (!stat) return;

    const teamPlayers = stat.team === 'Black' ? blackTeam : whiteTeam;
    const newStats = new Map(playerStats);
    
    teamPlayers.forEach(pid => {
      const pStat = newStats.get(pid);
      if (pStat && pid !== playerId) {
        newStats.set(pid, { ...pStat, isCaptain: false });
      }
    });
    
    newStats.set(playerId, { ...stat, isCaptain: !stat.isCaptain });
    setPlayerStats(newStats);
  };



  const movePlayerToTeam = (playerId: number, team: 'black' | 'white') => {
    removeFromTeam(playerId);
    addToTeam(playerId, team);
  };

  const handleDragStart = (playerId: number) => {
    setDraggedPlayer(playerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (team: 'black' | 'white') => {
    if (draggedPlayer !== null) {
      addToTeam(draggedPlayer, team);
      setDraggedPlayer(null);
    }
  };

  const updateGame = async () => {
    try {
      const stats = Array.from(playerStats.values());
      const scores = calculateScores();

      if (stats.length === 0) {
        toast({
          title: "Error",
          description: "Please add players to at least one team",
          variant: "destructive",
        });
        return;
      }

      const backend = getAuthenticatedBackend();
      await backend.games.update({
        id: Number(gameId),
        date,
        blackScore: scores.black,
        whiteScore: scores.white,
        stats
      });

      toast({
        title: "Success",
        description: "Game results updated successfully",
      });

      navigate("/results");
    } catch (error: any) {
      console.error("Failed to update game:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update game results",
        variant: "destructive",
      });
    }
  };

  const [handleSubmit] = useSubmitOnce(updateGame);

  const deleteGame = async () => {
    try {
      const backend = getAuthenticatedBackend();
      await backend.games.deleteGame({ id: Number(gameId) });

      toast({
        title: "Success",
        description: "Game deleted successfully",
      });

      navigate("/results");
    } catch (error: any) {
      console.error("Failed to delete game:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete game",
        variant: "destructive",
      });
    }
  };

  const [handleDelete] = useSubmitOnce(deleteGame);

  const availablePlayers = players.filter(
    p => !blackTeam.includes(p.id) && !whiteTeam.includes(p.id)
  );

  const scores = calculateScores();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-muted-foreground">Loading game data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 bg-[#0a1e3d] min-h-screen p-4 sm:p-6">
      <Button
        onClick={() => setShowPlayers(!showPlayers)}
        className="lg:hidden bg-[#1a3a5c] hover:bg-[#234a6f] text-white mb-2"
      >
        {showPlayers ? <X className="h-4 w-4 mr-2" /> : <Menu className="h-4 w-4 mr-2" />}
        {showPlayers ? "Hide" : "Show"} Players
      </Button>

      <Card className={`w-full lg:w-72 flex-shrink-0 bg-[#0f2847] border-[#1a3a5c] ${showPlayers ? 'block' : 'hidden lg:block'}`}>
        <CardHeader>
          <CardTitle className="text-[#ffd700]">Available Players</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availablePlayers.map(player => (
            <div
              key={player.id}
              draggable
              onDragStart={() => handleDragStart(player.id)}
              className="flex items-center gap-2 p-3 bg-[#1a3a5c] rounded-lg cursor-move hover:bg-[#234a6f] transition-colors"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
              <span className="font-medium text-white flex-1">{player.name}</span>
              <button
                onClick={() => movePlayerToTeam(player.id, 'white')}
                className="p-1.5 hover:bg-white/20 rounded transition-colors"
                title="Add to White Team"
              >
                <Shirt className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={() => movePlayerToTeam(player.id, 'black')}
                className="p-1.5 hover:bg-black/40 rounded transition-colors"
                title="Add to Black Team"
              >
                <Shirt className="h-5 w-5 text-black fill-black" />
              </button>
            </div>
          ))}
          {availablePlayers.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              All players assigned
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex-1 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-[#ffd700]">Modify Game Results</h1>
          <p className="text-sm sm:text-base text-gray-400">Update game details and statistics</p>
        </div>

        <Card className="bg-[#0f2847] border-[#1a3a5c]">
          <CardHeader>
            <CardTitle className="text-[#ffd700]">Game Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date" className="text-gray-300">Game Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#1a3a5c] border-[#2a4a6c] text-white"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 py-4 sm:py-6">
          <div className="text-center">
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">Black Team</div>
            <div className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white">{scores.black}</div>
          </div>
          <div className="text-2xl sm:text-3xl lg:text-4xl text-[#ffd700] font-bold">-</div>
          <div className="text-center">
            <div className="text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">White Team</div>
            <div className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white">{scores.white}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card
            className="bg-[#0f2847] border-[#1a3a5c]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('black')}
          >
            <CardHeader>
              <CardTitle className="text-[#ffd700]">Black Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[200px]">
              {blackTeam.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-[#2a4a6c] rounded-lg">
                  <p className="text-sm text-gray-400">Drag players here</p>
                </div>
              )}

              {blackTeam.map(playerId => {
                const player = players.find(p => p.id === playerId);
                const stat = playerStats.get(playerId);
                if (!player || !stat) return null;

                return (
                  <div key={playerId} className="bg-[#1a3a5c] rounded-lg px-2 sm:px-3 py-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="font-medium text-white flex-1 mb-1 sm:mb-0">{player.name}</span>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => incrementStat(playerId, 'goals')}
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                        title="Add goal"
                      >
                        <img src="/soccer-ball.jpg" alt="G" className="h-4 sm:h-5 w-4 sm:w-5 rounded-full object-cover" />
                        <span className="text-xs sm:text-sm font-medium text-white">{stat.goals}</span>
                      </button>
                      <button
                        onClick={() => incrementStat(playerId, 'assists')}
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                        title="Add assist"
                      >
                        <HandHelping className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        <span className="text-xs sm:text-sm font-medium text-white">{stat.assists}</span>
                      </button>
                      <button
                        onClick={() => incrementStat(playerId, 'ownGoals')}
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                        title="Add own goal"
                      >
                        <span className="text-xs font-bold text-red-400 border border-red-400 rounded px-1">OG</span>
                        <span className="text-xs sm:text-sm font-medium text-white">{stat.ownGoals}</span>
                      </button>
                      <button
                        onClick={() => toggleCaptain(playerId)}
                        className={`p-1 rounded transition-colors font-bold text-xs sm:text-sm w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ${stat.isCaptain ? 'bg-[#ffd700] text-[#0a1e3d]' : 'bg-[#234a6f] text-gray-300 hover:bg-[#2a5a8f]'}`}
                        title="Captain"
                      >
                        C
                      </button>
                      <button
                        onClick={() => toggleGoalkeeper(playerId)}
                        className={`p-1 rounded transition-colors ${stat.isGoalkeeper ? 'bg-[#ffd700]' : 'hover:bg-[#234a6f]'}`}
                        title="Goalkeeper"
                      >
                        <span className="text-xs sm:hidden font-bold text-white">GK</span>
                        <img src="/gloves.png" alt="GK" className="hidden sm:block h-5 w-5 object-contain" />
                      </button>
                      <button
                        onClick={() => removeFromTeam(playerId)}
                        className="p-1 hover:bg-red-600/20 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 sm:h-5 w-4 sm:w-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card
            className="bg-[#0f2847] border-[#1a3a5c]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('white')}
          >
            <CardHeader>
              <CardTitle className="text-[#ffd700]">White Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 min-h-[200px]">
              {whiteTeam.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-[#2a4a6c] rounded-lg">
                  <p className="text-sm text-gray-400">Drag players here</p>
                </div>
              )}

              {whiteTeam.map(playerId => {
                const player = players.find(p => p.id === playerId);
                const stat = playerStats.get(playerId);
                if (!player || !stat) return null;

                return (
                  <div key={playerId} className="bg-[#1a3a5c] rounded-lg px-2 sm:px-3 py-2 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <span className="font-medium text-white flex-1 mb-1 sm:mb-0">{player.name}</span>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <button
                        onClick={() => incrementStat(playerId, 'goals')}
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                        title="Add goal"
                      >
                        <img src="/soccer-ball.jpg" alt="G" className="h-4 sm:h-5 w-4 sm:w-5 rounded-full object-cover" />
                        <span className="text-xs sm:text-sm font-medium text-white">{stat.goals}</span>
                      </button>
                      <button
                        onClick={() => incrementStat(playerId, 'assists')}
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                        title="Add assist"
                      >
                        <HandHelping className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        <span className="text-xs sm:text-sm font-medium text-white">{stat.assists}</span>
                      </button>
                      <button
                        onClick={() => incrementStat(playerId, 'ownGoals')}
                        className="flex items-center gap-1 px-1.5 sm:px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                        title="Add own goal"
                      >
                        <span className="text-xs font-bold text-red-400 border border-red-400 rounded px-1">OG</span>
                        <span className="text-xs sm:text-sm font-medium text-white">{stat.ownGoals}</span>
                      </button>
                      <button
                        onClick={() => toggleCaptain(playerId)}
                        className={`p-1 rounded transition-colors font-bold text-xs sm:text-sm w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ${stat.isCaptain ? 'bg-[#ffd700] text-[#0a1e3d]' : 'bg-[#234a6f] text-gray-300 hover:bg-[#2a5a8f]'}`}
                        title="Captain"
                      >
                        C
                      </button>
                      <button
                        onClick={() => toggleGoalkeeper(playerId)}
                        className={`p-1 rounded transition-colors ${stat.isGoalkeeper ? 'bg-[#ffd700]' : 'hover:bg-[#234a6f]'}`}
                        title="Goalkeeper"
                      >
                        <span className="text-xs sm:hidden font-bold text-white">GK</span>
                        <img src="/gloves.png" alt="GK" className="hidden sm:block h-5 w-5 object-contain" />
                      </button>
                      <button
                        onClick={() => removeFromTeam(playerId)}
                        className="p-1 hover:bg-red-600/20 rounded transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="h-4 sm:h-5 w-4 sm:w-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {showDeleteConfirm && (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">Delete Game</h3>
                  <p className="text-gray-300 mb-4">
                    Are you sure you want to delete this game? This will permanently remove all game data,
                    statistics, and votes. This action cannot be undone.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 bg-gray-600 text-white hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 text-white hover:bg-red-700 font-bold"
                    >
                      Delete Game
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            onClick={() => navigate("/results")}
            className="flex-1 bg-gray-600 text-white hover:bg-gray-700"
            size="lg"
          >
            Cancel
          </Button>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex-1 bg-red-600 text-white hover:bg-red-700"
            size="lg"
          >
            Delete Game
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 bg-[#ffd700] text-[#0a1e3d] hover:bg-[#ffed4e] font-bold"
            size="lg"
            disabled={blackTeam.length === 0 && whiteTeam.length === 0}
          >
            Update Game Results
          </Button>
        </div>
      </div>
    </div>
  );
}
