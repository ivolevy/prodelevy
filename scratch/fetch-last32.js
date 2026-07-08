const fs = require('fs');
const path = require('path');

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = (match[2] || '').replace(/['\"]/g, '').trim();
});
const apiKey = env.FOOTBALL_DATA_API_KEY;

fetch('https://api.football-data.org/v4/competitions/WC/matches', {
  headers: { 'X-Auth-Token': apiKey }
}).then(r => r.json()).then(data => {
  const last32 = data.matches.filter(m => m.stage === 'LAST_32');
  const formatted = last32.map((m, idx) => {
    return {
      id: idx + 73,
      home_team_id: m.homeTeam ? m.homeTeam.tla : null,
      away_team_id: m.awayTeam ? m.awayTeam.tla : null,
      fecha: m.utcDate.split('T')[0],
      hora_arg: new Date(m.utcDate).toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour12: false }) + '-03:00',
      estadio: m.venue || 'TBD',
      ciudad: m.venue ? m.venue.split(' ')[0] : 'TBD',
      pais: m.venue ? (m.venue.includes('Estadio') || m.venue.includes('Mexico') ? 'México' : m.venue.includes('Toronto') || m.venue.includes('BC') ? 'Canadá' : 'Estados Unidos') : 'TBD',
      status: 'upcoming',
      phase: '16avos de Final'
    };
  });
  console.log(JSON.stringify(formatted, null, 2));
}).catch(console.error);
