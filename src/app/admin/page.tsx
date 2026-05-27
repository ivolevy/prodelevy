'use client';

import { useStore } from '@/lib/store';
import { useState } from 'react';
import { ShieldCheck, Calendar, Save, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { Team, Match } from '@/lib/types';
import confetti from 'canvas-confetti';

export default function AdminPage() {
  const { 
    matches, 
    teams, 
    profiles, 
    currentProfileId, 
    updateMatchScore, 
    updateTeamStage, 
    resetToDefaults, 
    isDemoMode 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'matches' | 'teams'>('matches');
  
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [scoreHome, setScoreHome] = useState<string>('');
  const [scoreAway, setScoreAway] = useState<string>('');
  const [matchStatus, setMatchStatus] = useState<Match['status']>('upcoming');

  const [teamGroupFilter, setTeamGroupFilter] = useState<string>('A');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [syncingAi, setSyncingAi] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const isAdmin = activeProfile?.is_admin || isDemoMode; 

  const handleSyncResultsWithGemini = async () => {
    setSyncingAi(true);
    setSyncMessage(null);
    try {
      const res = await fetch('/api/sync-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matches }),
      });
      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        let count = 0;
        for (const item of data.results) {
          if (item.status) {
            await updateMatchScore(item.id, item.home_score, item.away_score, item.status);
            count++;
          }
        }
        setSyncMessage(`Sincronización completa: ${count} partidos actualizados.`);
        confetti({
          particleCount: 55,
          spread: 45,
          origin: { y: 0.8 },
          colors: ['#c5a880', '#b59469', '#1c1917']
        });
      } else {
        setSyncMessage('Gemini no devolvió resultados legibles.');
      }
    } catch (err) {
      setSyncMessage('Error al sincronizar con Gemini.');
    } finally {
      setSyncingAi(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatchId(match.id);
    setScoreHome(match.home_score !== null && match.home_score !== undefined ? String(match.home_score) : '0');
    setScoreAway(match.away_score !== null && match.away_score !== undefined ? String(match.away_score) : '0');
    setMatchStatus(match.status);
  };

  const handleSaveMatch = async (matchId: number) => {
    const sh = scoreHome === '' ? null : parseInt(scoreHome);
    const sa = scoreAway === '' ? null : parseInt(scoreAway);

    await updateMatchScore(matchId, sh, sa, matchStatus);
    setEditingMatchId(null);
    
    if (matchStatus === 'finished') {
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#c5a880', '#b59469', '#1c1917']
      });
    }
  };

  const handleStageChange = async (teamId: string, stage: Team['stage_reached']) => {
    await updateTeamStage(teamId, stage);
    if (stage === 'champion') {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#c5a880', '#b59469', '#1c1917']
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-500 animate-pulse" />
        <div className="space-y-2">
          <h2 className="font-bebas text-3xl tracking-widest text-gradient-gold">ACCESO RESTRINGIDO</h2>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Esta sección es exclusiva para el administrador del torneo. 
            Cambiá tu participante en la barra superior a <strong>Iván</strong> (Administrador) para ingresar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-stone-900 max-w-5xl mx-auto pt-2">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-cream-300 pb-4 gap-3">
        <div className="text-center sm:text-left">
          <h2 className="text-[10px] tracking-widest font-black uppercase text-stone-400">
            PANEL DE ADMINISTRACIÓN
          </h2>
          <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 leading-none mt-1 flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="w-6 h-6 text-gold-500" />
            Configuración y Resultados.
          </h1>
        </div>

        {/* Demo Mode Notice */}
        {isDemoMode && (
          <div className="bg-emerald-50 border border-emerald-250 rounded-xl px-4 py-2 flex gap-2 items-center shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="text-[9px] text-emerald-800 font-bold uppercase tracking-wider leading-none">
              Modo Admin Activado
            </p>
          </div>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="grid grid-cols-2 gap-2 border-b border-cream-300 pb-3">
        <button
          onClick={() => setActiveTab('matches')}
          className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'matches'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white border border-cream-300 text-stone-500 hover:text-stone-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Partidos</span>
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'teams'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-white border border-cream-300 text-stone-500 hover:text-stone-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Fases / Equipos</span>
        </button>
      </div>

      {/* MATCHES EDITOR TAB */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          {syncMessage && (
            <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-sm text-center">
              {syncMessage}
            </div>
          )}

          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-3">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-stone-400">Actualizar Fixture</h3>
              <button
                onClick={handleSyncResultsWithGemini}
                disabled={syncingAi}
                className="px-2 py-1 bg-white border border-cream-300 text-[8px] font-extrabold uppercase tracking-widest text-stone-700 hover:bg-cream-100 rounded-lg shadow-2xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncingAi ? 'Sincronizando...' : 'Sincronizar Fixture con IA'}
              </button>
            </div>
            <span className="text-[9px] font-bold text-stone-500 bg-cream-200 px-2 py-0.5 rounded">{matches.length} partidos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(match => {
              const isEditing = editingMatchId === match.id;
              
              return (
                <div 
                  key={match.id} 
                  className={`glass-card p-4 border shadow-sm ${
                    isEditing 
                      ? 'border-gold-500 bg-gold-100/10' 
                      : 'border-cream-300 hover:border-cream-400 bg-white'
                  }`}
                >
                  {/* Top line */}
                  <div className="flex justify-between items-center text-[8px] text-stone-400 font-bold uppercase border-b border-cream-200 pb-1.5 mb-3">
                    <span>Partido {match.id} - Grupo {match.group_letter}</span>
                    <span className={`px-1.5 py-0.5 rounded ${
                      match.status === 'live' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-cream-100 text-stone-500'
                    }`}>
                      {match.status}
                    </span>
                  </div>

                  {/* Editor or Preview */}
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-xs font-bold text-stone-800">{match.home_team_id}</span>
                          <input 
                            type="number"
                            value={scoreHome}
                            onChange={(e) => setScoreHome(e.target.value)}
                            className="w-12 h-9 text-center bg-white border border-cream-300 rounded-lg text-sm font-bebas text-stone-800 focus:outline-none focus:border-gold-500" 
                          />
                        </div>

                        <span className="text-stone-400 font-bold">-</span>

                        <div className="flex-1 flex flex-col items-center">
                          <span className="text-xs font-bold text-stone-800">{match.away_team_id}</span>
                          <input 
                            type="number"
                            value={scoreAway}
                            onChange={(e) => setScoreAway(e.target.value)}
                            className="w-12 h-9 text-center bg-white border border-cream-300 rounded-lg text-sm font-bebas text-stone-800 focus:outline-none focus:border-gold-500" 
                          />
                        </div>
                      </div>

                      {/* Status select */}
                      <div className="flex gap-2 items-center justify-between">
                        <span className="text-[9px] font-bold text-stone-550 uppercase">Estado:</span>
                        <div className="flex gap-1">
                          {['upcoming', 'live', 'finished'].map(s => (
                            <button
                              key={s}
                              onClick={() => setMatchStatus(s as any)}
                              className={`px-2 py-1 rounded text-[8px] font-bold uppercase transition-all ${
                                matchStatus === s 
                                  ? 'bg-gold-500 text-white shadow-sm' 
                                  : 'bg-white text-stone-500 border border-cream-300'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 justify-end pt-2 border-t border-cream-200">
                        <button
                          onClick={() => setEditingMatchId(null)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase text-stone-500 bg-white hover:bg-cream-100 border border-cream-300"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleSaveMatch(match.id)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase text-white bg-stone-900 hover:bg-stone-800 flex items-center gap-1 shadow-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Guardar</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-750">{match.home_team_id}</span>
                          <span className="text-xs font-bold text-stone-400">vs</span>
                          <span className="text-xs font-bold text-stone-750">{match.away_team_id}</span>
                        </div>
                        
                        {(match.status === 'finished' || match.status === 'live') && (
                          <span className="font-bold text-stone-900">
                            {match.home_score} - {match.away_score}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleEditMatch(match)}
                        className="px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-wider bg-cream-200 text-stone-750 hover:bg-cream-300 border border-cream-300 rounded-lg"
                      >
                        Cargar Score
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TEAMS ADVANCEMENT TAB */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-stone-400">Progreso de Equipos</h3>
            
            <select
              value={teamGroupFilter}
              onChange={(e) => setTeamGroupFilter(e.target.value)}
              className="bg-white border border-cream-300 rounded-lg text-[9px] font-bold text-stone-750 uppercase px-2 py-1 shadow-sm focus:outline-none"
            >
              {['A','B','C','D','E','F','G','H','I','J','K','L'].map(g => (
                <option key={g} value={g}>Grupo {g}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.filter(t => t.group_letter === teamGroupFilter).map(team => (
              <div key={team.id} className="glass-card p-4 border flex items-center justify-between bg-white shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-bold bg-cream-200 border border-cream-300 px-1.5 py-0.5 rounded text-stone-700">
                    {team.id}
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-stone-850">{team.name}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] text-stone-450 font-bold uppercase">Fase:</span>
                  <select
                    value={team.stage_reached}
                    onChange={(e) => handleStageChange(team.id, e.target.value as any)}
                    className="bg-white border border-cream-300 rounded-lg text-[9px] font-bold text-gold-600 uppercase px-2 py-1 focus:outline-none shadow-sm"
                  >
                    <option value="group">Grupo (0 pts)</option>
                    <option value="octavos">Octavos (1 pt)</option>
                    <option value="cuartos">Cuartos (2 pts)</option>
                    <option value="semifinal">Semifinal (3 pts)</option>
                    <option value="finalist">Finalista (5 pts)</option>
                    <option value="champion">Campeón (8 pts)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Reset */}
      <div className="pt-6 border-t border-cream-300 text-center space-y-4">
        {resetSuccessMessage && (
          <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl shadow-sm inline-block mx-auto">
            {resetSuccessMessage}
          </div>
        )}
        
        {!confirmResetOpen ? (
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reiniciar Valores Iniciales</span>
          </button>
        ) : (
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 max-w-md mx-auto space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
              ¿Confirmar reinicio total de fixture, posiciones y drafts?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3 py-1.5 bg-white border border-cream-300 rounded-lg text-[9px] font-bold uppercase tracking-wider text-stone-500 hover:bg-cream-100"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  await resetToDefaults();
                  setConfirmResetOpen(false);
                  setResetSuccessMessage('Datos reiniciados con éxito');
                  setTimeout(() => {
                    setResetSuccessMessage(null);
                    window.location.reload();
                  }, 2000);
                }}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider hover:bg-rose-700 shadow-sm"
              >
                Sí, Reiniciar Todo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
