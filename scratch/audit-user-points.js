const fs = require('fs');
const path = require('path');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  const headers = { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` };

  // Fetch matches
  const resMatches = await fetch(`${supabaseUrl}/rest/v1/matches?select=*`, { headers });
  const matches = await resMatches.json();
  const matchesMap = new Map(matches.map(m => [m.id, m]));

  // Fetch profiles
  const resProfiles = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*`, { headers });
  const profiles = await resProfiles.json();

  // Fetch predictions
  const resPredictions = await fetch(`${supabaseUrl}/rest/v1/predictions?select=*`, { headers });
  const predictions = await resPredictions.json();

  const user = profiles.find(p => p.display_name === 'ivo');
  if (!user) {
    console.error("User ivo not found!");
    return;
  }

  console.log(`Auditing user: ${user.display_name} (ID: ${user.id})`);
  const userPredictions = predictions.filter(p => p.participant_id === user.id);
  console.log(`Found ${userPredictions.length} predictions for this user.`);

  let exactCount = 0;
  let outcomeCount = 0;
  let calculatedPoints = 0;

  userPredictions.forEach(pred => {
    const match = matchesMap.get(pred.match_id);
    if (!match) {
      console.log(`Prediction for match ID ${pred.match_id} but match not found!`);
      return;
    }

    if (match.status !== 'finished') {
      return;
    }

    const actHome = match.home_score;
    const actAway = match.away_score;
    const predHome = pred.home_score;
    const predAway = pred.away_score;

    if (actHome === null || actHome === undefined || actAway === null || actAway === undefined) {
      return;
    }

    let points = 0;
    let type = '';

    if (predHome === actHome && predAway === actAway) {
      exactCount++;
      points = 3;
      type = 'EXACT MATCH (+3)';
    } else {
      const actualDiff = actHome - actAway;
      const predDiff = predHome - predAway;
      const correctOutcome = Math.sign(actualDiff) === Math.sign(predDiff);
      
      if (correctOutcome) {
        outcomeCount++;
        points = 1;
        type = 'CORRECT OUTCOME (+1)';
      } else {
        type = 'INCORRECT (+0)';
      }
    }

    calculatedPoints += points;
    console.log(`Match ${match.id} | ${match.home_team_id} vs ${match.away_team_id} | Actual: ${actHome}-${actAway} | Predicted: ${predHome}-${predAway} | ${type} | Pts so far: ${calculatedPoints}`);
  });

  console.log(`\nFinal Audit for ${user.display_name}:`);
  console.log(`Calculated Points: ${calculatedPoints}`);
  console.log(`Exact Guesses: ${exactCount}`);
  console.log(`Outcome Guesses: ${outcomeCount}`);
}

main().catch(console.error);
