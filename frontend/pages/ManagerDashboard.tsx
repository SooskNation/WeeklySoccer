import { useState, useEffect } from "react";
import { useBackend } from "@/hooks/useBackend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CircleDot, Footprints, Shield, Trophy } from "lucide-react";

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
  const [blackScore, setBlackScore] = useState(0);
  const [whiteScore, setWhiteScore] = useState(0);
  const [blackTeam, setBlackTeam] = useState<number[]>([]);
  const [whiteTeam, setWhiteTeam] = useState<number[]>([]);
  const [playerStats, setPlayerStats] = useState<Map<number, PlayerStat>>(new Map());
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

  const calculateScore = () => {
    let black = 0;
    let white = 0;
    playerStats.forEach(stat => {
      if (stat.team === 'Black') {
        black += stat.goals;
      } else {
        white += stat.goals;
      }
    });
    setBlackScore(black);
    setWhiteScore(white);
  };

  const handleSubmit = async () => {
    try {
      const stats = Array.from(playerStats.values());
      await backend.games.create({
        date,
        blackScore,
        whiteScore,
        stats
      });
      toast({
        title: "Success",
        description: "Game results submitted successfully",
      });
      
      setBlackTeam([]);
      setWhiteTeam([]);
      setPlayerStats(new Map());
      setBlackScore(0);
      setWhiteScore(0);
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

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="blackScore">Black Score</Label>
              <Input
                id="blackScore"
                type="number"
                value={blackScore}
                onChange={(e) => setBlackScore(parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="whiteScore">White Score</Label>
              <Input
                id="whiteScore"
                type="number"
                value={whiteScore}
                onChange={(e) => setWhiteScore(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
          <Button onClick={calculateScore} variant="outline" className="w-full">
            Auto-Calculate Score from Goals
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Black Team</span>
              <span className="text-2xl font-bold">{blackScore}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={(value) => addToTeam(parseInt(value), 'black')}>
              <SelectTrigger>
                <SelectValue placeholder="Add player to Black team" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map(player => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <CircleDot className="h-3 w-3" />
                        Goals
                      </Label>
                      <Input
                        type="number"
                        value={stat.goals}
                        onChange={(e) => updatePlayerStat(playerId, 'goals', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Footprints className="h-3 w-3" />
                        Assists
                      </Label>
                      <Input
                        type="number"
                        value={stat.assists}
                        onChange={(e) => updatePlayerStat(playerId, 'assists', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`clean-${playerId}`}
                        checked={stat.cleanSheet}
                        onCheckedChange={(checked) => updatePlayerStat(playerId, 'cleanSheet', checked)}
                      />
                      <Label htmlFor={`clean-${playerId}`} className="text-xs flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Clean Sheet
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`motm-${playerId}`}
                        checked={stat.manOfMatch}
                        onCheckedChange={(checked) => updatePlayerStat(playerId, 'manOfMatch', checked)}
                      />
                      <Label htmlFor={`motm-${playerId}`} className="text-xs flex items-center gap-1">
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

        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>White Team</span>
              <span className="text-2xl font-bold">{whiteScore}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select onValueChange={(value) => addToTeam(parseInt(value), 'white')}>
              <SelectTrigger>
                <SelectValue placeholder="Add player to White team" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map(player => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <CircleDot className="h-3 w-3" />
                        Goals
                      </Label>
                      <Input
                        type="number"
                        value={stat.goals}
                        onChange={(e) => updatePlayerStat(playerId, 'goals', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs flex items-center gap-1">
                        <Footprints className="h-3 w-3" />
                        Assists
                      </Label>
                      <Input
                        type="number"
                        value={stat.assists}
                        onChange={(e) => updatePlayerStat(playerId, 'assists', parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`clean-${playerId}`}
                        checked={stat.cleanSheet}
                        onCheckedChange={(checked) => updatePlayerStat(playerId, 'cleanSheet', checked)}
                      />
                      <Label htmlFor={`clean-${playerId}`} className="text-xs flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Clean Sheet
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`motm-${playerId}`}
                        checked={stat.manOfMatch}
                        onCheckedChange={(checked) => updatePlayerStat(playerId, 'manOfMatch', checked)}
                      />
                      <Label htmlFor={`motm-${playerId}`} className="text-xs flex items-center gap-1">
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
  );
}
