import { Link } from "react-router-dom";
import { BarChart3, Trophy, Calendar, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="bg-[#0a1e3d] min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-[#ffd700]">
            Sunday Soccer Stats Tracker
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 px-4">
            Track your weekly soccer stats, vote for Man of the Match, and manage results
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-[#0f2847] border-[#1a3a5c] hover:border-[#ffd700]/40 transition-all hover:shadow-lg hover:shadow-[#ffd700]/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 rounded-lg bg-[#1a3a5c]">
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-[#ffd700]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">View Stats</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                See the leaderboard, top scorers, and detailed player statistics
              </p>
              <Link to="/stats">
                <Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#234a6f] font-bold border border-[#2a4a6c]">View Stats</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[#0f2847] border-[#1a3a5c] hover:border-[#ffd700]/40 transition-all hover:shadow-lg hover:shadow-[#ffd700]/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 rounded-lg bg-[#1a3a5c]">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-[#ffd700]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Game Results</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                View match history, scores, and detailed game statistics
              </p>
              <Link to="/results">
                <Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#234a6f] font-bold border border-[#2a4a6c]">View Results</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[#0f2847] border-[#1a3a5c] hover:border-[#ffd700]/40 transition-all hover:shadow-lg hover:shadow-[#ffd700]/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 rounded-lg bg-[#1a3a5c]">
                  <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-[#ffd700]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Vote MOTM</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                Cast your vote for Man of the Match with ranked voting
              </p>
              <Link to="/vote">
                <Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#234a6f] font-bold border border-[#2a4a6c]">Vote Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-[#0f2847] border-[#1a3a5c] hover:border-[#ffd700]/40 transition-all hover:shadow-lg hover:shadow-[#ffd700]/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 rounded-lg bg-[#1a3a5c]">
                  <Settings className="h-6 w-6 sm:h-8 sm:w-8 text-[#ffd700]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Enter Match Results</h2>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                Enter and manage game results, edit teams, and update stats
              </p>
              <Link to="/login?redirect=/manager">
                <Button className="w-full bg-[#1a3a5c] text-white hover:bg-[#234a6f] font-bold border border-[#2a4a6c]">Enter Results</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
