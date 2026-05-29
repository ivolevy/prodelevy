'use client';

import { useStore, isMatchPredictable } from '@/lib/store';
import { useState } from 'react';
import { Calendar, MapPin, Check, ChevronDown, ChevronUp, Lock, Unlock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match } from '@/lib/types';

export default function MatchesPage() {
  const { matches, teams, currentProfileId, predictions, savePrediction, profiles } = useStore();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'upcoming' | 'live' | 'finished'>('ALL');
  const [predictingMatchId, setPredictingMatchId] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  
  // Forms states for prediction inputs
  const [predHome, setPredHome] = useState<string>('');
  const [predAway, setPredAway] = useState<string>('');

  const activeProfile = profiles.find(p => p.id === currentProfileId);

  const handlePredictClick = (matchId: number) => {
    setValidationError(null);
    if (predictingMatchId === matchId) {
      setPredictingMatchId(null);
    } else {
      const existing = predictions.find(p => p.participant_id === currentProfileId && p.match_id === matchId);
      if (existing) {
        setPredHome(String(existing.home_score));
        setPredAway(String(existing.away_score));
      } else {
        setPredHome('');
        setPredAway('');
      }
      setPredictingMatchId(matchId);
    }
  };

  const handleScoreChange = (value: string, setter: (val: string) => void) => {
    if (value === '') {
      setter('');
      return;
    }
    // Strip non-digits (removes negative signs, decimals, e, etc.)
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly === '') {
      setter('');
      return;
    }
    const num = parseInt(digitsOnly, 10);
    if (num > 20) {
      setter('20');
    } else {
      setter(String(num));
    }
  };

  const handleSavePrediction = async (matchId: number) => {
    const h = parseInt(predHome);
    const a = parseInt(predAway);
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0 || h > 20 || a > 20) {
      setValidationError('Ingresá números entre 0 y 20');
      return;
    }

    setValidationError(null);
    try {
      await savePrediction(currentProfileId, matchId, h, a);
      setPredictingMatchId(null);
      setSaveSuccess('¡Pronóstico guardado con éxito!');
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (e: any) {
      setValidationError(e.message || 'Error al guardar la predicción.');
    }
  };

  const getPredictableStatusLabel = (match: Match) => {
    if (match.status !== 'upcoming') {
      return { text: 'Cerrado', color: 'text-stone-400', isLocked: true };
    }
    
    const matchDateTimeStr = `${match.fecha}T${match.hora_arg.includes('-') || match.hora_arg.includes('+') ? match.hora_arg : match.hora_arg + '-03:00'}`;
    const matchTime = new Date(matchDateTimeStr).getTime();
    
    if (isNaN(matchTime)) {
      return { text: 'Cerrado', color: 'text-stone-400', isLocked: true };
    }
    
    const now = new Date().getTime();
    const diffMs = matchTime - now;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 0) {
      return { text: 'Cerrado', color: 'text-rose-500', isLocked: true };
    }
    
    if (diffHours < 24) {
      return { text: 'Cerrado', color: 'text-rose-600', isLocked: true };
    }
    
    const remainingHours = Math.floor(diffHours - 24);
    if (remainingHours < 24) {
      const remainingMinutes = Math.floor((diffHours - 24 - remainingHours) * 60);
      return { 
        text: `Cierra en ${remainingHours}h ${remainingMinutes}m`, 
        color: 'text-amber-600 font-bold', 
        isLocked: false 
      };
    } else {
      const remainingDays = Math.floor(remainingHours / 24);
      return { 
        text: `Cierra en ${remainingDays} día${remainingDays > 1 ? 's' : ''}`, 
        color: 'text-emerald-600 font-medium', 
        isLocked: false 
      };
    }
  };

  const filteredMatches = activeFilter === 'ALL'
    ? matches
    : matches.filter(m => m.status === activeFilter);

  return (
    <div className="space-y-6 text-stone-900 max-w-5xl mx-auto pt-2 relative">
      {/* Success Toast (Heuristic #1: Visibility of System Status) */}
      <AnimatePresence>
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{saveSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-cream-300 pb-4 gap-3">
        <div className="text-center sm:text-left">
          <h2 className="text-[10px] tracking-widest font-black uppercase text-stone-400">
            PRONÓSTICOS DE PARTIDOS
          </h2>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 leading-none mt-1">
            Fixture del Torneo.
          </h1>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-white border border-cream-300 p-1 rounded-full shadow-sm">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'upcoming', label: 'Próximos' },
            { id: 'live', label: 'En Vivo' },
            { id: 'finished', label: 'Jugados' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                activeFilter === tab.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-500 hover:text-stone-750'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-16 text-stone-400 text-xs font-semibold uppercase tracking-wider">
          No se encontraron partidos para este filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMatches.map(match => {
            const homeTeam = teams.find(t => t.id === match.home_team_id);
            const awayTeam = teams.find(t => t.id === match.away_team_id);
            const prediction = predictions.find(p => p.participant_id === currentProfileId && p.match_id === match.id);
            const isPredictable = isMatchPredictable(match);
            const cutoffInfo = getPredictableStatusLabel(match);

            return (
              <div 
                key={match.id} 
                className={`glass-card border flex flex-col justify-between shadow-sm transition-all overflow-hidden bg-white ${
                  match.status === 'live'
                    ? 'border-rose-450 bg-rose-50/10'
                    : 'border-cream-300 hover:border-cream-400'
                }`}
              >
                {/* Info Header */}
                <div className="px-4 py-2.5 border-b border-cream-200 flex justify-between items-center bg-cream-100/50">
                  <span className="text-[8px] uppercase tracking-wider font-extrabold text-stone-450">
                    {match.phase} {match.group_letter ? `- Grupo ${match.group_letter}` : ''}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {/* Time lock indicator */}
                    <span className={`text-[8px] font-bold flex items-center gap-1 ${cutoffInfo.color}`}>
                      {cutoffInfo.isLocked ? (
                        <Lock className="w-3 h-3 text-stone-400 shrink-0" />
                      ) : (
                        <Unlock className="w-3 h-3 text-emerald-500 shrink-0" />
                      )}
                      <span>{cutoffInfo.text}</span>
                    </span>

                    {match.status === 'live' ? (
                      <span className="text-[8px] font-black bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        VIVO
                      </span>
                    ) : match.status === 'finished' ? (
                      <span className="text-[8px] font-bold bg-cream-200 text-stone-550 px-2 py-0.5 rounded uppercase tracking-wider">
                        Finalizado
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold bg-white border border-cream-300 text-gold-650 px-2 py-0.5 rounded uppercase tracking-wider">
                        Próximo
                      </span>
                    )}
                  </div>
                </div>

                {/* Scoreboard Body */}
                <div className="p-4 flex items-center justify-between">
                  {/* Home Team */}
                  <div className="flex-1 flex flex-col items-center text-center space-y-1">
                    <span className="text-2xl" role="img" aria-label={homeTeam?.name || match.home_team_id}>
                      {homeTeam?.flag_emoji || '🏳️'}
                    </span>
                    <span className="text-xs font-bold text-stone-800 truncate max-w-[110px]">
                      {homeTeam?.name || match.home_team_id}
                    </span>
                  </div>

                  {/* Score or Divider */}
                  <div className="flex flex-col items-center px-4">
                    {match.status === 'finished' || match.status === 'live' ? (
                      <span className="text-xl font-bold text-stone-900 tracking-widest leading-none">
                        {match.home_score} - {match.away_score}
                      </span>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-stone-400 font-bold uppercase tracking-widest leading-none mb-1">VS</span>
                        <span className="text-[8px] font-bold text-stone-750 bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded font-mono">
                          {match.hora_arg.split('-')[0].substring(0, 5)} hs
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex-1 flex flex-col items-center text-center space-y-1">
                    <span className="text-2xl" role="img" aria-label={awayTeam?.name || match.away_team_id}>
                      {awayTeam?.flag_emoji || '🏳️'}
                    </span>
                    <span className="text-xs font-bold text-stone-800 truncate max-w-[110px]">
                      {awayTeam?.name || match.away_team_id}
                    </span>
                  </div>
                </div>

                {/* Details & Predict Actions Footer */}
                <div className="px-4 py-2 bg-cream-100/10 border-t border-cream-200 flex justify-between items-center text-[9px] text-stone-450 font-medium">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-stone-500">
                      <Calendar className="w-3.5 h-3.5 text-stone-405" />
                      {match.fecha}
                    </span>
                    <span className="flex items-center gap-1 max-w-[120px] sm:max-w-[160px] truncate text-stone-500">
                      <MapPin className="w-3.5 h-3.5 text-stone-405" />
                      {match.ciudad}, {match.pais}
                    </span>
                  </div>

                  {/* Predict Button / Prediction Display */}
                  {isPredictable ? (
                    <button
                      onClick={() => handlePredictClick(match.id)}
                      className={`px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center gap-1 transition-all border text-[9px] ${
                        prediction 
                          ? 'bg-gold-500/10 text-gold-700 border-gold-300/40 hover:bg-gold-500/20' 
                          : 'bg-white text-stone-600 border-cream-300 hover:bg-cream-250'
                      }`}
                    >
                      <span>{prediction ? `Edit: ${prediction.home_score}-${prediction.away_score}` : 'Pronosticar'}</span>
                      {predictingMatchId === match.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  ) : (
                    <span className={`px-2.5 py-1 rounded font-bold uppercase border text-[9px] ${
                      prediction 
                        ? 'bg-stone-100 text-stone-600 border-stone-250' 
                        : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}>
                      {prediction ? `Mi pronóstico: ${prediction.home_score}-${prediction.away_score}` : 'Sin pronóstico'}
                    </span>
                  )}
                </div>

                {/* Prediction collapsible panel */}
                <AnimatePresence>
                  {predictingMatchId === match.id && isPredictable && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-cream-200 bg-cream-100/50"
                    >
                      <div className="p-4 flex flex-col items-center gap-3">
                        <span className="text-[8px] uppercase font-bold text-gold-650 tracking-wider">
                          Pronóstico de {activeProfile?.display_name}
                        </span>

                        {validationError && (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg">
                            {validationError}
                          </span>
                        )}
                        
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-stone-450 font-bold mb-1">{match.home_team_id}</span>
                            <input 
                              type="number"
                              pattern="[0-9]*"
                              min="0"
                              max="20"
                              value={predHome}
                              onChange={(e) => handleScoreChange(e.target.value, setPredHome)}
                              className="w-12 h-10 text-center bg-white border border-cream-300 rounded-xl text-lg font-bold text-stone-850 focus:outline-none focus:border-gold-500" 
                            />
                          </div>

                          <span className="text-stone-450 font-bold mt-4">-</span>

                          <div className="flex flex-col items-center">
                            <span className="text-[8px] text-stone-450 font-bold mb-1">{match.away_team_id}</span>
                            <input 
                              type="number"
                              pattern="[0-9]*"
                              min="0"
                              max="20"
                              value={predAway}
                              onChange={(e) => handleScoreChange(e.target.value, setPredAway)}
                              className="w-12 h-10 text-center bg-white border border-cream-300 rounded-xl text-lg font-bold text-stone-850 focus:outline-none focus:border-gold-500" 
                            />
                          </div>

                          <button
                            onClick={() => handleSavePrediction(match.id)}
                            className="h-10 px-4 mt-4 bg-stone-900 hover:bg-stone-850 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                          >
                            <Check className="w-4 h-4" />
                            <span>Guardar</span>
                          </button>

                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Show everyone's predictions if locked/closed */}
                {!isPredictable && (
                  <div className="bg-cream-100/30 border-t border-cream-200 px-4 py-3 space-y-2">
                    <div className="flex items-center gap-1 text-[8px] uppercase tracking-wider font-extrabold text-stone-450">
                      <Users className="w-3.5 h-3.5 text-stone-400" />
                      <span>Pronósticos de la competencia:</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {profiles.map(prof => {
                        const profPred = predictions.find(p => p.participant_id === prof.id && p.match_id === match.id);
                        const isSelf = prof.id === currentProfileId;
                        const initials = prof.display_name.substring(0, 2).toUpperCase();

                        return (
                          <div 
                            key={prof.id} 
                            className={`flex items-center justify-between p-1.5 rounded-lg border text-[10px] ${
                              isSelf 
                                ? 'bg-gold-500/5 border-gold-300/40 font-bold' 
                                : 'bg-white border-cream-200'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate max-w-[70px]">
                              <span className="w-4.5 h-4.5 rounded-full bg-cream-200 flex items-center justify-center text-[7px] font-bold text-stone-600 shrink-0">
                                {initials}
                              </span>
                              <span className="truncate text-stone-705">{prof.display_name}</span>
                            </div>
                            <span className="font-mono text-stone-900 text-right shrink-0">
                              {profPred ? `${profPred.home_score}-${profPred.away_score}` : '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Info text if Predictable but other predictions are hidden */}
                {isPredictable && (
                  <div className="bg-cream-100/10 border-t border-cream-200 px-4 py-2 flex items-center gap-1.5 text-[8.5px] text-stone-400 font-semibold italic">
                    <Users className="w-3 h-3 text-stone-300" />
                    <span>Los pronósticos de los rivales se revelarán 24 hs antes del partido.</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
