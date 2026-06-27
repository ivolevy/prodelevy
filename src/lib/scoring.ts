import { Match, Prediction, Profile, Standing, Team } from './types';

/**
 * Calculates standings based on match predictions and actual finished match results.
 */
export function updateStandings(
  matches: Match[],
  predictions: Prediction[],
  profiles: Profile[],
  teams?: Team[]
): Standing[] {
  const championTeam = teams?.find(t => t.stage_reached === 'champion');
  const activeProfiles = profiles.filter(p => !p.is_admin); // Exclude admin accounts from standings

  // OPTIMIZATION: Pre-map matches and pre-group predictions by participant
  const matchesMap = new Map(matches.map(m => [m.id, m]));
  
  const predictionsByParticipant = new Map<string, Prediction[]>();
  predictions.forEach(p => {
    const list = predictionsByParticipant.get(p.participant_id) || [];
    list.push(p);
    predictionsByParticipant.set(p.participant_id, list);
  });

  const standingsList: Standing[] = activeProfiles.map(profile => {
    // Find all predictions for this participant in O(1)
    const userPredictions = predictionsByParticipant.get(profile.id) || [];

    let exactGuesses = 0;
    let outcomeGuesses = 0;
    let totalPoints = 0;

    // Add 10 points if user guessed champion correctly
    if (championTeam && profile.champion_prediction === championTeam.id) {
      totalPoints += 10;
    }

    userPredictions.forEach(pred => {
      // Find match in O(1)
      const match = matchesMap.get(pred.match_id);
      if (!match || match.status !== 'finished') return;

      const actHome = match.home_score;
      const actAway = match.away_score;
      const predHome = pred.home_score;
      const predAway = pred.away_score;

      if (actHome === null || actHome === undefined || actAway === null || actAway === undefined) {
        return;
      }

      const isElimination = match.phase !== 'Fase de Grupos';
      const pointsMultiplier = isElimination ? 2 : 1;

      // 1. Exact Match
      if (predHome === actHome && predAway === actAway) {
        exactGuesses++;
        totalPoints += 3 * pointsMultiplier;
      } 
      // 2. Correct Outcome (Winner or Draw) but incorrect score
      else {
        const actualDiff = actHome - actAway;
        const predDiff = predHome - predAway;
        
        // Both predicted home win (diff > 0), both predicted draw (diff === 0), or both predicted away win (diff < 0)
        const correctOutcome = Math.sign(actualDiff) === Math.sign(predDiff);
        
        if (correctOutcome) {
          outcomeGuesses++;
          totalPoints += 1 * pointsMultiplier;
        }
      }

      // 3. Extra Time / Penalties guessing (only applies to elimination matches that ended in a draw at 90')
      if (isElimination && actHome === actAway) {
        // Did the user also predict a draw at 90'?
        const predictedDraw = predHome === predAway;
        
        if (predictedDraw) {
          // Check if actual went to penalties
          const actualWentToPenalties = match.home_penalty_score !== null && match.home_penalty_score !== undefined && match.away_penalty_score !== null && match.away_penalty_score !== undefined;
          // Check if actual went to extra time (but not penalties)
          const actualWentToExtraTime = match.home_extra_score !== null && match.home_extra_score !== undefined && match.away_extra_score !== null && match.away_extra_score !== undefined;
          
          const predWentToPenalties = pred.home_penalty_score !== null && pred.home_penalty_score !== undefined && pred.away_penalty_score !== null && pred.away_penalty_score !== undefined;
          const predWentToExtraTime = pred.home_extra_score !== null && pred.home_extra_score !== undefined && pred.away_extra_score !== null && pred.away_extra_score !== undefined;
          
          if (actualWentToPenalties && predWentToPenalties) {
            const actPenHome = match.home_penalty_score!;
            const actPenAway = match.away_penalty_score!;
            const predPenHome = pred.home_penalty_score!;
            const predPenAway = pred.away_penalty_score!;
            
            if (actPenHome === predPenHome && actPenAway === predPenAway) {
              totalPoints += 2; // Exact penalty score
            } else if (Math.sign(actPenHome - actPenAway) === Math.sign(predPenHome - predPenAway)) {
              totalPoints += 1; // Correct penalty winner
            }
          } else if (actualWentToExtraTime && !actualWentToPenalties && predWentToExtraTime && !predWentToPenalties) {
            const actExtHome = match.home_extra_score!;
            const actExtAway = match.away_extra_score!;
            const predExtHome = pred.home_extra_score!;
            const predExtAway = pred.away_extra_score!;
            
            if (actExtHome === predExtHome && actExtAway === predExtAway) {
              totalPoints += 2; // Exact extra time score
            } else if (Math.sign(actExtHome - actExtAway) === Math.sign(predExtHome - predExtAway)) {
              totalPoints += 1; // Correct extra time winner
            }
          }
        }
      }
    });

    return {
      profile_id: profile.id,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      exact_guesses: exactGuesses,
      outcome_guesses: outcomeGuesses,
      total_points: totalPoints,
    };
  });

  // Sort standings:
  // 1. Total points descending
  // 2. Exact guesses descending
  // 3. Outcome guesses descending
  const sorted = standingsList.sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    if (b.exact_guesses !== a.exact_guesses) {
      return b.exact_guesses - a.exact_guesses;
    }
    if (b.outcome_guesses !== a.outcome_guesses) {
      return b.outcome_guesses - a.outcome_guesses;
    }
    return 0;
  });

  // Assign ranks, allowing shared ranks in case of absolute ties
  let currentRank = 1;
  return sorted.map((item, index, arr) => {
    if (index > 0) {
      const prev = arr[index - 1];
      const pointsDiff = prev.total_points - item.total_points;
      const exactDiff = prev.exact_guesses - item.exact_guesses;
      const outcomeDiff = prev.outcome_guesses - item.outcome_guesses;
      
      if (pointsDiff !== 0 || exactDiff !== 0 || outcomeDiff !== 0) {
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
