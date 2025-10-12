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
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3 text-primary">Soccer Stats Tracker</h3>
              <p className="text-sm text-muted-foreground">
                Track your team's performance, vote for man of the match, and view comprehensive statistics.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/stats" className="hover:text-primary transition-colors">Statistics</a></li>
                <li><a href="/vote" className="hover:text-primary transition-colors">Vote</a></li>
                <li><a href="/results" className="hover:text-primary transition-colors">Results</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <p className="text-sm text-muted-foreground">
                For questions or support, contact your team manager.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Soccer Stats Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
