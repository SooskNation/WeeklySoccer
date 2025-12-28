import { useState, useEffect } from "react";
import { getAuthenticatedBackend } from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Shirt, Trash2, GripVertical, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Player {
  id: number;
  name: string;
}

interface PlayerStat {
  playerId: number;
  team: string;
  goals: number;
  assists: number;
  ownGoals: number;
  isGoalkeeper: boolean;
  isCaptain: boolean;
  cleanSheet: boolean;
}

export default function ManagerDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [blackTeam, setBlackTeam] = useState<number[]>([]);
  const [whiteTeam, setWhiteTeam] = useState<number[]>([]);
  const [playerStats, setPlayerStats] = useState<Map<number, PlayerStat>>(new Map());
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState("Player");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const response = await backend.players.list();
      setPlayers(response.players);
    } catch (error) {
      console.error("Failed to load players:", error);
      toast({
        title: "Error",
        description: "Failed to load players",
        variant: "destructive",
      });
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
          cleanSheet: false
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
          cleanSheet: false
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

  const updatePlayerStat = (playerId: number, field: keyof PlayerStat, value: any) => {
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

  const movePlayerToTeam = (playerId: number, team: 'black' | 'white') => {
    removeFromTeam(playerId);
    addToTeam(playerId, team);
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

  const handleAddPlayer = async () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a player name",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingPlayer(true);
      const backend = getAuthenticatedBackend();
      const newPlayer = await backend.players.create({
        name: newPlayerName.trim(),
        roleName: newPlayerRole
      });
      
      setPlayers([...players, { id: newPlayer.id, name: newPlayer.name }]);
      setNewPlayerName("");
      setNewPlayerRole("Player");
      toast({
        title: "Success",
        description: `Player ${newPlayer.name} added successfully`,
      });
    } catch (error: any) {
      console.error("Failed to add player:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add player",
        variant: "destructive",
      });
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleSubmit = async () => {
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
      await backend.games.create({
        date,
        blackScore: scores.black,
        whiteScore: scores.white,
        stats
      });
      toast({
        title: "Success",
        description: "Game results submitted successfully",
      });
      
      setBlackTeam([]);
      setWhiteTeam([]);
      setPlayerStats(new Map());
    } catch (error: any) {
      console.error("Failed to submit game:", error);
      const errorMessage = error?.message || "Failed to submit game results";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const availablePlayers = players.filter(
    p => !blackTeam.includes(p.id) && !whiteTeam.includes(p.id)
  );

  const scores = calculateScores();

  return (
    <div className="flex gap-6 bg-[#0a1e3d] min-h-screen p-6">
      <Card className="w-72 flex-shrink-0 bg-[#0f2847] border-[#1a3a5c]">
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
          <div className="border-t border-[#2a4a6c] pt-4 mt-4">
            <Label htmlFor="newPlayer" className="text-gray-300 text-sm mb-2 block">Add New Player</Label>
            <div className="space-y-2">
              <Input
                id="newPlayer"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Player name"
                className="bg-[#1a3a5c] border-[#2a4a6c] text-white"
                disabled={isAddingPlayer}
              />
              <div className="flex gap-2">
                <Select value={newPlayerRole} onValueChange={setNewPlayerRole}>
                  <SelectTrigger className="bg-[#1a3a5c] border-[#2a4a6c] text-white flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Player">Player</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddPlayer}
                  disabled={isAddingPlayer || !newPlayerName.trim()}
                  size="sm"
                  className="bg-[#ffd700] text-[#0a1e3d] hover:bg-[#ffed4e]"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-[#ffd700]">Manager Dashboard</h1>
          <p className="text-gray-400">Create and manage game results</p>
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

        <div className="flex items-center justify-center gap-8 py-6">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">Black Team</div>
            <div className="text-6xl font-bold text-white">{scores.black}</div>
          </div>
          <div className="text-4xl text-[#ffd700] font-bold">-</div>
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">White Team</div>
            <div className="text-6xl font-bold text-white">{scores.white}</div>
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
                  <div key={playerId} className="bg-[#1a3a5c] rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="font-medium text-white flex-1">{player.name}</span>
                    <button
                      onClick={() => incrementStat(playerId, 'goals')}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                      title="Add goal"
                    >
                      <img src="/soccer-ball.jpg" alt="Goal" className="h-7 w-7 rounded-full object-cover" />
                      <span className="text-sm font-medium text-white">{stat.goals}</span>
                    </button>
                    <button
                      onClick={() => incrementStat(playerId, 'assists')}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                      title="Add assist"
                    >
                      <img src="/assist.png" alt="Assist" className="h-5 w-5 object-contain" />
                      <span className="text-sm font-medium text-white">{stat.assists}</span>
                    </button>
                    <button
                      onClick={() => incrementStat(playerId, 'ownGoals')}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                      title="Add own goal"
                    >
                      <span className="text-xs font-bold text-red-400 border border-red-400 rounded px-1">OG</span>
                      <span className="text-sm font-medium text-white">{stat.ownGoals}</span>
                    </button>
                    <button
                      onClick={() => toggleCaptain(playerId)}
                      className={`p-1 rounded transition-colors font-bold text-sm w-6 h-6 flex items-center justify-center ${stat.isCaptain ? 'bg-[#ffd700] text-[#0a1e3d]' : 'bg-[#234a6f] text-gray-300 hover:bg-[#2a5a8f]'}`}
                      title="Captain"
                    >
                      C
                    </button>
                    <button
                      onClick={() => toggleGoalkeeper(playerId)}
                      className={`p-1 rounded transition-colors ${stat.isGoalkeeper ? 'bg-[#ffd700]' : 'hover:bg-[#234a6f]'}`}
                      title="Goalkeeper"
                    >
                      <img src="/gloves.png" alt="Goalkeeper" className="h-5 w-5 object-contain" />
                    </button>
                    <button
                      onClick={() => removeFromTeam(playerId)}
                      className="p-1 hover:bg-red-600/20 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </button>
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
                  <div key={playerId} className="bg-[#1a3a5c] rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="font-medium text-white flex-1">{player.name}</span>
                    <button
                      onClick={() => incrementStat(playerId, 'goals')}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                      title="Add goal"
                    >
                      <img src="/soccer-ball.jpg" alt="Goal" className="h-7 w-7 rounded-full object-cover" />
                      <span className="text-sm font-medium text-white">{stat.goals}</span>
                    </button>
                    <button
                      onClick={() => incrementStat(playerId, 'assists')}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                      title="Add assist"
                    >
                      <img src="/assist.png" alt="Assist" className="h-5 w-5 object-contain" />
                      <span className="text-sm font-medium text-white">{stat.assists}</span>
                    </button>
                    <button
                      onClick={() => incrementStat(playerId, 'ownGoals')}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-[#234a6f] rounded transition-colors"
                      title="Add own goal"
                    >
                      <span className="text-xs font-bold text-red-400 border border-red-400 rounded px-1">OG</span>
                      <span className="text-sm font-medium text-white">{stat.ownGoals}</span>
                    </button>
                    <button
                      onClick={() => toggleCaptain(playerId)}
                      className={`p-1 rounded transition-colors font-bold text-sm w-6 h-6 flex items-center justify-center ${stat.isCaptain ? 'bg-[#ffd700] text-[#0a1e3d]' : 'bg-[#234a6f] text-gray-300 hover:bg-[#2a5a8f]'}`}
                      title="Captain"
                    >
                      C
                    </button>
                    <button
                      onClick={() => toggleGoalkeeper(playerId)}
                      className={`p-1 rounded transition-colors ${stat.isGoalkeeper ? 'bg-[#ffd700]' : 'hover:bg-[#234a6f]'}`}
                      title="Goalkeeper"
                    >
                      <img src="/gloves.png" alt="Goalkeeper" className="h-5 w-5 object-contain" />
                    </button>
                    <button
                      onClick={() => removeFromTeam(playerId)}
                      className="p-1 hover:bg-red-600/20 rounded transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full bg-[#ffd700] text-[#0a1e3d] hover:bg-[#ffed4e] font-bold"
          size="lg"
          disabled={blackTeam.length === 0 && whiteTeam.length === 0}
        >
          Submit Game Results
        </Button>
      </div>
    </div>
  );
}
