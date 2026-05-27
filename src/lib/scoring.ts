import { Team, ParticipantSelection, Standing } from './types';

export const STAGE_POINTS: Record<string, number> = {
  group: 0,
  octavos: 1,
  cuartos: 2,
  semifinal: 3,
  finalist: 5,
  champion: 8
};

/**
 * Calculates the score based on the highest stage reached by a team (non-cumulative).
 */
export function calculatePoints(teamStage: string): number {
  return STAGE_POINTS[teamStage.toLowerCase()] || 0;
}

/**
 * Retrieves the maximum stage reached by a team name or ID.
 */
export function getTeamStage(teamNameOrId: string, teams: Team[]): string {
  const team = teams.find(t => t.id === teamNameOrId || t.name === teamNameOrId);
  return team ? team.stage_reached : 'group';
}

/**
 * Compares two standings to determine who has the tiebreak advantage.
 * Returns negative if a wins tiebreak (should be higher rank), positive if b wins, 0 if identical.
 */
export function breakTie(a: Standing, b: Standing): number {
  // 1. Gana quien tenga al campeón del mundo
  const aHasChamp = a.has_champion ? 1 : 0;
  const bHasChamp = b.has_champion ? 1 : 0;
  if (bHasChamp !== aHasChamp) {
    return bHasChamp - aHasChamp; // 1 (b has champ, so b ranks higher/lower index) or -1 (a ranks higher)
  }

  // 2. Si sigue el empate, gana quien tenga más finalistas
  if (b.finalists_count !== a.finalists_count) {
    return b.finalists_count - a.finalists_count;
  }

  // 3. Si sigue igual, se define por penales, moneda o batalla campal familiar (0)
  return 0;
}

/**
 * Generates the full rankings table and assigns ranks, sorting by points and tiebreakers.
 */
export function updateStandings(teams: Team[], selections: ParticipantSelection[]): Standing[] {
  const list: Standing[] = selections.map(sel => {
    const team1 = sel.team1_id ? teams.find(t => t.id === sel.team1_id) : undefined;
    const team2 = sel.team2_id ? teams.find(t => t.id === sel.team2_id) : undefined;

    const team1_points = team1 ? calculatePoints(team1.stage_reached) : 0;
    const team2_points = team2 ? calculatePoints(team2.stage_reached) : 0;
    const total_points = team1_points + team2_points;

    const has_champion = 
      (team1?.stage_reached === 'champion') || 
      (team2?.stage_reached === 'champion');

    const finalists_count = 
      (team1 && (team1.stage_reached === 'finalist' || team1.stage_reached === 'champion') ? 1 : 0) +
      (team2 && (team2.stage_reached === 'finalist' || team2.stage_reached === 'champion') ? 1 : 0);

    return {
      profile_id: sel.profile_id,
      display_name: sel.manual_name || 'Participante',
      avatar_url: sel.manual_avatar || '',
      team1,
      team2,
      team1_points,
      team2_points,
      total_points,
      has_champion,
      finalists_count
    };
  });

  // Sort: Primary by total points descending, secondary by breakTie
  const sorted = list.sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    return breakTie(a, b);
  });

  // Assign ranks, allowing shared ranks in case of absolute ties
  let currentRank = 1;
  return sorted.map((item, index, arr) => {
    if (index > 0) {
      const prev = arr[index - 1];
      const pointsDiff = prev.total_points - item.total_points;
      const tieDiff = breakTie(prev, item);
      
      if (pointsDiff !== 0 || tieDiff !== 0) {
        currentRank = index + 1;
      }
    }
    return {
      ...item,
      rank: currentRank
    };
  });
}

/**
 * Determines the absolute winner from a standings array.
 */
export function determineWinner(standings: Standing[]): Standing | null {
  if (standings.length === 0) return null;
  // The first element in sorted standings is the winner
  return standings[0];
}
