import { useEffect, useState } from "react";
import backend from "~backend/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CircleDot, Footprints, Shield, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Game {
  id: number;
  date: string;
  blackScore: number;
  whiteScore: number;
  winner?: string;
}

interface PlayerStat {
  playerId: number;
  playerName: string;
  team: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  manOfMatch: boolean;
}

interface GameDetails extends Game {
  stats: PlayerStat[];
}

interface VoteResult {
  playerId: number;
  playerName: string;
  firstChoiceVotes: number;
  secondChoiceVotes: number;
  thirdChoiceVotes: number;
  totalPoints: number;
}

interface VoteDetail {
  voteId: number;
  firstChoice: string;
  secondChoice: string | null;
  thirdChoice: string | null;
  createdAt: Date;
}

interface AllVotesData {
  votes: VoteDetail[];
  aggregate: VoteResult[];
}

export default function ResultsPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [expandedGame, setExpandedGame] = useState<number | null>(null);
  const [gameDetails, setGameDetails] = useState<Map<number, GameDetails>>(new Map());
  const [voteResults, setVoteResults] = useState<Map<number, AllVotesData>>(new Map());
  const { toast } = useToast();

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const response = await backend.games.list();
      setGames(response.games);
    } catch (error) {
      console.error("Failed to load games:", error);
      toast({
        title: "Error",
        description: "Failed to load game results",
        variant: "destructive",
      });
    }
  };

  const toggleGame = async (gameId: number) => {
    if (expandedGame === gameId) {
      setExpandedGame(null);
      return;
    }

    setExpandedGame(gameId);

    if (!gameDetails.has(gameId)) {
      try {
        const [details, votes] = await Promise.all([
          backend.games.get({ id: gameId }),
          backend.votes.allVotes({ gameId })
        ]);
        setGameDetails(new Map(gameDetails.set(gameId, details)));
        setVoteResults(new Map(voteResults.set(gameId, votes)));
      } catch (error) {
        console.error("Failed to load game details:", error);
        toast({
          title: "Error",
          description: "Failed to load game details",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Game Results</h1>
        <p className="text-muted-foreground">View match history and statistics</p>
      </div>

      <div className="space-y-4">
        {games.map(game => {
          const details = gameDetails.get(game.id);
          const votes = voteResults.get(game.id);
          const isExpanded = expandedGame === game.id;

          return (
            <Card key={game.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-4">
                      <span>{new Date(game.date).toLocaleDateString()}</span>
                      <span className="text-2xl font-bold">
                        Black {game.blackScore} - {game.whiteScore} White
                      </span>
                      {game.winner !== 'Draw' && (
                        <span className="text-sm font-normal text-muted-foreground">
                          ({game.winner} wins)
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <Button
                    onClick={() => toggleGame(game.id)}
                    variant="ghost"
                    size="sm"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && details && (
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Black Team</h3>
                      <div className="space-y-2">
                        {details.stats
                          .filter(s => s.team === 'Black')
                          .map(stat => (
                            <div key={stat.playerId} className="p-3 rounded-lg bg-muted/50">
                              <div className="font-semibold mb-2 flex items-center gap-2">
                                {stat.playerName}
                                {stat.manOfMatch && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                {stat.goals > 0 && (
                                  <span className="flex items-center gap-1">
                                    <CircleDot className="h-3 w-3" />
                                    {stat.goals} goals
                                  </span>
                                )}
                                {stat.assists > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Footprints className="h-3 w-3" />
                                    {stat.assists} assists
                                  </span>
                                )}
                                {stat.cleanSheet && (
                                  <span className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    Clean sheet
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">White Team</h3>
                      <div className="space-y-2">
                        {details.stats
                          .filter(s => s.team === 'White')
                          .map(stat => (
                            <div key={stat.playerId} className="p-3 rounded-lg bg-muted/50">
                              <div className="font-semibold mb-2 flex items-center gap-2">
                                {stat.playerName}
                                {stat.manOfMatch && (
                                  <Trophy className="h-4 w-4 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                {stat.goals > 0 && (
                                  <span className="flex items-center gap-1">
                                    <CircleDot className="h-3 w-3" />
                                    {stat.goals} goals
                                  </span>
                                )}
                                {stat.assists > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Footprints className="h-3 w-3" />
                                    {stat.assists} assists
                                  </span>
                                )}
                                {stat.cleanSheet && (
                                  <span className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    Clean sheet
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {votes && votes.aggregate.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Voting Results (Aggregated)
                      </h3>
                      <div className="space-y-2">
                        {votes.aggregate.map((vote, index) => (
                          <div key={vote.playerId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-muted-foreground">
                                #{index + 1}
                              </span>
                              <span className="font-semibold">{vote.playerName}</span>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <span className="text-muted-foreground">
                                🥇 {vote.firstChoiceVotes}
                              </span>
                              <span className="text-muted-foreground">
                                🥈 {vote.secondChoiceVotes}
                              </span>
                              <span className="text-muted-foreground">
                                🥉 {vote.thirdChoiceVotes}
                              </span>
                              <span className="font-bold text-primary">
                                {vote.totalPoints} pts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {votes.votes.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                            Individual Votes (Anonymous)
                          </h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Votes are shown without voter identity for privacy
                          </p>
                          <div className="space-y-1">
                            {votes.votes.map((vote) => (
                              <div key={vote.voteId} className="p-2 rounded bg-muted/30 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">🥇 {vote.firstChoice}</span>
                                  {vote.secondChoice && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-muted-foreground">🥈 {vote.secondChoice}</span>
                                    </>
                                  )}
                                  {vote.thirdChoice && (
                                    <>
                                      <span className="text-muted-foreground">•</span>
                                      <span className="text-muted-foreground">🥉 {vote.thirdChoice}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
