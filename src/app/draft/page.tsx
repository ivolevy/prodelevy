'use client';

import { useStore } from '@/lib/store';
import { Profile } from '@/lib/types';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, CheckCircle2, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

// Soccer strength index (probabilities)
const TEAM_RATINGS: Record<string, { pct: number; label: string }> = {
  ARG: { pct: 95, label: 'Candidato' },
  FRA: { pct: 94, label: 'Candidato' },
  BRA: { pct: 92, label: 'Candidato' },
  ENG: { pct: 91, label: 'Candidato' },
  ESP: { pct: 90, label: 'Candidato' },
  POR: { pct: 89, label: 'Fuerte' },
  GER: { pct: 88, label: 'Fuerte' },
  NED: { pct: 86, label: 'Fuerte' },
  BEL: { pct: 84, label: 'Fuerte' },
  URU: { pct: 82, label: 'Fuerte' },
  COL: { pct: 81, label: 'Fuerte' },
  MAR: { pct: 75, label: 'Fuerte' },
  USA: { pct: 72, label: 'Fuerte' },
  MEX: { pct: 65, label: 'Moderado' },
  CRO: { pct: 74, label: 'Fuerte' },
  ECU: { pct: 68, label: 'Moderado' },
  SUI: { pct: 67, label: 'Moderado' },
  JPN: { pct: 70, label: 'Fuerte' },
  SWE: { pct: 66, label: 'Moderado' },
  SEN: { pct: 64, label: 'Moderado' },
  PAR: { pct: 55, label: 'Moderado' },
  CAN: { pct: 58, label: 'Moderado' },
  CZE: { pct: 54, label: 'Moderado' },
  TUR: { pct: 56, label: 'Moderado' },
  GHA: { pct: 48, label: 'Sorpresa' },
  CIV: { pct: 52, label: 'Sorpresa' },
  AUS: { pct: 45, label: 'Sorpresa' },
  BIH: { pct: 42, label: 'Sorpresa' },
  AUT: { pct: 53, label: 'Moderado' },
  EGY: { pct: 50, label: 'Sorpresa' },
  RSA: { pct: 36, label: 'Sorpresa' },
  TUN: { pct: 38, label: 'Sorpresa' },
  KSA: { pct: 34, label: 'Sorpresa' },
  QAT: { pct: 35, label: 'Sorpresa' },
  ALG: { pct: 42, label: 'Sorpresa' },
  PAN: { pct: 28, label: 'Cenicienta' },
  HAI: { pct: 15, label: 'Cenicienta' },
  NZL: { pct: 22, label: 'Cenicienta' },
  CUW: { pct: 12, label: 'Cenicienta' },
  CPV: { pct: 24, label: 'Cenicienta' },
  IRQ: { pct: 20, label: 'Cenicienta' },
  JOR: { pct: 18, label: 'Cenicienta' },
  SCO: { pct: 40, label: 'Sorpresa' },
  IRN: { pct: 32, label: 'Sorpresa' },
  NOR: { pct: 62, label: 'Moderado' },
  COD: { pct: 26, label: 'Cenicienta' },
  UZB: { pct: 20, label: 'Cenicienta' },
};

const getTeamRating = (teamId: string) => {
  return TEAM_RATINGS[teamId] || { pct: 30, label: 'Sorpresa' };
};

export default function DraftPage() {
  const { teams, selections, currentProfileId, selectTeams, profiles } = useStore();
  const [selected, setSelected] = useState<string[]>(() => {
    const userSel = selections.find(s => s.profile_id === currentProfileId);
    const initial: string[] = [];
    if (userSel?.team1_id) initial.push(userSel.team1_id);
    if (userSel?.team2_id) initial.push(userSel.team2_id);
    return initial;
  });
  const [activeGroupFilter, setActiveGroupFilter] = useState<'ALL' | string>('ALL');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const activeProfileInitials = activeProfile ? activeProfile.display_name.substring(0, 2).toUpperCase() : 'US';

  const userSel = selections.find(s => s.profile_id === currentProfileId);
  const isAlreadyDrafted = !!userSel?.team1_id && !!userSel?.team2_id;

  // Group letters
  const groups = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  if (isAlreadyDrafted) {
    const team1 = teams.find(t => t.id === userSel?.team1_id);
    const team2 = teams.find(t => t.id === userSel?.team2_id);

    return (
      <div className="space-y-6 text-stone-900 max-w-2xl mx-auto pt-2">
        {/* Page Header */}
        <div className="text-center pb-4 border-b border-cream-300">
          <h2 className="text-[10px] tracking-widest font-black uppercase text-stone-400">
            DRAFT DE SELECCIONES
          </h2>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 leading-none mt-1">
            Tu Selección está Confirmada.
          </h1>
          <p className="text-stone-400 text-[8px] uppercase font-bold mt-2 tracking-wider">
            Para garantizar la transparencia familiar, las selecciones de equipos son definitivas.
          </p>
        </div>

        {/* Selected Countries Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[team1, team2].map((team, idx) => {
            if (!team) return null;
            return (
              <div key={team.id} className="bg-white border border-cream-300 rounded-xl p-5 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700">
                    {team.id}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-850">{team.name}</h4>
                    <span className="text-[8px] uppercase font-bold text-stone-400 block mt-0.5">
                      Grupo {team.group_letter}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[7px] uppercase font-extrabold bg-gold-500/10 text-gold-700 border border-gold-300/20 px-1.5 py-0.5 rounded">
                    Elegido {idx === 0 ? '1º' : '2º'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Other competitors drafts list (visibility of system state) */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black border-b border-cream-200 pb-2">
            SELECCIONES DE LA FAMILIA
          </h3>
          <div className="space-y-3">
            {profiles.map(p => {
              const pSel = selections.find(s => s.profile_id === p.id);
              const t1 = teams.find(t => t.id === pSel?.team1_id);
              const t2 = teams.find(t => t.id === pSel?.team2_id);
              const initials = p.display_name.substring(0, 2).toUpperCase();

              return (
                <div key={p.id} className="flex items-center justify-between text-xs py-1 border-b border-cream-200 last:border-0 pb-2 last:pb-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cream-200 flex items-center justify-center text-[8px] font-bold text-stone-600">
                      {initials}
                    </span>
                    <span className={`font-bold ${p.id === currentProfileId ? 'text-stone-900' : 'text-stone-605'}`}>
                      {p.display_name} {p.id === currentProfileId && '(Tú)'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {t1 ? (
                      <span className="text-[9px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700">
                        {t1.id}
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-stone-300">Pendiente</span>
                    )}
                    {t2 ? (
                      <span className="text-[9px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700">
                        {t2.id}
                      </span>
                    ) : (
                      <span className="text-[8px] font-bold uppercase tracking-wider text-stone-300">Pendiente</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const getOtherDraftedOwners = (teamId: string) => {
    const matches = selections.filter(s => s.profile_id !== currentProfileId && (s.team1_id === teamId || s.team2_id === teamId));
    return matches.map(m => profiles.find(p => p.id === m.profile_id)).filter(Boolean) as Profile[];
  };

  const handleSelect = (teamId: string) => {
    if (selected.includes(teamId)) {
      setSelected(selected.filter(id => id !== teamId));
    } else {
      if (selected.length >= 2) {
        setSelected([selected[1], teamId]);
      } else {
        setSelected([...selected, teamId]);
      }
    }
  };

  const handleConfirm = async () => {
    if (selected.length !== 2) return;
    
    await selectTeams(currentProfileId, selected[0], selected[1]);
    
    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#c5a880', '#b59469', '#1c1917']
    });

    setSuccessMessage(`¡Selección confirmada para ${activeProfile?.display_name}!`);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const filteredTeams = activeGroupFilter === 'ALL'
    ? teams
    : teams.filter(t => t.group_letter === activeGroupFilter);

  const availableCount = teams.length;

  return (
    <div className="space-y-6 text-stone-900 max-w-5xl mx-auto pt-2">
      {/* Success Notification Banner */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm text-center">
          {successMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-cream-300 pb-4 gap-3">
        <div className="text-center sm:text-left">
          <h2 className="text-[10px] tracking-widest font-black uppercase text-stone-400">
            DRAFT DE SELECCIONES
          </h2>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 leading-none mt-1">
            Elegí tus 2 países del torneo.
          </h1>
        </div>

        {/* Status Box */}
        <div className="glass-card px-4 py-2 border border-cream-300 flex items-center gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center text-[9px] font-black text-stone-600">
              {activeProfileInitials}
            </span>
            <span className="text-xs font-bold text-stone-700">{activeProfile?.display_name}</span>
          </div>
          <div className="h-6 w-px bg-cream-300" />
          <div className="text-right">
            <span className="font-bebas text-2xl text-gold-500 leading-none">{selected.length}/2</span>
            <p className="text-[7px] text-stone-450 uppercase tracking-widest leading-none font-bold">Picks</p>
          </div>
        </div>
      </div>

      {/* Filters & Stats Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cream-300 pb-4">
        {/* Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none mask-right">
          {groups.map(grp => (
            <button
              key={grp}
              onClick={() => setActiveGroupFilter(grp)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                activeGroupFilter === grp
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white border border-cream-300 text-stone-500 hover:text-stone-700'
              }`}
            >
              {grp === 'ALL' ? 'Todos' : `Grupo ${grp}`}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="text-stone-500 text-[9px] font-bold uppercase tracking-wider flex items-center gap-3 shrink-0">
          <span>Libres: <strong className="text-gold-650 text-xs font-black">{availableCount}</strong></span>
          <span className="w-1.5 h-1.5 rounded-full bg-cream-300" />
          <span className="flex items-center gap-1 font-semibold">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            5 competidores
          </span>
        </div>
      </div>

      {/* Grid of Teams */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTeams.map(team => {
          const isSelectedByMe = selected.includes(team.id);
          const others = getOtherDraftedOwners(team.id);
          const rating = getTeamRating(team.id);

          return (
            <motion.button
              key={team.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(team.id)}
              className={`glass-card p-4 border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all shadow-sm ${
                isSelectedByMe
                  ? 'border-gold-500 bg-gold-100/10'
                  : 'border-cream-300 hover:border-cream-400 bg-white'
              }`}
            >
              {/* Top Row */}
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700">
                    {team.id}
                  </span>
                </div>
                {isSelectedByMe && (
                  <CheckCircle2 className="w-5 h-5 text-gold-500 fill-white" />
                )}
              </div>

              {/* Center Details */}
              <div className="mt-1">
                <h4 className="text-xs font-bold text-stone-850 truncate pr-3">{team.name}</h4>
                <p className="text-[8px] text-stone-450 uppercase tracking-widest leading-none font-bold mt-0.5">
                  Grupo {team.group_letter}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="mt-1 w-full flex justify-between items-end border-t border-cream-200/50 pt-1">
                {others.length > 0 ? (
                  <div className="text-[8px] font-bold text-stone-500 flex items-center gap-1.5 w-full justify-between">
                    <div className="flex -space-x-1">
                      {others.map(oth => (
                        <span key={oth.id} className="w-3.5 h-3.5 rounded-full bg-cream-300 flex items-center justify-center text-[6px] font-bold text-stone-600 border border-white">
                          {oth.display_name.substring(0, 2).toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <span className="text-[6.5px] uppercase tracking-wider text-stone-400 truncate max-w-[65px]">
                      {others.map(o => o.display_name).join(', ')}
                    </span>
                  </div>
                ) : (
                  <div className="w-full flex justify-between items-center text-[7px] font-bold uppercase tracking-wider">
                    <span className="text-stone-450">{rating.label}</span>
                    <span className="text-gold-650 font-black">{rating.pct}% prob.</span>
                  </div>
                )}
              </div>

              {/* Visual Rating Fill */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-cream-200">
                <div 
                  className="h-full bg-gold-500" 
                  style={{ width: `${rating.pct}%` }}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Floating confirm bar */}
      <AnimatePresence>
        {selected.length === 2 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md"
          >
            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-xl bg-stone-900 text-white font-extrabold text-xs uppercase tracking-widest shadow-2xl hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
            >
              <span>Confirmar Selección de Equipos</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
