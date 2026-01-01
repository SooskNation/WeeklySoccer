import { Link } from "react-router-dom";
import { Home, BarChart3, Trophy, Calendar, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import backend from "~backend/client";

interface NavbarProps {
  onLogout: () => void;
  userRole: "player" | "manager" | null;
}

export default function Navbar({ onLogout, userRole }: NavbarProps) {
  const handleLogout = async () => {
    try {
      await backend.auth.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      onLogout();
    }
  };

  return (
    <nav className="border-b border-[#1a3a5c] bg-[#0f2847]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Trophy className="h-6 w-6 text-[#ffd700]" />
            <span>Soccer Stats Tracker</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-[#ffd700] transition-colors">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link to="/stats" className="flex items-center gap-2 text-gray-300 hover:text-[#ffd700] transition-colors">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </Link>
            <Link to="/results" className="flex items-center gap-2 text-gray-300 hover:text-[#ffd700] transition-colors">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </Link>
            <Link to="/vote" className="flex items-center gap-2 text-gray-300 hover:text-[#ffd700] transition-colors">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Vote</span>
            </Link>
            {userRole === "manager" && (
              <Link to="/manager" className="flex items-center gap-2 text-gray-300 hover:text-[#ffd700] transition-colors">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Enter Results</span>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout} 
              className="cursor-pointer ml-4 text-gray-300 hover:text-[#ffd700] hover:bg-[#1a3a5c]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
