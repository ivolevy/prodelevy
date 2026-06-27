'use client';

import { useStore } from '@/lib/store';
import { Trophy, Shield, Calendar } from 'lucide-react';

export default function BracketView() {
  const matches = useStore(state => state.matches);
  const teams = useStore(state => state.teams);

  // Get all matches for the 16avos de Final (Round of 32) phase
  const last32Matches = matches.filter(m => m.phase === '16avos de Final' || (m.id >= 73 && m.id <= 88));

  const phases = [
    { name: '16avos de Final', description: '32 Equipos', active: true },
    { name: 'Octavos de Final', description: '16 Equipos', active: false },
    { name: 'Cuartos de Final', description: '8 Equipos', active: false },
    { name: 'Semifinales', description: '4 Equipos', active: false },
    { name: 'Gran Final', description: '2 Equipos', active: false }
  ];

  // Helper to fetch team details
  const getTeam = (teamId: string) => teams.find(t => t.id === teamId);

  return (
    <div className="w-full space-y-6 text-left">
      {/* Header Info */}
      <div className="border-b border-cream-200 pb-2 flex justify-between items-center">
        <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-gold-500" /> Cuadro Eliminatorio
        </h3>
        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">
          Mundial 2026
        </span>
      </div>

      {/* Visual Road/Timeline of Phases */}
      <div className="bg-cream-50/40 p-4 rounded-3xl border border-cream-200">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {phases.map((phase, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-2xl border text-center transition-all ${
                phase.active 
                  ? 'bg-gold-500/10 border-gold-500/30 shadow-3xs' 
                  : 'bg-white/50 border-cream-200/50'
              }`}
            >
              <span className={`block text-[9px] font-black uppercase ${
                phase.active ? 'text-gold-700' : 'text-stone-700'
              }`}>
                {phase.name}
              </span>
              <span className="block text-[7.5px] font-bold text-stone-400 uppercase mt-0.5">
                {phase.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 16avos Matches Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pl-1">
          <h4 className="text-[9.5px] font-black tracking-widest text-stone-800 uppercase flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-gold-500" /> Partidos de 16avos de Final
          </h4>
          <span className="text-[8.5px] text-stone-450 font-bold uppercase tracking-wider bg-cream-100 px-2 py-0.5 rounded-lg border border-cream-200">
            {last32Matches.length} Partidos
          </span>
        </div>

        {last32Matches.length === 0 ? (
          <div className="text-center py-12 bg-white border border-cream-300 rounded-3xl p-6">
            <p className="text-[11px] text-stone-500">No hay partidos cargados para esta fase.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {last32Matches.map(match => {
              const homeTeam = getTeam(match.home_team_id);
              const awayTeam = getTeam(match.away_team_id);
              
              const isFinished = match.status === 'finished';
              const isLive = match.status === 'live';

              return (
                <div 
                  key={match.id}
                  className={`p-4 rounded-2xl border bg-white flex flex-col justify-between shadow-2xs hover:border-cream-400 transition-all ${
                    isLive ? 'border-rose-400 bg-rose-50/5' : 'border-cream-300'
                  }`}
                >
                  {/* Top info row */}
                  <div className="flex justify-between items-center text-[7.5px] uppercase font-black text-stone-400 tracking-wider mb-3">
                    <span>Partido {match.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 font-bold lowercase text-stone-500">
                        <Calendar className="w-3 h-3 text-stone-400" /> {match.fecha}
                      </span>
                      {isLive ? (
                        <span className="bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded animate-pulse">VIVO</span>
                      ) : isFinished ? (
                        <span className="bg-cream-200 text-stone-650 px-1.5 py-0.5 rounded">Finalizado</span>
                      ) : (
                        <span className="bg-cream-100 text-stone-500 px-1.5 py-0.5 rounded">Próximo</span>
                      )}
                    </div>
                  </div>

                  {/* Scoreboard line */}
                  <div className="flex items-center justify-between py-1">
                    {/* Home Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-xl shrink-0" role="img" aria-label={homeTeam?.name || 'Home'}>
                        {homeTeam?.flag_emoji || (match.home_team_id ? '🏳️' : '⏳')}
                      </span>
                      <span className="text-[11px] font-extrabold text-stone-850 truncate">
                        {homeTeam?.name || match.home_team_id || 'A confirmar'}
                      </span>
                    </div>

                    {/* Score / VS Display */}
                    <div className="flex flex-col items-center px-3 min-w-[70px] text-center">
                      {isFinished || isLive ? (
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-black text-stone-900 tracking-wider">
                            {match.home_score} - {match.away_score}
                          </span>
                          {match.home_penalty_score !== null && match.home_penalty_score !== undefined && (
                            <span className="text-[8.5px] font-black text-rose-600 tracking-tight mt-0.5">
                              ({match.home_penalty_score}-{match.away_penalty_score} PK)
                            </span>
                          )}
                          {match.home_extra_score !== null && match.home_extra_score !== undefined && (match.home_penalty_score === null || match.home_penalty_score === undefined) && (
                            <span className="text-[7.5px] font-black text-gold-650 tracking-tight mt-0.5 uppercase">
                              {match.home_extra_score}-{match.away_extra_score} TE
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[8px] font-bold text-stone-400 bg-cream-100 border border-cream-200 px-2 py-0.5 rounded-md">
                          {match.hora_arg.split('-')[0].substring(0, 5)} hs
                        </span>
                      )}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
                      <span className="text-[11px] font-extrabold text-stone-850 truncate">
                        {awayTeam?.name || match.away_team_id || 'A confirmar'}
                      </span>
                      <span className="text-xl shrink-0" role="img" aria-label={awayTeam?.name || 'Away'}>
                        {awayTeam?.flag_emoji || (match.away_team_id ? '🏳️' : '⏳')}
                      </span>
                    </div>
                  </div>

                  {/* Venue info line */}
                  <div className="border-t border-cream-100 pt-2.5 mt-2.5 flex justify-between items-center text-[7.5px] font-bold text-stone-450 uppercase tracking-wider">
                    <span>{match.estadio}, {match.ciudad}</span>
                    <span>{match.pais}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
