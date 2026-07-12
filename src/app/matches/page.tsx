'use client';

import { useStore, isMatchPredictable } from '@/lib/store';
import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Check, ChevronDown, ChevronUp, Lock, Unlock, Users, Trophy, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match } from '@/lib/types';
import BracketView from '@/components/BracketView';

function MatchesPageContent() {
  const { matches, teams, currentProfileId, predictions, savePrediction, profiles, standings, groups: userGroups, groupMembers } = useStore();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'upcoming' | 'live' | 'finished'>('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'fixture' | 'standings' | 'bracket' | 'prode'>(
    (tabParam === 'standings' || tabParam === 'bracket' || tabParam === 'prode') ? tabParam : 'fixture'
  );
  const [predictingMatchId, setPredictingMatchId] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [expandedCompetitors, setExpandedCompetitors] = useState<Record<number, boolean>>({});
  
  // Forms states for prediction inputs
  const [predHome, setPredHome] = useState<string>('');
  const [predAway, setPredAway] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [predHomeExtra, setPredHomeExtra] = useState<string>('');
  const [predAwayExtra, setPredAwayExtra] = useState<string>('');
  const [predHomePenalty, setPredHomePenalty] = useState<string>('');
  const [predAwayPenalty, setPredAwayPenalty] = useState<string>('');
  const [definitionMethod, setDefinitionMethod] = useState<'extra_time' | 'penalties' | null>(null);

  useEffect(() => {
    if (currentProfileId && userGroups.length > 0) {
      const myGms = groupMembers.filter(gm => gm.profile_id === currentProfileId);
      const myGs = userGroups.filter(g => myGms.some(gm => gm.group_id === g.id));
      if (myGs.length > 0) {
        setSelectedGroupId(myGs[0].id);
      } else {
        setSelectedGroupId('all');
      }
    }
  }, [currentProfileId, userGroups, groupMembers]);

  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const myGroupMemberships = groupMembers.filter(gm => gm.profile_id === currentProfileId);
  const myGroups = userGroups.filter(g => myGroupMemberships.some(gm => gm.group_id === g.id));
  const activeGroupIdForUser = selectedGroupId !== 'all' 
    ? selectedGroupId 
    : (myGroups.length > 0 ? myGroups[0].id : 'all');

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

  const handlePredictClick = (matchId: number) => {
    setValidationError(null);
    if (predictingMatchId === matchId) {
      setPredictingMatchId(null);
    } else {
      const existing = predictions.find(p => p.participant_id === currentProfileId && p.match_id === matchId);
      if (existing) {
        setPredHome(String(existing.home_score));
        setPredAway(String(existing.away_score));
        setPredHomeExtra(existing.home_extra_score !== null && existing.home_extra_score !== undefined ? String(existing.home_extra_score) : '');
        setPredAwayExtra(existing.away_extra_score !== null && existing.away_extra_score !== undefined ? String(existing.away_extra_score) : '');
        setPredHomePenalty(existing.home_penalty_score !== null && existing.home_penalty_score !== undefined ? String(existing.home_penalty_score) : '');
        setPredAwayPenalty(existing.away_penalty_score !== null && existing.away_penalty_score !== undefined ? String(existing.away_penalty_score) : '');
        if (existing.home_penalty_score !== null && existing.home_penalty_score !== undefined) {
          setDefinitionMethod('penalties');
        } else if (existing.home_extra_score !== null && existing.home_extra_score !== undefined) {
          setDefinitionMethod('extra_time');
        } else {
          setDefinitionMethod(null);
        }
      } else {
        setPredHome('');
        setPredAway('');
        setPredHomeExtra('');
        setPredAwayExtra('');
        setPredHomePenalty('');
        setPredAwayPenalty('');
        setDefinitionMethod(null);
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

    const match = matches.find(m => m.id === matchId);
    const isElimination = match && match.phase !== 'Fase de Grupos';
    const isDraw = h === a;

    let hExtra: number | null = null;
    let aExtra: number | null = null;
    let hPenalty: number | null = null;
    let aPenalty: number | null = null;

    if (isElimination && isDraw) {
      if (!definitionMethod) {
        setValidationError('Seleccioná el método de definición (Tiempo Extra o Penales)');
        return;
      }

      if (definitionMethod === 'extra_time') {
        hExtra = parseInt(predHomeExtra);
        aExtra = parseInt(predAwayExtra);
        if (isNaN(hExtra) || isNaN(aExtra) || hExtra < 0 || aExtra < 0 || hExtra > 20 || aExtra > 20) {
          setValidationError('Ingresá el marcador del tiempo suplementario (0-20)');
          return;
        }
        if (hExtra === aExtra) {
          setValidationError('El tiempo suplementario no puede terminar empatado. Elegí Penales.');
          return;
        }
      } else if (definitionMethod === 'penalties') {
        hPenalty = parseInt(predHomePenalty);
        aPenalty = parseInt(predAwayPenalty);
        if (isNaN(hPenalty) || isNaN(aPenalty) || hPenalty < 0 || aPenalty < 0 || hPenalty > 20 || aPenalty > 20) {
          setValidationError('Ingresá el marcador de los penales (0-20)');
          return;
        }
        if (hPenalty === aPenalty) {
          setValidationError('La tanda de penales debe tener un ganador.');
          return;
        }
      }
    }

    setValidationError(null);
    try {
      await savePrediction(currentProfileId, matchId, h, a, hExtra, aExtra, hPenalty, aPenalty);
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
    
    let hora = match.hora_arg || '';
    if (/[-+][0-9]{2}$/.test(hora)) {
      hora = hora + ':00';
    }
    const matchDateTimeStr = `${match.fecha}T${hora.includes('-') || hora.includes('+') ? hora : hora + '-03:00'}`;
    const matchTime = new Date(matchDateTimeStr).getTime();
    
    if (isNaN(matchTime)) {
      return { text: 'Cerrado', color: 'text-stone-400', isLocked: true };
    }
    
    const now = new Date().getTime();
    const diffMs = matchTime - now;
    const diffMinutes = diffMs / (1000 * 60);
    
    if (diffMinutes < 0) {
      return { text: 'Cerrado', color: 'text-rose-500', isLocked: true };
    }
    
    if (diffMinutes < 10) {
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
  const [activeDateFilter, setActiveDateFilter] = useState<'ALL' | 'FECHA_1' | 'FECHA_2' | 'FECHA_3' | '16AVOS' | 'OCTAVOS' | 'CUARTOS' | 'SEMIS' | 'FINAL'>('SEMIS');
  const [isFirstPhaseOpen, setIsFirstPhaseOpen] = useState(false);

  useEffect(() => {
    if (!isFirstPhaseOpen) return;
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.first-phase-dropdown-container')) {
        setIsFirstPhaseOpen(false);
      }
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [isFirstPhaseOpen]);

  const filteredMatches = matches.filter(match => {
    // Hide Cuartos de final matches from the UI
    if (match.phase === 'Cuartos de Final' || (match.id >= 97 && match.id <= 100)) {
      return false;
    }

    const isKnockoutFilter = ['16AVOS', 'OCTAVOS', 'CUARTOS', 'SEMIS', 'FINAL'].includes(activeDateFilter);

    // 1. Status Filter (skip status check for knockout stages to ensure they always show when selected)
    if (!isKnockoutFilter) {
      if (activeFilter === 'upcoming' && match.status !== 'upcoming') {
        return false;
      }
      if (activeFilter === 'live' && match.status !== 'live') {
        return false;
      }
      if (activeFilter === 'finished' && match.status !== 'finished') {
        return false;
      }
    }

    // 2. Date/Fecha Round Filter
    if (activeDateFilter === 'FECHA_1') {
      return match.id >= 1 && match.id <= 24;
    }
    if (activeDateFilter === 'FECHA_2') {
      return match.id >= 25 && match.id <= 48;
    }
    if (activeDateFilter === 'FECHA_3') {
      return match.id >= 49 && match.id <= 72;
    }
    if (activeDateFilter === '16AVOS') {
      return match.id >= 73 && match.id <= 88;
    }
    if (activeDateFilter === 'OCTAVOS') {
      return match.id >= 89 && match.id <= 96;
    }
    if (activeDateFilter === 'CUARTOS') {
      return match.id >= 97 && match.id <= 100;
    }
    if (activeDateFilter === 'SEMIS') {
      return match.id >= 101 && match.id <= 102;
    }
    if (activeDateFilter === 'FINAL') {
      return match.id === 103 || match.id === 104;
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
      <div className="sticky top-0 md:top-[72px] bg-sports-bg/95 backdrop-blur-xs pt-2 pb-4 border-b border-cream-300 z-30 flex flex-col sm:flex-row justify-between items-center gap-3 transition-all">
        <div className="text-center sm:text-left w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
          <h1 className="text-[10px] font-black tracking-widest text-stone-400 uppercase">
            fixture
          </h1>
        </div>

        {/* Sub Tabs Navigation */}
        <div id="matches-tabs" className="flex bg-cream-100/50 p-1 rounded-2xl border border-cream-300 gap-1 shrink-0 w-full sm:w-auto">
          {[
            { id: 'fixture', label: 'Partidos' },
            { id: 'standings', label: 'Tabla' },
            { id: 'bracket', label: 'Cuadro' },
            { id: 'prode', label: 'Posiciones' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex-1 sm:flex-initial px-2 sm:px-4 py-2 rounded-xl text-[8.5px] sm:text-[10px] uppercase tracking-wider sm:tracking-widest font-black transition-all shrink-0 cursor-pointer ${
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
        <div id="matches-list" className="space-y-4 animate-in fade-in duration-200">
          {/* Filter Tabs inside matches view */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-cream-200 pb-3">
            {/* Status filters (Clean modern outline tabs) */}
            <div className="flex bg-cream-50/50 p-0.5 rounded-xl border border-cream-250 gap-0.5 self-center sm:self-auto overflow-x-auto">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'upcoming', label: 'Próximos' },
                { id: 'live', label: 'En Vivo' },
                { id: 'finished', label: 'Jugados' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all shrink-0 cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-stone-900 text-white shadow-2xs'
                      : 'text-stone-500 hover:text-stone-850'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Fecha (Round) filters (Premium text pill rows) */}
            {(activeFilter === 'ALL' || activeFilter === 'finished') && (
              <div className="flex gap-2 self-center sm:self-auto overflow-visible py-1 items-center">
                {/* Semis */}
                <button
                  onClick={() => {
                    setActiveDateFilter('SEMIS');
                    setIsFirstPhaseOpen(false);
                  }}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shrink-0 border cursor-pointer ${
                    activeDateFilter === 'SEMIS'
                      ? 'bg-gold-500/10 border-gold-500/30 text-gold-650 font-black'
                      : 'bg-white border-cream-300 text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Semis
                </button>

                {/* Final */}
                <button
                  onClick={() => {
                    setActiveDateFilter('FINAL');
                    setIsFirstPhaseOpen(false);
                  }}
                  className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shrink-0 border cursor-pointer ${
                    activeDateFilter === 'FINAL'
                      ? 'bg-gold-500/10 border-gold-500/30 text-gold-650 font-black'
                      : 'bg-white border-cream-300 text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Final / 3er Puesto
                </button>
              </div>
            )}
          </div>

          {(((activeFilter === 'ALL' || activeFilter === 'finished') && activeDateFilter === 'FECHA_2' && !matches.some(m => m.id >= 25 && m.id <= 48)) || 
            ((activeFilter === 'ALL' || activeFilter === 'finished') && activeDateFilter === 'FECHA_3' && !matches.some(m => m.id >= 49 && m.id <= 72)) ||
            ((activeFilter === 'ALL' || activeFilter === 'finished') && activeDateFilter === '16AVOS' && !matches.some(m => m.id >= 73 && m.id <= 88)) ||
            ((activeFilter === 'ALL' || activeFilter === 'finished') && activeDateFilter === 'OCTAVOS' && !matches.some(m => m.id >= 89 && m.id <= 96)) ||
            ((activeFilter === 'ALL' || activeFilter === 'finished') && activeDateFilter === 'SEMIS' && !matches.some(m => m.id >= 101 && m.id <= 102)) ||
            ((activeFilter === 'ALL' || activeFilter === 'finished') && activeDateFilter === 'FINAL' && !matches.some(m => m.id === 103 || m.id === 104))) ? (
            <div className="text-center py-20 bg-cream-50/20 border border-dashed border-cream-300 rounded-3xl p-6 shadow-2xs">
              <Calendar className="w-8 h-8 text-stone-300 mx-auto mb-3" />
              <h4 className="text-xs font-black uppercase text-stone-800 tracking-wider">Próximamente</h4>
              <p className="text-[11px] text-stone-500 mt-1 leading-relaxed max-w-xs mx-auto">
                Los partidos e información oficial para {
                  activeDateFilter === 'FECHA_2' ? 'la Fecha 2' : 
                  activeDateFilter === 'FECHA_3' ? 'la Fecha 3' : 
                  activeDateFilter === '16AVOS' ? 'la ronda de 16avos' : 
                  activeDateFilter === 'OCTAVOS' ? 'la ronda de 8avos' :
                  activeDateFilter === 'SEMIS' ? 'la ronda de semifinales' :
                  'la gran final y tercer puesto'
                } estarán disponibles próximamente.
              </p>
            </div>
          ) : filteredMatches.length === 0 ? (
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
                let predictionHighlightClass = '';
                let predictionPointsLabel = null;

                if (match.status === 'finished' && prediction && match.home_score !== null && match.home_score !== undefined && match.away_score !== null && match.away_score !== undefined) {
                  const actHome = match.home_score;
                  const actAway = match.away_score;
                  const predHome = prediction.home_score;
                  const predAway = prediction.away_score;
                  const phase = match.phase;
                  let mult = 1;
                  if (phase === '16avos de Final' || phase === 'Octavos de Final') {
                    mult = 2;
                  } else if (
                    phase === 'Semifinales' ||
                    phase === 'Semifinal' ||
                    phase === 'Gran Final' ||
                    phase === 'Final' ||
                    phase === 'Tercer Puesto'
                  ) {
                    mult = 10;
                  } else if (phase === 'Cuartos de Final') {
                    mult = 8;
                  } else if (phase !== 'Fase de Grupos') {
                    mult = 2;
                  }
                  const isElim = phase !== 'Fase de Grupos';

                  let bonusPoints = 0;
                  if (isElim && actHome === actAway && predHome === predAway) {
                    const actualWentToPenalties = match.home_penalty_score !== null && match.home_penalty_score !== undefined;
                    const actualWentToExtraTime = match.home_extra_score !== null && match.home_extra_score !== undefined;
                    const predWentToPenalties = prediction.home_penalty_score !== null && prediction.home_penalty_score !== undefined;
                    const predWentToExtraTime = prediction.home_extra_score !== null && prediction.home_extra_score !== undefined;

                    if (actualWentToPenalties && predWentToPenalties) {
                      if (match.home_penalty_score === prediction.home_penalty_score && match.away_penalty_score === prediction.away_penalty_score) {
                        bonusPoints = 2;
                      } else if (Math.sign(match.home_penalty_score! - match.away_penalty_score!) === Math.sign(prediction.home_penalty_score! - prediction.away_penalty_score!)) {
                        bonusPoints = 1;
                      }
                    } else if (actualWentToExtraTime && !actualWentToPenalties && predWentToExtraTime && !predWentToPenalties) {
                      if (match.home_extra_score === prediction.home_extra_score && match.away_extra_score === prediction.away_extra_score) {
                        bonusPoints = 2;
                      } else if (Math.sign(match.home_extra_score! - match.away_extra_score!) === Math.sign(prediction.home_extra_score! - prediction.away_extra_score!)) {
                        bonusPoints = 1;
                      }
                    }
                  }

                  if (predHome === actHome && predAway === actAway) {
                    predictionHighlightClass = 'prediction-exact';
                    predictionPointsLabel = `Exacto (+${3 * mult + bonusPoints})`;
                  } else if (Math.sign(actHome - actAway) === Math.sign(predHome - predAway)) {
                    predictionHighlightClass = 'prediction-outcome';
                    predictionPointsLabel = `Resultado (+${1 * mult + bonusPoints})`;
                  } else {
                    predictionHighlightClass = 'prediction-miss';
                    predictionPointsLabel = bonusPoints > 0 ? `Bonus (+${bonusPoints})` : 'Sin acierto (+0)';
                  }
                }

                return (
                  <div 
                    key={match.id} 
                    className={`glass-card border flex flex-col justify-between shadow-sm transition-all overflow-hidden bg-white ${predictionHighlightClass} ${
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
                          <div className="flex gap-1 items-center">
                            {predictionPointsLabel && (
                              <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                predictionPointsLabel.includes('+3')
                                  ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                  : predictionPointsLabel.includes('+1')
                                    ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                    : 'bg-stone-100 text-stone-450 border border-stone-200/50'
                              }`}>
                                {predictionPointsLabel}
                              </span>
                            )}
                            <span className="text-[8px] font-bold bg-cream-200 text-stone-550 px-2 py-0.5 rounded uppercase tracking-wider">
                              Finalizado
                            </span>
                          </div>
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
                        <span className="text-2xl" role="img" aria-label={homeTeam?.name || match.home_team_id || 'A confirmar'}>
                          {homeTeam?.flag_emoji || (match.home_team_id ? '🏳️' : '⏳')}
                        </span>
                        <span className="text-xs font-bold text-stone-800 truncate max-w-[110px]">
                          {homeTeam?.name || match.home_team_id || 'A confirmar'}
                        </span>
                      </div>

                      {/* Score or Divider */}
                      <div className="flex flex-col items-center px-4">
                        {match.status === 'finished' || match.status === 'live' ? (
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-stone-900 tracking-widest leading-none">
                              {match.home_score} - {match.away_score}
                            </span>
                            {match.home_penalty_score !== null && match.home_penalty_score !== undefined && (
                              <span className="text-[9.5px] font-black text-rose-600 tracking-wide mt-1">
                                ({match.home_penalty_score} - {match.away_penalty_score} Pen)
                              </span>
                            )}
                            {match.home_extra_score !== null && match.home_extra_score !== undefined && (match.home_penalty_score === null || match.home_penalty_score === undefined) && (
                              <span className="text-[8.5px] font-black text-gold-650 tracking-wider mt-1 uppercase">
                                {match.home_extra_score} - {match.away_extra_score} T.E.
                              </span>
                            )}
                          </div>
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
                        <span className="text-2xl" role="img" aria-label={awayTeam?.name || match.away_team_id || 'A confirmar'}>
                          {awayTeam?.flag_emoji || (match.away_team_id ? '🏳️' : '⏳')}
                        </span>
                        <span className="text-xs font-bold text-stone-800 truncate max-w-[110px]">
                          {awayTeam?.name || match.away_team_id || 'A confirmar'}
                        </span>
                      </div>
                    </div>

                    {/* Details & Predict Actions Footer */}
                    <div className="px-4 py-2 bg-cream-100/10 border-t border-cream-200 flex justify-between items-center text-[9px] text-stone-450 font-medium">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-stone-500 whitespace-nowrap shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-stone-405 shrink-0" />
                          {match.fecha}
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
                                ? `Editar: ${prediction.home_score} - ${prediction.away_score}${
                                    prediction.home_penalty_score !== null && prediction.home_penalty_score !== undefined ? ` (${prediction.home_penalty_score}-${prediction.away_penalty_score} Pen)` :
                                    prediction.home_extra_score !== null && prediction.home_extra_score !== undefined ? ` (${prediction.home_extra_score}-${prediction.away_extra_score} TE)` : ''
                                  }` 
                                : 'Pronosticar'}
                          </span>
                          {predictingMatchId === match.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      ) : (() => {
                        const isCompetitorsExpanded = !!expandedCompetitors[match.id];
                        return (
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full font-bold border text-[8.5px] ${
                              prediction 
                                ? 'bg-cream-100/60 text-stone-600 border-cream-250' 
                                : 'bg-stone-50 text-stone-400 border-stone-200/50'
                            }`}>
                              {prediction ? (
                                <span>
                                  Mío: {prediction.home_score}-{prediction.away_score}
                                  {prediction.home_penalty_score !== null && prediction.home_penalty_score !== undefined && ` (${prediction.home_penalty_score}-${prediction.away_penalty_score} PK)`}
                                  {prediction.home_extra_score !== null && prediction.home_extra_score !== undefined && ` (${prediction.home_extra_score}-${prediction.away_extra_score} TE)`}
                                </span>
                              ) : 'Sin pronóstico'}
                            </span>
                            <button
                              onClick={() => setExpandedCompetitors(prev => ({ ...prev, [match.id]: !prev[match.id] }))}
                              className={`px-3 py-1 rounded-full font-extrabold uppercase border text-[8.5px] tracking-wider flex items-center gap-1 transition-all shadow-3xs cursor-pointer ${
                                isCompetitorsExpanded
                                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                                  : 'bg-white text-stone-750 border-cream-300 hover:bg-cream-50 hover:scale-[1.02]'
                              }`}
                            >
                              <span>Rivales</span>
                              {isCompetitorsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        );
                      })()}
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
                                  <span className="text-[10px] font-bold text-stone-500 tracking-wider">{match.home_team_id || 'TBD'}</span>
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
                                  <span className="text-[10px] font-bold text-stone-500 tracking-wider">{match.away_team_id || 'TBD'}</span>
                                </div>
                              </div>

                              {/* Knockout definition section */}
                              {match.phase !== 'Fase de Grupos' && predHome && predAway && parseInt(predHome) === parseInt(predAway) && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="w-full space-y-4 border-t border-cream-200 pt-3"
                                >
                                  <div className="flex flex-col items-center gap-1.5">
                                    <span className="text-[8.5px] uppercase font-black text-stone-450 tracking-wider">Definición del Partido</span>
                                    <div className="flex bg-cream-100 p-0.5 rounded-xl border border-cream-250 gap-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDefinitionMethod('extra_time');
                                          setPredHomePenalty('');
                                          setPredAwayPenalty('');
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                          definitionMethod === 'extra_time'
                                            ? 'bg-stone-900 text-white shadow-2xs'
                                            : 'text-stone-500 hover:text-stone-800'
                                        }`}
                                      >
                                        Tiempo Extra
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setDefinitionMethod('penalties');
                                          setPredHomeExtra('');
                                          setPredAwayExtra('');
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                                          definitionMethod === 'penalties'
                                            ? 'bg-stone-900 text-white shadow-2xs'
                                            : 'text-stone-500 hover:text-stone-800'
                                        }`}
                                      >
                                        Penales
                                      </button>
                                    </div>
                                  </div>

                                  {definitionMethod === 'extra_time' && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex flex-col items-center gap-2"
                                    >
                                      <span className="text-[7.5px] uppercase font-black text-gold-650 tracking-widest">Goles en Suplementario (120')</span>
                                      <div className="flex items-center justify-center gap-3 w-full">
                                        <div className="flex-1 flex items-center justify-end gap-2">
                                          <span className="text-[9px] font-bold text-stone-450">{match.home_team_id || 'L'}</span>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={predHomeExtra}
                                            onChange={(e) => handleScoreChange(e.target.value, setPredHomeExtra)}
                                            className="w-10 h-9 text-center bg-white border border-cream-300 rounded-xl text-sm font-extrabold text-stone-900 focus:outline-none focus:border-gold-550 transition-all shadow-3xs"
                                            placeholder="-"
                                          />
                                        </div>
                                        <span className="text-stone-400 font-bold">:</span>
                                        <div className="flex-1 flex items-center justify-start gap-2">
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={predAwayExtra}
                                            onChange={(e) => handleScoreChange(e.target.value, setPredAwayExtra)}
                                            className="w-10 h-9 text-center bg-white border border-cream-300 rounded-xl text-sm font-extrabold text-stone-900 focus:outline-none focus:border-gold-550 transition-all shadow-3xs"
                                            placeholder="-"
                                          />
                                          <span className="text-[9px] font-bold text-stone-450">{match.away_team_id || 'V'}</span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}

                                  {definitionMethod === 'penalties' && (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className="flex flex-col items-center gap-2"
                                    >
                                      <span className="text-[7.5px] uppercase font-black text-rose-600 tracking-widest">Marcador de Penales</span>
                                      <div className="flex items-center justify-center gap-3 w-full">
                                        <div className="flex-1 flex items-center justify-end gap-2">
                                          <span className="text-[9px] font-bold text-stone-450">{match.home_team_id || 'L'}</span>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={predHomePenalty}
                                            onChange={(e) => handleScoreChange(e.target.value, setPredHomePenalty)}
                                            className="w-10 h-9 text-center bg-white border border-cream-300 rounded-xl text-sm font-extrabold text-stone-900 focus:outline-none focus:border-gold-550 transition-all shadow-3xs"
                                            placeholder="PK"
                                          />
                                        </div>
                                        <span className="text-stone-400 font-bold">:</span>
                                        <div className="flex-1 flex items-center justify-start gap-2">
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={predAwayPenalty}
                                            onChange={(e) => handleScoreChange(e.target.value, setPredAwayPenalty)}
                                            className="w-10 h-9 text-center bg-white border border-cream-300 rounded-xl text-sm font-extrabold text-stone-900 focus:outline-none focus:border-gold-550 transition-all shadow-3xs"
                                            placeholder="PK"
                                          />
                                          <span className="text-[9px] font-bold text-stone-450">{match.away_team_id || 'V'}</span>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.div>
                              )}

                              {/* Save Button */}
                              <button
                                onClick={() => handleSavePrediction(match.id)}
                                className="w-full h-11 bg-stone-900 hover:bg-stone-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer animate-none"
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
                    {!isPredictable && (() => {
                      const isCompetitorsExpanded = !!expandedCompetitors[match.id];
                      if (!isCompetitorsExpanded) return null;

                      const competitorProfiles = profiles.filter(prof => {
                        if (prof.is_admin) return false;
                        if (activeGroupIdForUser === 'all') return prof.id === currentProfileId;
                        return groupMembers.some(gm => gm.group_id === activeGroupIdForUser && gm.profile_id === prof.id);
                      });

                      return (
                        <div className="bg-cream-100/30 border-t border-cream-200 px-4 py-3 space-y-2">
                          <div className="flex items-center gap-1 text-[8px] uppercase tracking-wider font-extrabold text-stone-450">
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            <span>Pronósticos de la competencia:</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {competitorProfiles.map(prof => {
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
                                    {profPred ? (
                                      <span>
                                        {profPred.home_score}-{profPred.away_score}
                                        {profPred.home_penalty_score !== null && profPred.home_penalty_score !== undefined && ` (${profPred.home_penalty_score}-${profPred.away_penalty_score} PK)`}
                                        {profPred.home_extra_score !== null && profPred.home_extra_score !== undefined && ` (${profPred.home_extra_score}-${profPred.away_extra_score} TE)`}
                                      </span>
                                    ) : '-'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Info text if Predictable but other predictions are hidden */}
                    {isPredictable && (
                      <div className="bg-cream-100/10 border-t border-cream-200 px-4 py-2 flex items-center gap-1.5 text-[8.5px] text-stone-400 font-semibold italic">
                        <Users className="w-3 h-3 text-stone-300" />
                        <span>Los pronósticos de los rivales se revelarán 10 minutos antes del partido.</span>
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

      {/* Bracket Tree Tab */}
      {activeSubTab === 'bracket' && (
        <div className="animate-in fade-in duration-200">
          <BracketView />
        </div>
      )}

      {/* Prode Rankings Tab */}
      {activeSubTab === 'prode' && (() => {
        const filteredStandings = standings.filter(s => 
          activeGroupIdForUser === 'all'
            ? (activeProfile?.is_admin ? true : s.profile_id === currentProfileId)
            : groupMembers.some(gm => gm.group_id === activeGroupIdForUser && gm.profile_id === s.profile_id)
        );
        return (
          <div className="space-y-3 max-w-xl mx-auto animate-in fade-in duration-200">
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {filteredStandings.map((standing, index) => {
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
        );
      })()}
    </div>
  );
}

export default function MatchesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cream-300 border-t-gold-500 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-stone-450 font-semibold">Cargando</span>
      </div>
    }>
      <MatchesPageContent />
    </Suspense>
  );
}
