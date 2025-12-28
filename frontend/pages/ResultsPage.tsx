import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuthenticatedBackend } from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Edit } from "lucide-react";
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const backend = getAuthenticatedBackend();
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
        const backend = getAuthenticatedBackend();
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
    <div className="bg-[#0a1e3d] min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 text-[#ffd700]">Game Results</h1>
          <p className="text-gray-400">View match history and statistics</p>
        </div>

        <div className="space-y-4">
          {games.map(game => {
            const details = gameDetails.get(game.id);
            const votes = voteResults.get(game.id);
            const isExpanded = expandedGame === game.id;

            return (
              <Card key={game.id} className="bg-[#0f2847] border-[#1a3a5c]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div 
                      className="space-y-1 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleGame(game.id)}
                    >
                      <CardTitle className="flex items-center gap-4 text-white">
                        <span className="text-gray-400 text-lg">{new Date(game.date + 'T00:00:00').toLocaleDateString()}</span>
                        <span className="text-3xl font-bold">
                          <span className="text-white">Black</span> <span className="text-[#ffd700]">{game.blackScore}</span> - <span className="text-[#ffd700]">{game.whiteScore}</span> <span className="text-white">White</span>
                        </span>
                        {game.winner !== 'Draw' && (
                          <span className="text-sm font-normal text-gray-400">
                            ({game.winner} wins)
                          </span>
                        )}
                        {game.winner === 'Draw' && (
                          <span className="text-sm font-normal text-gray-400">
                            (Draw)
                          </span>
                        )}
                      </CardTitle>
                    </div>
                    {userRole === 'manager' && (
                      <Link
                        to={`/modify-results/${game.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-[#1a3a5c] hover:bg-[#234a6f] text-[#ffd700] rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-sm font-medium">Modify</span>
                      </Link>
                    )}
                  </div>
                </CardHeader>

                {isExpanded && details && (
                  <CardContent className="space-y-6 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-[#ffd700]">Black Team</h3>
                        <div className="space-y-2">
                          {details.stats
                            .filter(s => s.team === 'Black')
                            .map(stat => (
                              <div key={stat.playerId} className="bg-[#1a3a5c] rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{stat.playerName}</span>
                                    {stat.manOfMatch && (
                                      <Trophy className="h-4 w-4 text-[#ffd700]" />
                                    )}
                                  </div>
                                  <div className="flex gap-4 text-sm">
                                    {stat.goals > 0 && (
                                      <span className="flex items-center gap-1 text-gray-300">
                                        <img src="/soccer-ball.jpg" alt="Goal" className="h-5.5 w-5.5 rounded-full object-cover" />
                                        {stat.goals}
                                      </span>
                                    )}
                                    {stat.assists > 0 && (
                                      <span className="flex items-center gap-1 text-gray-300">
                                        <img src="/assist.png" alt="Assist" className="h-4 w-4 object-contain" />
                                        {stat.assists}
                                      </span>
                                    )}
                                    {stat.cleanSheet && (
                                      <span className="flex items-center gap-1 text-gray-300">
                                        <img src="/gloves.png" alt="Clean Sheet" className="h-4 w-4 object-contain" />
                                        CS
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-[#ffd700]">White Team</h3>
                        <div className="space-y-2">
                          {details.stats
                            .filter(s => s.team === 'White')
                            .map(stat => (
                              <div key={stat.playerId} className="bg-[#1a3a5c] rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-white">{stat.playerName}</span>
                                    {stat.manOfMatch && (
                                      <Trophy className="h-4 w-4 text-[#ffd700]" />
                                    )}
                                  </div>
                                  <div className="flex gap-4 text-sm">
                                    {stat.goals > 0 && (
                                      <span className="flex items-center gap-1 text-gray-300">
                                        <img src="/soccer-ball.jpg" alt="Goal" className="h-5.5 w-5.5 rounded-full object-cover" />
                                        {stat.goals}
                                      </span>
                                    )}
                                    {stat.assists > 0 && (
                                      <span className="flex items-center gap-1 text-gray-300">
                                        <img src="/assist.png" alt="Assist" className="h-4 w-4 object-contain" />
                                        {stat.assists}
                                      </span>
                                    )}
                                    {stat.cleanSheet && (
                                      <span className="flex items-center gap-1 text-gray-300">
                                        <img src="/gloves.png" alt="Clean Sheet" className="h-4 w-4 object-contain" />
                                        CS
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>

                    {votes && votes.aggregate.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#ffd700]">
                          <Trophy className="h-5 w-5" />
                          Voting Results (Aggregated)
                        </h3>
                        <div className="space-y-2">
                          {votes.aggregate.map((vote, index) => (
                            <div key={vote.playerId} className="flex items-center justify-between p-3 rounded-lg bg-[#1a3a5c]">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-gray-400">
                                  #{index + 1}
                                </span>
                                <span className="font-semibold text-white">{vote.playerName}</span>
                              </div>
                              <div className="flex items-center gap-6 text-sm">
                                <span className="text-gray-300">
                                  🥇 {vote.firstChoiceVotes}
                                </span>
                                <span className="text-gray-300">
                                  🥈 {vote.secondChoiceVotes}
                                </span>
                                <span className="text-gray-300">
                                  🥉 {vote.thirdChoiceVotes}
                                </span>
                                <span className="font-bold text-[#ffd700]">
                                  {vote.totalPoints} pts
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {votes.votes.length > 0 && (
                          <div className="mt-6">
                            <h4 className="text-sm font-semibold mb-2 text-gray-400">
                              Individual Votes (Anonymous)
                            </h4>
                            <p className="text-xs text-gray-500 mb-3">
                              Votes are shown without voter identity for privacy
                            </p>
                            <div className="space-y-1">
                              {votes.votes.map((vote) => (
                                <div key={vote.voteId} className="p-2 rounded bg-[#1a3a5c] text-sm">
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <span className="font-medium">🥇 {vote.firstChoice}</span>
                                    {vote.secondChoice && (
                                      <>
                                        <span className="text-gray-500">•</span>
                                        <span>🥈 {vote.secondChoice}</span>
                                      </>
                                    )}
                                    {vote.thirdChoice && (
                                      <>
                                        <span className="text-gray-500">•</span>
                                        <span>🥉 {vote.thirdChoice}</span>
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
    </div>
  );
}
