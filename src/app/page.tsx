'use client';

import { useStore } from '@/lib/store';
import Countdown from '@/components/Countdown';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, AlertCircle, ArrowRight, Sparkles, ChevronRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { calculatePoints } from '@/lib/scoring';

export default function Home() {
  const { 
    standings, 
    selections, 
    matches, 
    currentProfileId, 
    autoSeedDraft, 
    isDemoMode,
    isLoading 
  } = useStore();

  const currentSelection = selections.find(s => s.profile_id === currentProfileId);

  const liveMatches = matches.filter(m => m.status === 'live');
  const upcomingMatches = matches.filter(m => m.status === 'upcoming').slice(0, 3);
  const featuredMatches = [...liveMatches, ...upcomingMatches].slice(0, 3);

  const totalDraftedCount = selections.filter(s => s.team1_id && s.team2_id).length;

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#c5a880', '#b59469', '#1c1917']
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cream-300 border-t-gold-500 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Cargando</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-stone-900 max-w-5xl mx-auto pt-2">
      {/* Editorial Title */}
      <div className="text-center space-y-1.5 pb-2 border-b border-cream-300">
        <h2 className="text-[11px] tracking-widest font-black uppercase text-stone-400">
          USA-MEX WC 2026
        </h2>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 leading-none uppercase">
          PRODE FLIA. LEVY 2026
        </h1>
      </div>

      {/* Countdown Strip */}
      <Countdown />

      {/* Draft Notification / Action */}
      {totalDraftedCount < 5 && isDemoMode && (
        <div className="bg-gold-100/20 border border-gold-500/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
          <div className="flex gap-2.5 items-start text-left">
            <div>
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-750">Draft en Curso</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Para habilitar y probar la tabla de posiciones inmediatamente, podés auto-completar el draft.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              await autoSeedDraft();
              triggerConfetti();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all shrink-0 shadow-sm"
          >
            Auto-Completar
          </button>
        </div>
      )}      {/* Pending draft selection clean inline notification */}
      {(!currentSelection?.team1_id || !currentSelection?.team2_id) && (
        <div className="bg-amber-50/40 border border-amber-250/30 rounded-xl p-3.5 flex justify-between items-center text-xs shadow-xs max-w-5xl mx-auto">
          <span className="text-stone-600 font-semibold">Tus selecciones de países están pendientes para registrar tus puntos.</span>
          <Link href="/draft" className="text-gold-600 font-extrabold uppercase tracking-wider text-[10px] hover:underline shrink-0 ml-4">
            Elegir países →
          </Link>
        </div>
      )}

      {/* Responsive Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Standings (Leaderboard takes center stage) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="border-b border-cream-200 pb-1.5 flex justify-between items-center">
            <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black">TABLA DE POSICIONES</h3>
            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">Mundial Familiar 2026</span>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {standings.map((standing, index) => {
                const isCurrentUser = standing.profile_id === currentProfileId;
                const isLast = index === standings.length - 1 && standings.length === 5;
                const initials = standing.display_name ? standing.display_name.substring(0, 2).toUpperCase() : 'US';
                
                let badge = `${index + 1}`;
                let badgeColor = 'text-stone-400 font-semibold';
                if (index === 0) {
                  badge = '1';
                  badgeColor = 'text-gold-650 font-black';
                }

                return (
                  <motion.div
                    key={standing.profile_id}
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`glass-card p-4 flex items-center justify-between border shadow-sm ${
                      isCurrentUser 
                        ? 'border-gold-500 bg-gold-100/10' 
                        : isLast
                          ? 'border-rose-200 bg-rose-50/20'
                          : 'border-cream-300 hover:border-cream-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 flex items-center justify-center text-xs ${badgeColor}`}>
                        {badge}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cream-200 flex items-center justify-center text-[8px] font-bold text-stone-600">
                            {initials}
                          </span>
                          <h4 className={`text-xs font-bold ${isCurrentUser ? 'text-stone-900' : 'text-stone-700'}`}>
                            {standing.display_name}
                          </h4>
                          {isCurrentUser && (
                            <span className="text-[7px] font-bold uppercase tracking-widest text-gold-600 bg-gold-500/10 px-1.5 rounded border border-gold-500/25">Tú</span>
                          )}
                        </div>
                        
                        {/* Selections */}
                        <div className="flex gap-1.5 mt-2 items-center">
                          {standing.team1 ? (
                            <span className="text-[9px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700" title={standing.team1.name}>
                              {standing.team1.id}
                            </span>
                          ) : (
                            <span className="text-[8px] font-mono bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-300">--</span>
                          )}
                          {standing.team2 ? (
                            <span className="text-[9px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700" title={standing.team2.name}>
                              {standing.team2.id}
                            </span>
                          ) : (
                            <span className="text-[8px] font-mono bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-300">--</span>
                          )}
                          <span className="text-[8px] text-stone-400 ml-1 font-semibold uppercase tracking-wider">
                            ({standing.team1?.name || '?'}, {standing.team2?.name || '?'})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isLast && (
                        <span className="text-[7px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                          Castigo
                        </span>
                      )}
                      <div className="text-right min-w-[30px]">
                        <span className="text-xl font-bold text-stone-900">{standing.total_points}</span>
                        <p className="text-[7px] text-stone-450 uppercase tracking-widest leading-none font-bold">PTS</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Próximos Partidos (Vertical stacked cards) */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex justify-between items-end border-b border-cream-200 pb-1.5">
            <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black">PRÓXIMOS PARTIDOS</h3>
            <Link href="/matches" className="text-[9px] text-gold-600 font-bold uppercase tracking-widest hover:underline flex items-center gap-0.5">
              <span>Ver Fixture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredMatches.length > 0 ? (
            <div className="flex flex-col gap-3">
              {featuredMatches.map(match => {
                const homeTeam = standings.flatMap(s => [s.team1, s.team2]).find(t => t?.name === match.home_team_id);
                const awayTeam = standings.flatMap(s => [s.team1, s.team2]).find(t => t?.name === match.away_team_id);

                return (
                  <div key={match.id} className="glass-card p-4 border border-cream-300 flex flex-col justify-between shadow-xs">
                    <div className="flex justify-between items-center border-b border-cream-200 pb-2 mb-3 text-[8px] text-stone-450 font-bold uppercase tracking-wider">
                      <span>{match.phase} {match.group_letter ? `- Grupo ${match.group_letter}` : ''}</span>
                      {match.status === 'live' ? (
                        <span className="text-rose-600 font-extrabold flex items-center gap-0.5">
                          <span className="w-1 h-1 rounded-full bg-rose-500" />
                          VIVO
                        </span>
                      ) : match.status === 'finished' ? (
                        <span>Finalizado</span>
                      ) : (
                        <span className="text-gold-650">Próximo</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700">{match.home_team_id}</span>
                        <span className="text-xs font-bold text-stone-850">{homeTeam?.name || match.home_team_id}</span>
                      </div>
                      {match.status === 'finished' || match.status === 'live' ? (
                        <span className="text-lg font-bold text-stone-900">{match.home_score}</span>
                      ) : (
                        <span className="text-[8px] text-stone-300 font-bold">vs</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700">{match.away_team_id}</span>
                        <span className="text-xs font-bold text-stone-850">{awayTeam?.name || match.away_team_id}</span>
                      </div>
                      {(match.status === 'finished' || match.status === 'live') && (
                        <span className="text-lg font-bold text-stone-900">{match.away_score}</span>
                      )}
                    </div>

                    <div className="text-[8px] text-stone-400 mt-4 pt-2 border-t border-cream-200 flex justify-between items-center font-semibold">
                      <span>{match.fecha}</span>
                      <span>{match.hora_arg.split('-')[0].substring(0,5)} hs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[10px] text-stone-400 italic">No hay próximos partidos.</p>
          )}
        </div>
      </div>
    </div>
  );
}
