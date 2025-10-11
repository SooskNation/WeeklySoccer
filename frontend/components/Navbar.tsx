import { Link } from "react-router-dom";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/clerk-react";
import { Home, BarChart3, Trophy, Vote, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { isSignedIn } = useUser();

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
            <Link to="/manager" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Manager</span>
            </Link>
            
            <div className="flex items-center gap-2 ml-4">
              {isSignedIn ? (
                <UserButton />
              ) : (
                <>
                  <SignInButton mode="modal">
                    <Button variant="ghost" size="sm">Login</Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button size="sm">Register</Button>
                  </SignUpButton>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
