import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import StatsPage from "@/pages/StatsPage";
import PlayerProfilePage from "@/pages/PlayerProfilePage";
import ManagerDashboard from "@/pages/ManagerDashboard";
import VotingPage from "@/pages/VotingPage";
import ResultsPage from "@/pages/ResultsPage";
import LoginPage from "@/pages/LoginPage";
import "@/styles/theme.css";

function AppInner() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<"player" | "manager" | null>(null);
  const [playerID, setPlayerID] = useState<number | undefined>();

  useEffect(() => {
    const role = localStorage.getItem("userRole") as "player" | "manager" | null;
    const pid = localStorage.getItem("playerID");
    if (role) {
      setIsAuthenticated(true);
      setUserRole(role);
      if (pid) setPlayerID(Number(pid));
    }
  }, []);

  const handleLogin = (role: "player" | "manager", pid?: number) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setPlayerID(pid);
    localStorage.setItem("userRole", role);
    if (pid) localStorage.setItem("playerID", pid.toString());
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setPlayerID(undefined);
    localStorage.removeItem("userRole");
    localStorage.removeItem("playerID");
    localStorage.removeItem("authToken");
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground dark">
        <Navbar onLogout={handleLogout} userRole={userRole} />
        <Layout>
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stats" element={<StatsPage />} />
              <Route path="/player/:id" element={<PlayerProfilePage />} />
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/vote" element={<VotingPage />} />
              <Route path="/results" element={<ResultsPage />} />
            </Routes>
          </main>
        </Layout>
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppInner />;
}
