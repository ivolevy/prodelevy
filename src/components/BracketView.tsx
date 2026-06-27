'use client';

import { useStore } from '@/lib/store';
import { Trophy, Shield, HelpCircle } from 'lucide-react';

export default function BracketView() {
  const matches = useStore(state => state.matches);
  const teams = useStore(state => state.teams);

  // Helper to determine the winner of a match (regular time, extra time, or penalties)
  const getMatchWinner = (matchId: number): { id: string; name: string; flag: string } | null => {
    const match = matches.find(m => m.id === matchId);
    if (!match || match.status !== 'finished') return null;

    const homeTeam = teams.find(t => t.id === match.home_team_id);
    const awayTeam = teams.find(t => t.id === match.away_team_id);

    // 1. Regular Time Winner
    if (match.home_score !== null && match.home_score !== undefined && match.away_score !== null && match.away_score !== undefined) {
      if (match.home_score > match.away_score) {
        return homeTeam ? { id: homeTeam.id, name: homeTeam.name, flag: homeTeam.flag_emoji } : null;
      }
      if (match.home_score < match.away_score) {
        return awayTeam ? { id: awayTeam.id, name: awayTeam.name, flag: awayTeam.flag_emoji } : null;
      }
    }

    // 2. Extra Time Winner
    if (match.home_extra_score !== null && match.home_extra_score !== undefined && match.away_extra_score !== null && match.away_extra_score !== undefined) {
      if (match.home_extra_score > match.away_extra_score) {
        return homeTeam ? { id: homeTeam.id, name: homeTeam.name, flag: homeTeam.flag_emoji } : null;
      }
      if (match.home_extra_score < match.away_extra_score) {
        return awayTeam ? { id: awayTeam.id, name: awayTeam.name, flag: awayTeam.flag_emoji } : null;
      }
    }

    // 3. Penalty Shootout Winner
    if (match.home_penalty_score !== null && match.home_penalty_score !== undefined && match.away_penalty_score !== null && match.away_penalty_score !== undefined) {
      if (match.home_penalty_score > match.away_penalty_score) {
        return homeTeam ? { id: homeTeam.id, name: homeTeam.name, flag: homeTeam.flag_emoji } : null;
      }
      if (match.home_penalty_score < match.away_penalty_score) {
        return awayTeam ? { id: awayTeam.id, name: awayTeam.name, flag: awayTeam.flag_emoji } : null;
      }
    }

    return null;
  };

  // 16avos de Final (Matches 73 to 88)
  const round32 = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88].map(id => {
    const match = matches.find(m => m.id === id);
    const homeTeam = match ? teams.find(t => t.id === match.home_team_id) : null;
    const awayTeam = match ? teams.find(t => t.id === match.away_team_id) : null;
    return {
      id,
      match,
      home: homeTeam ? { id: homeTeam.id, name: homeTeam.name, flag: homeTeam.flag_emoji } : null,
      away: awayTeam ? { id: awayTeam.id, name: awayTeam.name, flag: awayTeam.flag_emoji } : null,
      winner: getMatchWinner(id)
    };
  });

  // Helper to resolve virtual/computed round matches
  const resolveRound = (prevRoundSlots: any[], pairs: number[][], currentPhaseName: string) => {
    return pairs.map(([idx1, idx2], pairIdx) => {
      const parent1 = prevRoundSlots[idx1];
      const parent2 = prevRoundSlots[idx2];

      const home = parent1.winner;
      const away = parent2.winner;

      let matchId = 0;
      if (currentPhaseName === 'Octavos de Final') matchId = 89 + pairIdx;
      else if (currentPhaseName === 'Cuartos de Final') matchId = 97 + pairIdx;
      else if (currentPhaseName === 'Semifinales') matchId = 101 + pairIdx;
      else if (currentPhaseName === 'Gran Final') matchId = 103;

      const dbMatch = matches.find(m => m.id === matchId);
      const homeTeam = dbMatch ? teams.find(t => t.id === dbMatch.home_team_id) : null;
      const awayTeam = dbMatch ? teams.find(t => t.id === dbMatch.away_team_id) : null;

      return {
        id: matchId,
        match: dbMatch || null,
        home: homeTeam ? { id: homeTeam.id, name: homeTeam.name, flag: homeTeam.flag_emoji } : (home || null),
        away: awayTeam ? { id: awayTeam.id, name: awayTeam.name, flag: awayTeam.flag_emoji } : (away || null),
        winner: matchId > 0 ? getMatchWinner(matchId) : null,
        placeholderHome: `Ganador P${parent1.id}`,
        placeholderAway: `Ganador P${parent2.id}`
      };
    });
  };

  // Octavos de Final (Matches 89 to 96)
  const round16 = resolveRound(round32, [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10, 11], [12, 13], [14, 15]], 'Octavos de Final');

  // Cuartos de Final (Matches 97 to 100)
  const round8 = resolveRound(round16, [[0, 1], [2, 3], [4, 5], [6, 7]], 'Cuartos de Final');

  // Semifinales (Matches 101 to 102)
  const round4 = resolveRound(round8, [[0, 1], [2, 3]], 'Semifinales');

  // Gran Final (Match 103)
  const round2 = resolveRound(round4, [[0, 1]], 'Gran Final');

  // Helper to render match box inside bracket columns
  const renderBracketMatch = (slot: any, phaseName: string) => {
    const isFinished = slot.match?.status === 'finished';
    const isLive = slot.match?.status === 'live';

    return (
      <div 
        key={slot.id} 
        className={`w-[190px] bg-white border rounded-xl p-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all shrink-0 hover:scale-[1.01] hover:shadow-xs ${
          isLive 
            ? 'border-rose-450 bg-rose-50/5 ring-2 ring-rose-500/10' 
            : isFinished 
              ? 'border-cream-300' 
              : 'border-cream-250/90'
        }`}
      >
        {/* Match Header */}
        <div className="flex justify-between items-center text-[7px] uppercase font-black text-stone-400 mb-2">
          <span>Match {slot.id}</span>
          {isLive ? (
            <span className="text-rose-600 font-extrabold animate-pulse">VIVO</span>
          ) : isFinished ? (
            <span className="text-stone-500 font-bold">Fin</span>
          ) : (
            <span>Próx</span>
          )}
        </div>

        {/* Home Row */}
        <div className={`flex items-center justify-between py-1 rounded-sm px-1 ${slot.winner?.id && slot.winner.id === slot.home?.id ? 'bg-gold-500/5' : ''}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0" role="img" aria-label={slot.home?.name || 'Local'}>
              {slot.home?.flag || (slot.match?.home_team_id ? '🏳️' : '⏳')}
            </span>
            <span className={`text-[9.5px] truncate ${
              slot.winner?.id && slot.winner.id === slot.home?.id 
                ? 'font-black text-stone-900' 
                : slot.home?.name 
                  ? 'font-extrabold text-stone-705' 
                  : 'font-bold text-stone-400 italic'
            }`}>
              {slot.home?.name || slot.placeholderHome}
            </span>
          </div>
          {slot.match && (isFinished || isLive) && (
            <span className={`text-[10px] font-mono font-black ${
              slot.winner?.id && slot.winner.id === slot.home?.id ? 'text-stone-900' : 'text-stone-450'
            }`}>
              {slot.match.home_score}
              {slot.match.home_penalty_score !== null && `(${slot.match.home_penalty_score})`}
            </span>
          )}
        </div>

        {/* Away Row */}
        <div className={`flex items-center justify-between py-1 rounded-sm px-1 mt-0.5 ${slot.winner?.id && slot.winner.id === slot.away?.id ? 'bg-gold-500/5' : ''}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm shrink-0" role="img" aria-label={slot.away?.name || 'Visita'}>
              {slot.away?.flag || (slot.match?.away_team_id ? '🏳️' : '⏳')}
            </span>
            <span className={`text-[9.5px] truncate ${
              slot.winner?.id && slot.winner.id === slot.away?.id 
                ? 'font-black text-stone-900' 
                : slot.away?.name 
                  ? 'font-extrabold text-stone-705' 
                  : 'font-bold text-stone-400 italic'
            }`}>
              {slot.away?.name || slot.placeholderAway}
            </span>
          </div>
          {slot.match && (isFinished || isLive) && (
            <span className={`text-[10px] font-mono font-black ${
              slot.winner?.id && slot.winner.id === slot.away?.id ? 'text-stone-900' : 'text-stone-450'
            }`}>
              {slot.match.away_score}
              {slot.match.away_penalty_score !== null && `(${slot.match.away_penalty_score})`}
            </span>
          )}
        </div>
      </div>
    );
  };

  const columns = [
    { title: '16avos de Final', description: 'Ronda de 32', slots: round32 },
    { title: 'Octavos de Final', description: 'Ronda de 16', slots: round16 },
    { title: 'Cuartos de Final', description: 'Ronda de 8', slots: round8 },
    { title: 'Semifinales', description: 'Ronda de 4', slots: round4 },
    { title: 'Gran Final', description: 'Campeón', slots: round2 }
  ];

  return (
    <div className="w-full space-y-4 text-left">
      {/* Header Info */}
      <div className="border-b border-cream-200 pb-2 flex justify-between items-center">
        <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-gold-500" /> Esquema del Cuadro Mundial
        </h3>
        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-stone-300" /> Desplázate horizontalmente
        </span>
      </div>

      {/* Bracket Tree Container */}
      <div className="w-full overflow-x-auto bg-cream-50/15 border border-cream-250/90 rounded-3xl p-5 shadow-[inset_0_2px_8px_rgba(0,0,0,0.01)] scrollbar-thin">
        <div className="min-w-[1050px] h-[1050px] flex justify-between gap-6 relative select-none">
          {columns.map((col, colIdx) => (
            <div key={colIdx} className="flex flex-col w-[190px]">
              {/* Column Header */}
              <div className="text-center py-2 bg-cream-100/60 rounded-xl border border-cream-200 mb-4 shrink-0">
                <span className="block text-[8.5px] font-black text-stone-800 uppercase tracking-wider">{col.title}</span>
                <span className="block text-[7px] font-extrabold text-stone-450 uppercase tracking-widest">{col.description}</span>
              </div>

              {/* Column Slots positioned around */}
              <div className="flex-1 flex flex-col justify-around h-full py-2">
                {col.slots.map(slot => renderBracketMatch(slot, col.title))}
              </div>
            </div>
          ))}

          {/* Golden Champion trophy at the final column */}
          <div className="absolute right-0 bottom-6 w-[190px] flex flex-col items-center gap-2 border border-dashed border-gold-300/40 bg-gold-500/5 p-4 rounded-2xl text-center">
            <Trophy className="w-7 h-7 text-gold-550 animate-bounce" />
            <span className="text-[8.5px] font-black text-gold-700 uppercase tracking-widest">Campeón del Mundo</span>
            {round2[0].winner ? (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl">{round2[0].winner.flag}</span>
                <span className="text-[10px] font-black text-stone-850">{round2[0].winner.name}</span>
              </div>
            ) : (
              <span className="text-[8.5px] font-bold text-gold-650/70 italic">A definir</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
