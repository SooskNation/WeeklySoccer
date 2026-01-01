import { api } from "encore.dev/api";
import db from "../db";

interface ExportGamesResponse {
  csv: string;
}

export const exportGames = api<void, ExportGamesResponse>(
  { expose: true, method: "GET", path: "/games/export" },
  async () => {
    const games = await db.queryAll<{
      game_id: number;
      game_date: string;
      black_score: number;
      white_score: number;
      motm_finalized: boolean;
    }>`
      SELECT game_id, to_char(game_date, 'YYYY-MM-DD') as game_date, 
             black_score, white_score, COALESCE(motm_finalized, false) as motm_finalized
      FROM games
      ORDER BY game_date DESC
    `;

    const csvRows: string[] = [];
    csvRows.push("Game ID,Date,Black Score,White Score,Winner,MOTM,Player Name,Team,Goals,Assists,Own Goals,Captain,Goalkeeper,Clean Sheet");

    for (const game of games) {
      const statsRows = await db.queryAll<{
        player_id: number;
        player_name: string;
        team: string;
        goals: number;
        assists: number;
        own_goals: number;
        is_goalkeeper: boolean;
        is_captain: boolean;
        clean_sheet: boolean;
        man_of_match: boolean;
      }>`
        SELECT gs.player_id, p.name as player_name, gs.team, gs.goals, gs.assists, 
               COALESCE(gs.own_goals, 0) as own_goals,
               COALESCE(gs.is_goalkeeper, false) as is_goalkeeper,
               COALESCE(gs.is_captain, false) as is_captain,
               gs.clean_sheet, gs.man_of_match
        FROM game_stats gs
        JOIN players p ON gs.player_id = p.player_id
        WHERE gs.game_id = ${game.game_id}
        ORDER BY gs.team, p.name
      `;

      const winner = game.black_score > game.white_score ? 'Black' :
                     game.white_score > game.black_score ? 'White' : 'Draw';
      
      const motmPlayer = statsRows.find(s => s.man_of_match);
      const motmName = motmPlayer ? motmPlayer.player_name : 'N/A';

      for (const stat of statsRows) {
        csvRows.push([
          game.game_id,
          game.game_date,
          game.black_score,
          game.white_score,
          winner,
          motmName,
          stat.player_name,
          stat.team,
          stat.goals,
          stat.assists,
          stat.own_goals,
          stat.is_captain ? 'Yes' : 'No',
          stat.is_goalkeeper ? 'Yes' : 'No',
          stat.clean_sheet ? 'Yes' : 'No'
        ].join(','));
      }
    }

    return { csv: csvRows.join('\n') };
  }
);
