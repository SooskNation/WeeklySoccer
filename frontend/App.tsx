import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import StatsPage from "@/pages/StatsPage";
import PlayerProfilePage from "@/pages/PlayerProfilePage";
import ManagerDashboard from "@/pages/ManagerDashboard";
import VotingPage from "@/pages/VotingPage";
import ResultsPage from "@/pages/ResultsPage";

const PUBLISHABLE_KEY = "pk_test_c3RpcnJpbmctaGFtc3Rlci03Mi5jbGVyay5hY2NvdW50cy5kZXYk";

function AppInner() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground dark">
        <Navbar />
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
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <AppInner />
    </ClerkProvider>
  );
}
