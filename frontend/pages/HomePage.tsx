import { Link } from "react-router-dom";
import { BarChart3, Trophy, Vote, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Soccer Stats Tracker
        </h1>
        <p className="text-xl text-muted-foreground">
          Track your weekly soccer stats, vote for Man of the Match, and manage results
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">View Stats</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              See the leaderboard, top scorers, and detailed player statistics
            </p>
            <Link to="/stats">
              <Button className="w-full">View Stats</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Trophy className="h-8 w-8 text-purple-500" />
              </div>
              <h2 className="text-2xl font-bold">Game Results</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              View match history, scores, and detailed game statistics
            </p>
            <Link to="/results">
              <Button className="w-full" variant="secondary">View Results</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Vote className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold">Vote MOTM</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Cast your vote for Man of the Match with ranked voting
            </p>
            <Link to="/vote">
              <Button className="w-full" variant="secondary">Vote Now</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-orange-500/10">
                <Settings className="h-8 w-8 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold">Manager Tools</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Enter and manage game results, edit teams, and update stats
            </p>
            <Link to="/manager">
              <Button className="w-full" variant="secondary">Manage Games</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
