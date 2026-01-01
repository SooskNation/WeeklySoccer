import { api } from "encore.dev/api";
import db from "../db";

interface ExportResponse {
  csv: string;
}

export const exportStats = api<void, ExportResponse>(
  { expose: true, method: "GET", path: "/stats/export" },
  async () => {
    const playerStatsRows = await db.queryAll<{
      player_id: number;
      player_name: string;
      games_played: number;
      total_goals: number;
      total_assists: number;
      total_motm: number;
      total_clean_sheets: number;
    }>`
      SELECT 
        p.player_id,
        p.name as player_name,
        COUNT(gs.stat_id) as games_played,
        COALESCE(SUM(gs.goals), 0) as total_goals,
        COALESCE(SUM(gs.assists), 0) as total_assists,
        COALESCE(SUM(CASE WHEN gs.man_of_match THEN 1 ELSE 0 END), 0) as total_motm,
        COALESCE(SUM(CASE WHEN gs.clean_sheet THEN 1 ELSE 0 END), 0) as total_clean_sheets
      FROM players p
      LEFT JOIN game_stats gs ON p.player_id = gs.player_id
      GROUP BY p.player_id, p.name
      ORDER BY total_goals DESC, games_played DESC
    `;

    const playerStats = [];
    for (const row of playerStatsRows) {
      const recordRow = await db.queryRow<{ total_wins: number; total_draws: number; total_losses: number }>`
        SELECT 
          COALESCE(SUM(CASE WHEN (gs.team = 'Black' AND g.black_score > g.white_score) 
                             OR (gs.team = 'White' AND g.white_score > g.black_score) 
                        THEN 1 ELSE 0 END), 0) as total_wins,
          COALESCE(SUM(CASE WHEN g.black_score = g.white_score THEN 1 ELSE 0 END), 0) as total_draws,
          COALESCE(SUM(CASE WHEN (gs.team = 'Black' AND g.black_score < g.white_score) 
                             OR (gs.team = 'White' AND g.white_score < g.black_score) 
                        THEN 1 ELSE 0 END), 0) as total_losses
        FROM game_stats gs
        JOIN games g ON gs.game_id = g.game_id
        WHERE gs.player_id = ${row.player_id}
      `;

      const gamesPlayed = Number(row.games_played);
      const wins = Number(recordRow?.total_wins || 0);
      const draws = Number(recordRow?.total_draws || 0);
      const losses = Number(recordRow?.total_losses || 0);
      const totalPoints = wins * 3 + draws * 1;
      const pointsPerGame = gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(2) : '0.00';
      const winPercentage = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : '0.0';

      playerStats.push({
        player_name: row.player_name,
        games_played: gamesPlayed,
        wins,
        draws,
        losses,
        total_points: totalPoints,
        points_per_game: pointsPerGame,
        win_percentage: winPercentage,
        goals: Number(row.total_goals),
        assists: Number(row.total_assists),
        motm: Number(row.total_motm),
        clean_sheets: Number(row.total_clean_sheets)
      });
    }

    const gameRows = await db.queryAll<{
      game_id: number;
      game_date: string;
      black_score: number;
      white_score: number;
      motm_player_name: string | null;
    }>`
      SELECT 
        g.game_id,
        to_char(g.game_date, 'YYYY-MM-DD') as game_date,
        g.black_score,
        g.white_score,
        p.name as motm_player_name
      FROM games g
      LEFT JOIN game_stats gs ON g.game_id = gs.game_id AND gs.man_of_match = true
      LEFT JOIN players p ON gs.player_id = p.player_id
      ORDER BY g.game_date DESC
    `;

    const gameResults = gameRows.map(row => ({
      game_id: row.game_id,
      date: row.game_date,
      black_score: row.black_score,
      white_score: row.white_score,
      winner: row.black_score > row.white_score ? 'Black' :
              row.white_score > row.black_score ? 'White' : 'Draw',
      motm: row.motm_player_name || 'N/A'
    }));

    const teamStatsRows = await db.queryAll<{
      team: string;
      wins: number;
      draws: number;
      losses: number;
      goals_for: number;
      goals_against: number;
    }>`
      SELECT 
        'Black' as team,
        COALESCE(SUM(CASE WHEN black_score > white_score THEN 1 ELSE 0 END), 0) as wins,
        COALESCE(SUM(CASE WHEN black_score = white_score THEN 1 ELSE 0 END), 0) as draws,
        COALESCE(SUM(CASE WHEN black_score < white_score THEN 1 ELSE 0 END), 0) as losses,
        COALESCE(SUM(black_score), 0) as goals_for,
        COALESCE(SUM(white_score), 0) as goals_against
      FROM games
      UNION ALL
      SELECT 
        'White' as team,
        COALESCE(SUM(CASE WHEN white_score > black_score THEN 1 ELSE 0 END), 0) as wins,
        COALESCE(SUM(CASE WHEN white_score = black_score THEN 1 ELSE 0 END), 0) as draws,
        COALESCE(SUM(CASE WHEN white_score < black_score THEN 1 ELSE 0 END), 0) as losses,
        COALESCE(SUM(white_score), 0) as goals_for,
        COALESCE(SUM(black_score), 0) as goals_against
      FROM games
    `;

    const teamStats = teamStatsRows.map(row => {
      const gamesPlayed = Number(row.wins) + Number(row.draws) + Number(row.losses);
      const points = Number(row.wins) * 3 + Number(row.draws);
      const goalDiff = Number(row.goals_for) - Number(row.goals_against);
      
      return {
        team: row.team,
        games_played: gamesPlayed,
        wins: Number(row.wins),
        draws: Number(row.draws),
        losses: Number(row.losses),
        goals_for: Number(row.goals_for),
        goals_against: Number(row.goals_against),
        goal_difference: goalDiff,
        points
      };
    });

    const csvSections = [];
    
    csvSections.push("TEAM STANDINGS");
    csvSections.push("Team,Games Played,Wins,Draws,Losses,Goals For,Goals Against,Goal Difference,Points");
    teamStats.forEach(stat => {
      csvSections.push(`${stat.team},${stat.games_played},${stat.wins},${stat.draws},${stat.losses},${stat.goals_for},${stat.goals_against},${stat.goal_difference},${stat.points}`);
    });
    
    csvSections.push("");
    csvSections.push("PLAYER STATISTICS");
    csvSections.push("Player Name,Games Played,Wins,Draws,Losses,Total Points,Points Per Game,Win %,Goals,Assists,MOTM,Clean Sheets");
    playerStats.forEach(stat => {
      csvSections.push(`${stat.player_name},${stat.games_played},${stat.wins},${stat.draws},${stat.losses},${stat.total_points},${stat.points_per_game},${stat.win_percentage},${stat.goals},${stat.assists},${stat.motm},${stat.clean_sheets}`);
    });
    
    csvSections.push("");
    csvSections.push("MATCH RESULTS");
    csvSections.push("Game ID,Date,Black Score,White Score,Winner,Man of the Match");
    gameResults.forEach(game => {
      csvSections.push(`${game.game_id},${game.date},${game.black_score},${game.white_score},${game.winner},${game.motm}`);
    });

    return { csv: csvSections.join("\n") };
  }
);
