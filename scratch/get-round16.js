const apiKey = '910ec83598a64f218d99058e0429ab3a';

async function getRound16() {
  try {
    const url = 'https://api.football-data.org/v4/competitions/WC/matches';
    const res = await fetch(url, {
      headers: {
        'X-Auth-Token': apiKey
      }
    });

    if (!res.ok) {
      const text = await res.text();
      console.log('Error body:', text);
      return;
    }

    const data = await res.json();
    
    console.log('--- LAST_32 (R32) MATCHES WITH RESULTS ---');
    const r32 = data.matches.filter(m => m.stage === 'LAST_32');
    r32.forEach(m => {
      console.log(`API Match ID: ${m.id} | ${m.homeTeam?.tla} vs ${m.awayTeam?.tla} | Status: ${m.status}`);
      console.log(`  Winner: ${m.score?.winner} | Duration: ${m.score?.duration}`);
      console.log(`  FT: ${m.score?.fullTime?.home} - ${m.score?.fullTime?.away}`);
      if (m.score?.regularTime) console.log(`  RT: ${m.score?.regularTime?.home} - ${m.score?.regularTime?.away}`);
      if (m.score?.extraTime) console.log(`  ET: ${m.score?.extraTime?.home} - ${m.score?.extraTime?.away}`);
      if (m.score?.penalties) console.log(`  Pen: ${m.score?.penalties?.home} - ${m.score?.penalties?.away}`);
    });

    console.log('\n--- LAST_16 (R16) MATCHES DEFINED ---');
    const r16 = data.matches.filter(m => m.stage === 'LAST_16');
    r16.forEach(m => {
      console.log(JSON.stringify({
        api_id: m.id,
        home: m.homeTeam?.tla,
        away: m.awayTeam?.tla,
        utcDate: m.utcDate,
        venue: m.venue,
        status: m.status,
        stage: m.stage
      }, null, 2));
    });
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

getRound16();
