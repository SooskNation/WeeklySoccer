import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthenticatedBackend } from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Trophy, Users } from "lucide-react";

interface Player {
  id: number;
  name: string;
}

interface Game {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
  motmFinalized: boolean;
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
  winner?: string;
  stats: PlayerStat[];
}

export default function VotingPage() {
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [gameDetails, setGameDetails] = useState<GameDetails | null>(null);
  const [voterId, setVoterId] = useState<number | null>(null);
  const [firstChoice, setFirstChoice] = useState<number | null>(null);
  const [secondChoice, setSecondChoice] = useState<number | null>(null);
  const [thirdChoice, setThirdChoice] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedGame) {
      loadGameDetails();
    }
  }, [selectedGame]);

  const loadData = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const gamesData = await backend.games.list();
      const unfinalizedGames = gamesData.games.filter(g => !g.motmFinalized);
      setGames(unfinalizedGames);
      if (unfinalizedGames.length > 0) {
        setSelectedGame(unfinalizedGames[0].id);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load voting data",
        variant: "destructive",
      });
    }
  };

  const loadGameDetails = async () => {
    if (!selectedGame) return;
    
    try {
      const backend = getAuthenticatedBackend();
      const details = await backend.games.get({ id: selectedGame });
      setGameDetails(details);
      setVoterId(null);
      setFirstChoice(null);
      setSecondChoice(null);
      setThirdChoice(null);
    } catch (error) {
      console.error("Failed to load game details:", error);
      toast({
        title: "Error",
        description: "Failed to load game details",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedGame || !voterId || !firstChoice) {
      toast({
        title: "Error",
        description: "Please select a game, voter, and at least first choice",
        variant: "destructive",
      });
      return;
    }

    try {
      const backend = getAuthenticatedBackend();
      await backend.votes.submit({
        gameId: selectedGame,
        voterId,
        firstChoice,
        secondChoice: secondChoice || undefined,
        thirdChoice: thirdChoice || undefined
      });
      toast({
        title: "Success",
        description: "Vote submitted successfully",
      });
      
      navigate("/results");
    } catch (error) {
      console.error("Failed to submit vote:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    }
  };

  const getPlayersWhoPlayed = (): Player[] => {
    if (!gameDetails) return [];
    return gameDetails.stats.map(stat => ({
      id: stat.playerId,
      name: stat.playerName
    }));
  };

  const getAvailablePlayers = (excluding: (number | null)[]) => {
    return getPlayersWhoPlayed().filter(p => !excluding.includes(p.id));
  };

  const getBlackTeam = () => gameDetails?.stats.filter(s => s.team === 'Black') || [];
  const getWhiteTeam = () => gameDetails?.stats.filter(s => s.team === 'White') || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Vote for Man of the Match</h1>
        <p className="text-muted-foreground">Cast your ranked vote for the best player</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Ranked Voting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {games.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No games available for voting. All MOTM awards have been finalized.</p>
            </div>
          )}
          <div>
            <Label htmlFor="game">Select Game</Label>
            <Select
              value={selectedGame?.toString()}
              onValueChange={(value) => setSelectedGame(parseInt(value))}
            >
              <SelectTrigger id="game">
                <SelectValue placeholder="Choose a game" />
              </SelectTrigger>
              <SelectContent>
                {games.map(game => (
                  <SelectItem key={game.id} value={game.id.toString()}>
                    {new Date(game.date).toLocaleDateString()} - Black {game.blackScore} vs White {game.whiteScore}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {gameDetails && (
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 bg-black rounded" />
                      Black Team ({gameDetails.blackScore})
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {getBlackTeam().map(stat => (
                        <li key={stat.playerId}>
                          {stat.playerName}
                          {stat.goals > 0 && ` ⚽${stat.goals}`}
                          {stat.assists > 0 && ` 🅰️${stat.assists}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border rounded" />
                      White Team ({gameDetails.whiteScore})
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {getWhiteTeam().map(stat => (
                        <li key={stat.playerId}>
                          {stat.playerName}
                          {stat.goals > 0 && ` ⚽${stat.goals}`}
                          {stat.assists > 0 && ` 🅰️${stat.assists}`}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {gameDetails.winner && (
                  <div className="mt-4 pt-4 border-t text-center font-semibold">
                    Winner: {gameDetails.winner}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div>
            <Label htmlFor="voter">Your Name</Label>
            <Select
              value={voterId?.toString()}
              onValueChange={(value) => setVoterId(parseInt(value))}
              disabled={!gameDetails}
            >
              <SelectTrigger id="voter">
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {getPlayersWhoPlayed().map(player => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <div className="p-4 rounded-lg bg-primary/10 border-2 border-primary">
              <Label htmlFor="first" className="text-base font-semibold">
                🥇 First Choice (3 points)
              </Label>
              <Select
                value={firstChoice?.toString() || ""}
                onValueChange={(value) => setFirstChoice(parseInt(value))}
              >
                <SelectTrigger id="first" className="mt-2">
                  <SelectValue placeholder="Select first choice" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePlayers([secondChoice, thirdChoice]).map(player => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <Label htmlFor="second" className="text-base">
                🥈 Second Choice (2 points)
              </Label>
              <Select
                value={secondChoice?.toString() || ""}
                onValueChange={(value) => setSecondChoice(parseInt(value))}
              >
                <SelectTrigger id="second" className="mt-2">
                  <SelectValue placeholder="Select second choice (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No selection</SelectItem>
                  {getAvailablePlayers([firstChoice, thirdChoice]).map(player => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <Label htmlFor="third" className="text-base">
                🥉 Third Choice (1 point)
              </Label>
              <Select
                value={thirdChoice?.toString() || ""}
                onValueChange={(value) => setThirdChoice(parseInt(value))}
              >
                <SelectTrigger id="third" className="mt-2">
                  <SelectValue placeholder="Select third choice (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No selection</SelectItem>
                  {getAvailablePlayers([firstChoice, secondChoice]).map(player => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            size="lg"
            disabled={!selectedGame || !voterId || !firstChoice}
          >
            Submit Vote
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
