import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface TopPlayer {
  playerId: number;
  playerName: string;
  value: number;
  gamesPlayed: number;
}

interface Top3StatCardProps {
  title: string;
  players: TopPlayer[];
  icon: LucideIcon;
  valueLabel: string;
}

export default function Top3StatCard({ title, players, icon: Icon, valueLabel }: Top3StatCardProps) {
  if (players.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent className="space-y-3">
        {players.slice(0, 3).map((player, index) => (
          <div
            key={player.playerId}
            className={`flex items-center justify-between ${
              index === 0 ? 'text-base' : 'text-sm'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`font-bold ${
                index === 0 ? 'text-primary text-xl' : 
                index === 1 ? 'text-muted-foreground text-lg' : 
                'text-muted-foreground'
              }`}>
                {index + 1}.
              </span>
              <span className={index === 0 ? 'font-bold' : 'font-medium'}>
                {player.playerName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${
                index === 0 ? 'font-bold text-primary' : 'text-muted-foreground'
              }`}>
                {player.value} {valueLabel}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
