'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import Countdown from '@/components/Countdown';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowRight, Sparkles, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    }
  }, []);
  const { 
    standings, 
    matches, 
    predictions,
    teams,
    profiles,
    groups,
    groupMembers,
    currentProfileId, 
    autoSeedPredictions, 
    saveChampionPrediction,
    isDemoMode,
    isLoading 
  } = useStore();

  const myPredictions = predictions.filter(p => p.participant_id === currentProfileId);
  const totalMatchesCount = matches.length;
  const completedPredictionsCount = myPredictions.length;

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const pendingPredictionsCount = upcomingMatches.filter(m => !myPredictions.some(p => p.match_id === m.id)).length;

  const liveMatches = matches.filter(m => m.status === 'live');
  const featuredMatches = [...liveMatches, ...upcomingMatches].slice(0, 3);

  const currentStanding = standings.find(s => s.profile_id === currentProfileId);

  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const currentChampionPred = activeProfile?.champion_prediction;
  const deadline = new Date('2026-06-10T16:00:00-03:00').getTime();
  const isChampionOpen = new Date().getTime() < deadline;

  const myGroupMemberships = groupMembers.filter(gm => gm.profile_id === currentProfileId);
  const myGroups = groups.filter(g => myGroupMemberships.some(gm => gm.group_id === g.id));

  const myGroupIds = myGroups.map(g => g.id);
  const filteredStandings = standings.filter(s => 
    myGroupIds.length === 0 
      ? true 
      : groupMembers.some(gm => myGroupIds.includes(gm.group_id) && gm.profile_id === s.profile_id)
  );

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

  if (activeProfile?.is_admin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center max-w-sm mx-auto animate-in fade-in duration-300">
        <Trophy className="w-12 h-12 text-gold-500" />
        <h1 className="text-xl font-extrabold tracking-tight text-stone-900 uppercase">Panel de Administración</h1>
        <p className="text-xs text-stone-500 leading-relaxed">
          Como administrador, tu cuenta no participa en los pronósticos ni los grupos. Dirigite a tu perfil para gestionar grupos y participantes.
        </p>
        <Link 
          href="/profile"
          className="mt-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          Ir al Panel de Administración <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-stone-900 max-w-5xl mx-auto pt-2">
      {/* Editorial Title */}
      <div className="text-center pb-2 border-b border-cream-300">
        <h1 className="text-[10px] font-black tracking-widest text-stone-400 uppercase">
          prode mundial usa-mex 26′
        </h1>
      </div>

      {/* Countdown Strip */}
      <Countdown />

      {/* Champion Prediction Banner */}
      <div className="glass-card p-5 border border-cream-300 shadow-sm bg-white flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold-500/10 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
        <div className="space-y-1 text-left w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-500 shrink-0" />
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-750">Predicción de Campeón</h4>
            <span className="text-[7.5px] bg-gold-500/10 text-gold-650 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
              +10 puntos
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            {isChampionOpen 
              ? "Elegí qué selección ganará el mundial. Podés cambiar tu voto hasta 24hs antes del debut."
              : "Las predicciones de campeón ya se encuentran cerradas."
            }
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {isChampionOpen ? (
            <div className="w-full sm:w-auto flex gap-2 items-center relative">
              <select
                value={currentChampionPred || ''}
                onChange={async (e) => {
                  if (e.target.value) {
                    await saveChampionPrediction(currentProfileId, e.target.value);
                    triggerConfetti();
                  }
                }}
                className="w-full sm:w-60 appearance-none bg-white border border-cream-300 rounded-xl px-4 py-2.5 pr-10 text-xs text-stone-850 font-extrabold focus:outline-none focus:border-gold-500 cursor-pointer shadow-xs transition-all"
              >
                <option value="">-- Elegir Campeón --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.flag_emoji} {t.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <div className="w-full sm:w-auto px-4 py-2 border border-cream-250 bg-cream-100/50 rounded-lg text-center">
              {currentChampionPred ? (
                (() => {
                  const team = teams.find(t => t.id === currentChampionPred);
                  return (
                    <span className="text-xs font-bold text-stone-900 flex items-center justify-center gap-1.5">
                      {team?.flag_emoji} {team?.name}
                    </span>
                  );
                })()
              ) : (
                <span className="text-xs font-semibold text-rose-500 flex items-center justify-center gap-1.5">
                  No registraste predicción 🔒
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Demo Seed Notification */}
      {predictions.length === 0 && isDemoMode && (
        <div className="bg-gold-100/20 border border-gold-500/20 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
          <div className="flex gap-2.5 items-start text-left">
            <div>
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-stone-750">Simulador de Pronósticos</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Para rellenar la tabla de posiciones inmediatamente con datos aleatorios de prueba, podés simular todos los pronósticos.
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              await autoSeedPredictions();
              triggerConfetti();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all shrink-0 shadow-sm"
          >
            Simular Pronósticos
          </button>
        </div>
      )}

      {/* Pending Predictions Banner */}
      {pendingPredictionsCount > 0 ? (
        <div className="bg-amber-50/40 border border-amber-250/30 rounded-xl p-3.5 flex justify-between items-center text-xs shadow-xs max-w-5xl mx-auto">
          <span className="text-stone-600 font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            Tenés {pendingPredictionsCount} pronóstico{pendingPredictionsCount > 1 ? 's' : ''} pendiente{pendingPredictionsCount > 1 ? 's' : ''} para los próximos partidos.
          </span>
          <Link href="/matches" className="text-gold-650 font-extrabold uppercase tracking-wider text-[10px] hover:underline shrink-0 ml-4">
            Pronosticar →
          </Link>
        </div>
      ) : completedPredictionsCount > 0 ? (
        <div className="bg-emerald-50/30 border border-emerald-250/20 rounded-xl p-3.5 flex justify-between items-center text-xs shadow-xs max-w-5xl mx-auto">
          <span className="text-stone-600 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            ¡Tenés todos tus pronósticos cargados! ({completedPredictionsCount}/{totalMatchesCount})
          </span>
          <Link href="/matches" className="text-stone-500 font-extrabold uppercase tracking-wider text-[10px] hover:underline shrink-0 ml-4">
            Ver Fixture →
          </Link>
        </div>
      ) : null}

      {/* PWA Mobile Installation Guide */}
      {!isStandalone && (
        <div className="glass-card border border-cream-300 shadow-sm bg-white relative overflow-hidden max-w-5xl mx-auto text-left transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cream-200/20 to-transparent rounded-full -mr-12 -mt-12 pointer-events-none" />
        
        {/* Toggle Button Header */}
        <button 
          onClick={() => setShowPwaGuide(!showPwaGuide)}
          className="w-full flex items-center justify-between p-5 focus:outline-none hover:bg-stone-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-stone-700 shrink-0" />
            <div className="text-left">
              <h4 className="text-[9.5px] font-extrabold text-stone-450 uppercase leading-none mb-1">Cómo instalar el Prode en tu celular</h4>
              <h3 className="text-xs font-black text-stone-900 uppercase">Instalar App Móvil</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-block text-[8px] bg-stone-100 border border-stone-250 text-stone-550 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Sin Descargas
            </span>
            <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${showPwaGuide ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Collapsible Content */}
        <AnimatePresence initial={false}>
          {showPwaGuide && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-6 border-t border-cream-200 pt-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-extrabold text-[10px] flex items-center justify-center">1</span>
                      <h4 className="font-bold text-stone-850">Abrí el enlace</h4>
                    </div>
                    <p className="pl-7 text-[11px] leading-relaxed text-stone-500">
                      Ingresá a la web del Prode desde el navegador de tu celular (preferentemente <strong>Safari</strong> en iPhone o <strong>Chrome</strong> en Android).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-extrabold text-[10px] flex items-center justify-center">2</span>
                      <h4 className="font-bold text-stone-850">Tocá compartir</h4>
                    </div>
                    <p className="pl-7 text-[11px] leading-relaxed text-stone-500">
                      Presioná el botón de <strong>Compartir</strong> (el ícono de la caja con flecha hacia arriba o los tres puntos y luego en compartir).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-extrabold text-[10px] flex items-center justify-center">3</span>
                      <h4 className="font-bold text-stone-850">Añadir a Inicio</h4>
                    </div>
                    <p className="pl-7 text-[11px] leading-relaxed text-stone-500">
                      Buscá y presioná la opción <strong>Añadir a pantalla de inicio</strong> (en iOS tocá "Compartir", luego bajá y tocá "Añadir a pantalla de inicio"). ¡Y listo!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}

      {/* Responsive Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Standings */}
        <div className="lg:col-span-2 space-y-3">
          <div className="border-b border-cream-200 pb-1.5 flex justify-between items-center gap-2">
            <div>
              <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black">TABLA DE POSICIONES</h3>
            </div>
            
            <Link 
              href="/matches?tab=prode"
              className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-gold-650 hover:text-gold-700 transition-all hover:translate-x-0.5"
            >
              Ver Posiciones <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {filteredStandings.slice(0, 3).map((standing, index) => {
                const isCurrentUser = standing.profile_id === currentProfileId;
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
                            <span className="text-[7px] font-bold uppercase tracking-widest text-gold-650 bg-gold-500/10 px-1.5 rounded border border-gold-500/25">Tú</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
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

        {/* Right Column: Próximos Partidos */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex justify-between items-end border-b border-cream-200 pb-1.5">
            <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black">PRÓXIMOS PARTIDOS</h3>
            <Link href="/matches" className="text-[9px] text-gold-650 font-bold uppercase tracking-widest hover:underline flex items-center gap-0.5">
              <span>Ver Fixture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredMatches.length > 0 ? (
            <div className="flex flex-col gap-3">
              {featuredMatches.map(match => {
                const homeTeam = teams.find(t => t.id === match.home_team_id);
                const awayTeam = teams.find(t => t.id === match.away_team_id);
                const userPred = myPredictions.find(p => p.match_id === match.id);

                return (
                  <div key={match.id} className="glass-card p-4 border border-cream-300 flex flex-col justify-between shadow-xs bg-white">
                    <div className="flex justify-between items-center border-b border-cream-200 pb-2 mb-3 text-[8px] text-stone-450 font-bold uppercase tracking-wider">
                      <span>{match.phase} {match.group_letter ? `- Grupo ${match.group_letter}` : ''}</span>
                      {match.status === 'live' ? (
                        <span className="text-rose-600 font-extrabold flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
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
                        <span className="text-[10px]">{homeTeam?.flag_emoji || '🏳️'}</span>
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
                        <span className="text-[10px]">{awayTeam?.flag_emoji || '🏳️'}</span>
                        <span className="text-xs font-bold text-stone-850">{awayTeam?.name || match.away_team_id}</span>
                      </div>
                      {(match.status === 'finished' || match.status === 'live') && (
                        <span className="text-lg font-bold text-stone-900">{match.away_score}</span>
                      )}
                    </div>

                    {/* Show user prediction shortcut info */}
                    <div className="mt-3 pt-2 border-t border-cream-200 flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-stone-400">
                      <span>Tu Pronóstico</span>
                      {userPred ? (
                        <span className="text-gold-650">
                          {userPred.home_score} - {userPred.away_score}
                        </span>
                      ) : (
                        <Link href="/matches" className="text-stone-500 hover:text-stone-850 hover:underline">
                          Cargar
                        </Link>
                      )}
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
