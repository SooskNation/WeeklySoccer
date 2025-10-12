import { useState, useEffect } from "react";
import { useBackend } from "@/hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CircleDot, Footprints, Shield, Trophy, GripVertical } from "lucide-react";

interface Player {
  id: number;
  name: string;
}

interface PlayerStat {
  playerId: number;
  team: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  manOfMatch: boolean;
}

export default function ManagerDashboard() {
  const backend = useBackend();
  const [players, setPlayers] = useState<Player[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [blackTeam, setBlackTeam] = useState<number[]>([]);
  const [whiteTeam, setWhiteTeam] = useState<number[]>([]);
  const [playerStats, setPlayerStats] = useState<Map<number, PlayerStat>>(new Map());
  const [draggedPlayer, setDraggedPlayer] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
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

  const updatePlayerStat = (playerId: number, field: keyof PlayerStat, value: any) => {
    const stat = playerStats.get(playerId);
    if (stat) {
      setPlayerStats(new Map(playerStats.set(playerId, { ...stat, [field]: value })));
    }
  };

  const incrementStat = (playerId: number, field: 'goals' | 'assists') => {
    const stat = playerStats.get(playerId);
    if (stat) {
      const newValue = stat[field] + 1;
      updatePlayerStat(playerId, field, newValue);
    }
  };

  const calculateScores = () => {
    let black = 0;
    let white = 0;
    playerStats.forEach(stat => {
      if (stat.team === 'Black') {
        black += stat.goals;
      } else {
        white += stat.goals;
      }
    });
    return { black, white };
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

  const handleSubmit = async () => {
    try {
      const stats = Array.from(playerStats.values());
      const scores = calculateScores();
      
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
    } catch (error) {
      console.error("Failed to submit game:", error);
      toast({
        title: "Error",
        description: "Failed to submit game results",
        variant: "destructive",
      });
    }
  };

  const availablePlayers = players.filter(
    p => !blackTeam.includes(p.id) && !whiteTeam.includes(p.id)
  );

  const scores = calculateScores();

  return (
    <div className="flex gap-6">
      <Card className="w-64 flex-shrink-0">
        <CardHeader>
          <CardTitle>Available Players</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {availablePlayers.map(player => (
            <div
              key={player.id}
              draggable
              onDragStart={() => handleDragStart(player.id)}
              className="flex items-center gap-2 p-3 bg-secondary rounded-lg cursor-move hover:bg-secondary/80 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{player.name}</span>
            </div>
          ))}
          {availablePlayers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              All players assigned
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex-1 space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manager Dashboard</h1>
          <p className="text-muted-foreground">Create and manage game results</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Game Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="date">Game Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            className="border-gray-800"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('black')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Black Team</span>
                <span className="text-2xl font-bold">{scores.black}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 min-h-[200px]">
              {blackTeam.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-sm text-muted-foreground">Drag players here</p>
                </div>
              )}

              {blackTeam.map(playerId => {
                const player = players.find(p => p.id === playerId);
                const stat = playerStats.get(playerId);
                if (!player || !stat) return null;

                return (
                  <div key={playerId} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{player.name}</span>
                      <Button
                        onClick={() => removeFromTeam(playerId)}
                        variant="ghost"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => incrementStat(playerId, 'goals')}
                        className="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Add goal"
                      >
                        <CircleDot className="h-5 w-5" />
                        <span className="text-sm font-medium">{stat.goals}</span>
                      </button>
                      <button
                        onClick={() => incrementStat(playerId, 'assists')}
                        className="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Add assist"
                      >
                        <Footprints className="h-5 w-5" />
                        <span className="text-sm font-medium">{stat.assists}</span>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`clean-black-${playerId}`}
                          checked={stat.cleanSheet}
                          onCheckedChange={(checked) => updatePlayerStat(playerId, 'cleanSheet', checked)}
                        />
                        <Label htmlFor={`clean-black-${playerId}`} className="text-xs flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Clean Sheet
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`motm-black-${playerId}`}
                          checked={stat.manOfMatch}
                          onCheckedChange={(checked) => updatePlayerStat(playerId, 'manOfMatch', checked)}
                        />
                        <Label htmlFor={`motm-black-${playerId}`} className="text-xs flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          MOTM
                        </Label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card 
            className="border-gray-200"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop('white')}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>White Team</span>
                <span className="text-2xl font-bold">{scores.white}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 min-h-[200px]">
              {whiteTeam.length === 0 && (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-sm text-muted-foreground">Drag players here</p>
                </div>
              )}

              {whiteTeam.map(playerId => {
                const player = players.find(p => p.id === playerId);
                const stat = playerStats.get(playerId);
                if (!player || !stat) return null;

                return (
                  <div key={playerId} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{player.name}</span>
                      <Button
                        onClick={() => removeFromTeam(playerId)}
                        variant="ghost"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => incrementStat(playerId, 'goals')}
                        className="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Add goal"
                      >
                        <CircleDot className="h-5 w-5" />
                        <span className="text-sm font-medium">{stat.goals}</span>
                      </button>
                      <button
                        onClick={() => incrementStat(playerId, 'assists')}
                        className="flex items-center gap-2 p-2 hover:bg-secondary rounded-lg transition-colors"
                        title="Add assist"
                      >
                        <Footprints className="h-5 w-5" />
                        <span className="text-sm font-medium">{stat.assists}</span>
                      </button>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`clean-white-${playerId}`}
                          checked={stat.cleanSheet}
                          onCheckedChange={(checked) => updatePlayerStat(playerId, 'cleanSheet', checked)}
                        />
                        <Label htmlFor={`clean-white-${playerId}`} className="text-xs flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Clean Sheet
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`motm-white-${playerId}`}
                          checked={stat.manOfMatch}
                          onCheckedChange={(checked) => updatePlayerStat(playerId, 'manOfMatch', checked)}
                        />
                        <Label htmlFor={`motm-white-${playerId}`} className="text-xs flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          MOTM
                        </Label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Button
          onClick={handleSubmit}
          className="w-full"
          size="lg"
          disabled={blackTeam.length === 0 && whiteTeam.length === 0}
        >
          Submit Game Results
        </Button>
      </div>
    </div>
  );
}
