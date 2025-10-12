import { Link } from "react-router-dom";
import { Home, BarChart3, Trophy, Vote, Settings, LogOut } from "lucide-react";
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
      onLogout();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <Trophy className="h-6 w-6 text-primary" />
            <span>Soccer Stats Tracker</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <Link to="/stats" className="flex items-center gap-2 hover:text-primary transition-colors">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </Link>
            <Link to="/results" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </Link>
            <Link to="/vote" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Vote className="h-4 w-4" />
              <span className="hidden sm:inline">Vote</span>
            </Link>
            {userRole === "manager" && (
              <Link to="/manager" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Manager</span>
              </Link>
            )}
            
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
