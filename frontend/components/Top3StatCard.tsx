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
  icon?: LucideIcon;
  valueLabel: string;
}

export default function Top3StatCard({ title, players, icon: Icon, valueLabel }: Top3StatCardProps) {
  if (players.length === 0) {
    return (
      <Card className="bg-[#0f2847] border-[#1a3a5c]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#ffd700]">{title}</CardTitle>
          {Icon && <Icon className="h-5 w-5 text-[#ffd700]" />}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#0f2847] border-[#1a3a5c]">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-[#ffd700]">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-[#ffd700]" />}
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
                index === 0 ? 'text-[#ffd700] text-xl' : 
                index === 1 ? 'text-gray-400 text-lg' : 
                'text-gray-400'
              }`}>
                {index + 1}.
              </span>
              <span className={`${index === 0 ? 'font-bold text-white' : 'font-medium text-gray-300'}`}>
                {player.playerName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${
                index === 0 ? 'font-bold text-[#ffd700]' : 'text-gray-400'
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
