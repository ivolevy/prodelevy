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
  const activeProfiles = profiles.filter(p => p.username !== 'test123' && !p.is_admin);

  const standingsList: Standing[] = activeProfiles.map(profile => {
    // Find all predictions for this participant
    const userPredictions = predictions.filter(p => p.participant_id === profile.id);

    let exactGuesses = 0;
    let outcomeGuesses = 0;
    let totalPoints = 0;

    // Add 10 points if user guessed champion correctly
    if (championTeam && profile.champion_prediction === championTeam.id) {
      totalPoints += 10;
    }

    userPredictions.forEach(pred => {
      const match = matches.find(m => m.id === pred.match_id);
      if (!match || match.status !== 'finished') return;

      const actHome = match.home_score;
      const actAway = match.away_score;
      const predHome = pred.home_score;
      const predAway = pred.away_score;

      if (actHome === null || actHome === undefined || actAway === null || actAway === undefined) {
        return;
      }

      // 1. Exact Match
      if (predHome === actHome && predAway === actAway) {
        exactGuesses++;
        totalPoints += 3;
      } 
      // 2. Correct Outcome (Winner or Draw) but incorrect score
      else {
        const actualDiff = actHome - actAway;
        const predDiff = predHome - predAway;
        
        // Both predicted home win (diff > 0), both predicted draw (diff === 0), or both predicted away win (diff < 0)
        const correctOutcome = Math.sign(actualDiff) === Math.sign(predDiff);
        
        if (correctOutcome) {
          outcomeGuesses++;
          totalPoints += 1;
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
