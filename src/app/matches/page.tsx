'use client';

import { useStore, isMatchPredictable } from '@/lib/store';
import { useState } from 'react';
import { Calendar, MapPin, Check, ChevronDown, ChevronUp, Lock, Unlock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match } from '@/lib/types';

export default function MatchesPage() {
  const { matches, teams, currentProfileId, predictions, savePrediction, profiles, standings } = useStore();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'upcoming' | 'live' | 'finished'>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'fixture' | 'standings' | 'prode'>('fixture');
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
    
    return { text: 'Abierto', color: 'text-emerald-600', isLocked: false };
  };

  const getGroupStandings = (groupLetter: string) => {
    const groupTeams = teams.filter(t => t.group_letter === groupLetter);
    const stats: Record<string, {
      teamId: string;
      name: string;
      flag_emoji: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
      goalDifference: number;
      points: number;
    }> = {};

    groupTeams.forEach(t => {
      stats[t.id] = {
        teamId: t.id,
        name: t.name,
        flag_emoji: t.flag_emoji,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };
    });

    const groupMatches = matches.filter(
      m => m.group_letter === groupLetter && (m.status === 'finished' || m.status === 'live')
    );

    groupMatches.forEach(m => {
      const homeScore = m.home_score ?? 0;
      const awayScore = m.away_score ?? 0;
      const homeStats = stats[m.home_team_id];
      const awayStats = stats[m.away_team_id];

      if (homeStats && awayStats) {
        homeStats.played += 1;
        awayStats.played += 1;
        homeStats.goalsFor += homeScore;
        homeStats.goalsAgainst += awayScore;
        awayStats.goalsFor += awayScore;
        awayStats.goalsAgainst += homeScore;

        if (homeScore > awayScore) {
          homeStats.won += 1;
          homeStats.points += 3;
          awayStats.lost += 1;
        } else if (homeScore < awayScore) {
          awayStats.won += 1;
          awayStats.points += 3;
          homeStats.lost += 1;
        } else {
          homeStats.drawn += 1;
          homeStats.points += 1;
          awayStats.drawn += 1;
          awayStats.points += 1;
        }
      }
    });

    return Object.values(stats)
      .map(s => ({
        ...s,
        goalDifference: s.goalsFor - s.goalsAgainst
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
  };

  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  const filteredMatches = matches.filter(match => {
    if (activeFilter === 'upcoming') {
      return match.status === 'upcoming';
    }
    if (activeFilter === 'live') {
      return match.status === 'live';
    }
    if (activeFilter === 'finished') {
      return match.status === 'finished';
    }
    return true;
  });

  return (
    <div className="space-y-6 text-stone-900 max-w-5xl mx-auto pt-2 relative">
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
        <div className="text-center sm:text-left w-full sm:w-auto">
          <h1 className="text-[10px] font-black tracking-widest text-stone-400 uppercase">
            fixture
          </h1>
        </div>

        {/* Sub Tabs Navigation */}
        <div className="flex bg-cream-100/50 p-1 rounded-2xl border border-cream-300 gap-1 shrink-0 w-full sm:w-auto">
          {[
            { id: 'fixture', label: 'Partidos' },
            { id: 'standings', label: 'Tablas' },
            { id: 'prode', label: 'Posiciones' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-black transition-all shrink-0 cursor-pointer ${
                activeSubTab === tab.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'fixture' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filter Tabs inside matches view */}
          <div className="flex justify-center sm:justify-start">
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
                          className={`px-3.5 py-1.5 rounded-full font-extrabold uppercase tracking-widest flex items-center gap-1.5 transition-all text-[9px] shadow-xs cursor-pointer ${
                            predictingMatchId === match.id
                              ? 'bg-stone-900 text-white border border-stone-900 shadow-sm'
                              : prediction 
                                ? 'bg-gold-600 text-white border border-gold-600 hover:bg-gold-500 hover:border-gold-500 hover:scale-[1.03] hover:shadow-sm active:scale-[0.97]' 
                                : 'bg-white text-stone-750 border border-cream-300 hover:bg-cream-200 hover:scale-[1.03] hover:shadow-xs active:scale-[0.97]'
                          }`}
                        >
                          <span>
                            {predictingMatchId === match.id
                              ? 'Cerrar'
                              : prediction 
                                ? `Editar: ${prediction.home_score} - ${prediction.away_score}` 
                                : 'Pronosticar'}
                          </span>
                          {predictingMatchId === match.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      ) : (
                        <span className={`px-3.5 py-1.5 rounded-full font-extrabold uppercase border text-[9px] tracking-widest ${
                          prediction 
                            ? 'bg-cream-200 text-stone-700 border-cream-300' 
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
                          <div className="p-5 flex flex-col items-center gap-4">
                            <span className="text-[9px] uppercase font-black text-gold-650 tracking-widest">
                              Pronóstico de {activeProfile?.display_name}
                            </span>

                            {validationError && (
                              <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-250/55 px-3 py-1.5 rounded-xl">
                                {validationError}
                              </span>
                            )}
                            
                            <div className="flex flex-col items-center gap-4 w-full max-w-[260px] mx-auto">
                              {/* Inputs Row */}
                              <div className="flex items-center justify-center gap-4 w-full">
                                {/* Home Input */}
                                <div className="flex-1 flex items-center justify-end gap-2.5">
                                  <span className="text-[10px] font-bold text-stone-500 tracking-wider">{match.home_team_id}</span>
                                  <input 
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={predHome}
                                    onChange={(e) => handleScoreChange(e.target.value, setPredHome)}
                                    className="w-14 h-12 text-center bg-white border border-cream-300 rounded-2xl text-xl font-extrabold text-stone-900 focus:outline-none focus:border-gold-550 focus:ring-4 focus:ring-gold-550/10 transition-all shadow-xs" 
                                    placeholder="-"
                                  />
                                </div>

                                <span className="text-stone-400 font-extrabold text-lg select-none">:</span>

                                {/* Away Input */}
                                <div className="flex-1 flex items-center justify-start gap-2.5">
                                  <input 
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={predAway}
                                    onChange={(e) => handleScoreChange(e.target.value, setPredAway)}
                                    className="w-14 h-12 text-center bg-white border border-cream-300 rounded-2xl text-xl font-extrabold text-stone-900 focus:outline-none focus:border-gold-550 focus:ring-4 focus:ring-gold-550/10 transition-all shadow-xs" 
                                    placeholder="-"
                                  />
                                  <span className="text-[10px] font-bold text-stone-500 tracking-wider">{match.away_team_id}</span>
                                </div>
                              </div>

                              {/* Save Button */}
                              <button
                                onClick={() => handleSavePrediction(match.id)}
                                className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                              >
                                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                                <span>Confirmar Pronóstico</span>
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
      )}

      {/* Group Standings Tab */}
      {activeSubTab === 'standings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {groups.map(group => {
            const groupStandings = getGroupStandings(group);
            return (
              <div key={group} className="glass-card p-4 border border-cream-300 bg-white space-y-3 shadow-xs">
                <div className="border-b border-cream-200 pb-1.5 flex justify-between items-center">
                  <h3 className="text-[10px] text-stone-750 uppercase tracking-widest font-black">Grupo {group}</h3>
                  <span className="text-[8px] text-stone-400 font-extrabold uppercase tracking-wider">Mesa Copa</span>
                </div>
                <div className="w-full text-left text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  <div className="flex border-b border-cream-150 pb-1 font-black text-stone-400">
                    <div className="flex-1">Equipo</div>
                    <div className="w-6 text-center">PJ</div>
                    <div className="w-6 text-center">DG</div>
                    <div className="w-8 text-right text-stone-850">Pts</div>
                  </div>
                  <div className="divide-y divide-cream-150">
                    {groupStandings.map((team, idx) => (
                      <div key={team.teamId} className="flex items-center py-2 text-stone-700">
                        <div className="flex-1 flex items-center gap-1.5 truncate">
                          <span className="text-[8px] text-stone-400 w-3">{idx + 1}</span>
                          <span className="text-xs" role="img" aria-label={team.name}>{team.flag_emoji}</span>
                          <span className="truncate font-semibold text-stone-850">{team.name}</span>
                        </div>
                        <div className="w-6 text-center font-normal">{team.played}</div>
                        <div className="w-6 text-center font-normal">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</div>
                        <div className="w-8 text-right font-black text-stone-900">{team.points}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prode Rankings Tab */}
      {activeSubTab === 'prode' && (
        <div className="space-y-3 max-w-xl mx-auto animate-in fade-in duration-200">
          <div className="border-b border-cream-200 pb-1.5 flex justify-between items-center">
            <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black">Mesa del Prode</h3>
            <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">Posiciones</span>
          </div>
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {standings.map((standing, index) => {
                const isCurrentUser = standing.profile_id === currentProfileId;
                const initials = standing.display_name ? standing.display_name.substring(0, 2).toUpperCase() : 'US';
                const profileObj = profiles.find(p => p.id === standing.profile_id);
                const championTeam = teams.find(t => t.id === profileObj?.champion_prediction);

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
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-xs font-bold ${isCurrentUser ? 'text-stone-900' : 'text-stone-700'}`}>
                                {standing.display_name}
                              </h4>
                              {isCurrentUser && (
                                <span className="text-[7px] font-bold uppercase tracking-widest text-gold-650 bg-gold-500/10 px-1.5 rounded border border-gold-500/25">Tú</span>
                              )}
                            </div>
                            {championTeam && (
                              <span className="text-[7.5px] text-gold-650 font-black mt-0.5 leading-none">
                                Campeón: {championTeam.flag_emoji} {championTeam.name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Prediction Stats Detail */}
                        <div className="flex gap-3 mt-2 items-center text-[8px] font-bold text-stone-450 uppercase tracking-wider">
                          <span>
                            Exactos: <strong className="text-stone-700">{standing.exact_guesses}</strong> (3 pts)
                          </span>
                          <span className="w-1 h-1 rounded-full bg-cream-300" />
                          <span>
                            Resultados: <strong className="text-stone-700">{standing.outcome_guesses}</strong> (1 pt)
                          </span>
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
      )}
    </div>
  );
}
