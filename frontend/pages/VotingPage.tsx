import { useState, useEffect } from "react";
import { getAuthenticatedBackend } from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Trophy } from "lucide-react";

interface Player {
  id: number;
  name: string;
}

interface Game {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
}

export default function VotingPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<number | null>(null);
  const [voterId, setVoterId] = useState<number | null>(null);
  const [firstChoice, setFirstChoice] = useState<number | null>(null);
  const [secondChoice, setSecondChoice] = useState<number | null>(null);
  const [thirdChoice, setThirdChoice] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const [playersData, gamesData] = await Promise.all([
        backend.players.list(),
        backend.games.list()
      ]);
      setPlayers(playersData.players);
      setGames(gamesData.games);
      if (gamesData.games.length > 0) {
        setSelectedGame(gamesData.games[0].id);
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
      
      setFirstChoice(null);
      setSecondChoice(null);
      setThirdChoice(null);
    } catch (error) {
      console.error("Failed to submit vote:", error);
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      });
    }
  };

  const getAvailablePlayers = (excluding: (number | null)[]) => {
    return players.filter(p => !excluding.includes(p.id));
  };

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

          <div>
            <Label htmlFor="voter">Your Name</Label>
            <Select
              value={voterId?.toString()}
              onValueChange={(value) => setVoterId(parseInt(value))}
            >
              <SelectTrigger id="voter">
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {players.map(player => (
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
