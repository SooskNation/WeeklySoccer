import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-[#1a3a5c] bg-[#0f2847] mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3 text-[#ffd700]">Soccer Stats Tracker</h3>
              <p className="text-sm text-gray-400">
                Track your team's performance, vote for man of the match, and view comprehensive statistics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/stats" className="hover:text-[#ffd700] transition-colors">Statistics</a></li>
                <li><a href="/vote" className="hover:text-[#ffd700] transition-colors">Vote</a></li>
                <li><a href="/results" className="hover:text-[#ffd700] transition-colors">Results</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-white">Contact</h4>
              <p className="text-sm text-gray-400">
                For questions or support, contact your team manager.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[#1a3a5c] text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Soccer Stats Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
