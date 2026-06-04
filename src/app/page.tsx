'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import Countdown from '@/components/Countdown';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, ArrowRight, Sparkles, AlertCircle, CheckCircle, 
  ChevronDown, ChevronRight, Smartphone, Users, Calendar, 
  Settings, Plus, Trash2, Eye, EyeOff, HelpCircle, X, Play, LogOut 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [isStandalone, setIsStandalone] = useState(false);

  // Tour / Onboarding State
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Admin form state
  const [adminTab, setAdminTab] = useState<'users' | 'groups' | 'standings'>('users');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Group form state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [groupError, setGroupError] = useState<string | null>(null);
  const [groupSuccess, setGroupSuccess] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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
    setCurrentProfile,
    autoSeedPredictions, 
    saveChampionPrediction,
    addProfile,
    deleteProfile,
    editProfile,
    createGroup,
    isDemoMode,
    isLoading 
  } = useStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem('prode_onboarding_completed');
      const activeProfile = profiles.find(p => p.id === currentProfileId);
      // Only show to logged in regular users who haven't completed the tour
      if (!completed && activeProfile && !activeProfile.is_admin) {
        setShowTour(true);
      }
    }
  }, [currentProfileId, profiles]);

  const handleNextStep = () => {
    if (tourStep < 4) {
      setTourStep(prev => prev + 1);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrevStep = () => {
    if (tourStep > 0) {
      setTourStep(prev => prev - 1);
    }
  };

  const handleCompleteTour = () => {
    setShowTour(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_onboarding_completed', 'true');
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#c5a880', '#b59469', '#1c1917']
    });
  };

  const showSuccess = (msg: string) => {
    setAdminSuccess(msg);
    setAdminError(null);
    setTimeout(() => setAdminSuccess(null), 3000);
  };

  const showError = (msg: string) => {
    setAdminError(msg);
    setAdminSuccess(null);
    setTimeout(() => setAdminError(null), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      showError('Por favor completa todos los campos.');
      return;
    }
    const cleanUsername = newUsername.trim();
    try {
      await addProfile(cleanUsername, cleanUsername, newPassword);
      setIsCreatingNew(false);
      setNewUsername('');
      setNewPassword('');
      showSuccess('Usuario creado con éxito.');
    } catch (err: any) {
      showError(err.message || 'Error al crear usuario.');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUsername.trim()) {
      showError('Por favor completa los campos requeridos.');
      return;
    }
    const cleanUsername = editUsername.trim();
    try {
      await editProfile(editingProfileId!, cleanUsername, cleanUsername, editPassword || undefined);
      setEditingProfileId(null);
      setEditUsername('');
      setEditPassword('');
      showSuccess('Usuario modificado con éxito.');
    } catch (err: any) {
      showError(err.message || 'Error al modificar usuario.');
    }
  };

  const showGroupSuccess = (msg: string) => {
    setGroupSuccess(msg);
    setGroupError(null);
    setTimeout(() => setGroupSuccess(null), 3000);
  };

  const showGroupError = (msg: string) => {
    setGroupError(msg);
    setGroupSuccess(null);
    setTimeout(() => setGroupError(null), 4000);
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupCode.trim()) {
      showGroupError('Por favor completa todos los campos.');
      return;
    }
    try {
      await createGroup(newGroupName, newGroupCode);
      setIsCreatingGroup(false);
      setNewGroupName('');
      setNewGroupCode('');
      showGroupSuccess('Grupo creado con éxito.');
    } catch (err: any) {
      showGroupError(err.message || 'Error al crear grupo.');
    }
  };

  const handleLogout = () => {
    setCurrentProfile('');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cream-300 border-t-gold-500 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-stone-450 font-semibold">Cargando</span>
      </div>
    );
  }

  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const myPredictions = predictions.filter(p => p.participant_id === currentProfileId);
  const totalMatchesCount = matches.length;
  const completedPredictionsCount = myPredictions.length;

  const upcomingMatches = matches.filter(m => m.status === 'upcoming');
  const pendingPredictionsCount = upcomingMatches.filter(m => !myPredictions.some(p => p.match_id === m.id)).length;

  const liveMatches = matches.filter(m => m.status === 'live');
  const featuredMatches = [...liveMatches, ...upcomingMatches].slice(0, 3);

  const myGroupMemberships = groupMembers.filter(gm => gm.profile_id === currentProfileId);
  const myGroups = groups.filter(g => myGroupMemberships.some(gm => gm.group_id === g.id));
  const myGroupIds = myGroups.map(g => g.id);

  const filteredStandings = standings.filter(s => 
    selectedGroupId === 'all'
      ? true 
      : groupMembers.some(gm => gm.group_id === selectedGroupId && gm.profile_id === s.profile_id)
  );

  // --- ADMIN VIEW PANEL ---
  if (activeProfile?.is_admin) {
    const totalParticipants = profiles.filter(p => !p.is_admin).length;
    const totalGroups = groups.length;
    const totalMatchesPlayed = matches.filter(m => m.status === 'finished').length;
    const totalPredictionsCount = predictions.length;

    // Filter participants based on search query
    const filteredParticipants = profiles.filter(p => 
      !p.is_admin && 
      (p.display_name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
       (p.username && p.username.toLowerCase().includes(userSearchQuery.toLowerCase())))
    );

    return (
      <div className="space-y-6 text-stone-905 max-w-5xl mx-auto pt-2 pb-20 animate-in fade-in duration-300">
        {/* Admin Header */}
        <div className="border-b border-cream-300 pb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-center sm:text-left">
            <h2 className="text-[10px] tracking-widest font-black uppercase text-stone-450">PANEL DE ADMINISTRACIÓN</h2>
            <h1 className="text-xl font-extrabold tracking-tight text-stone-900 uppercase mt-0.5">Control Central del Prode</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-250 bg-rose-50/50 hover:bg-rose-50 text-rose-650 hover:text-rose-700 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-xs shrink-0"
            title="Cerrar sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 border border-cream-300 bg-white shadow-xs">
            <div className="flex justify-between items-start">
              <span className="block text-2xl font-black text-stone-900 leading-none">{totalParticipants}</span>
              <Users className="w-4 h-4 text-stone-400" />
            </div>
            <span className="block text-[8px] text-stone-450 uppercase tracking-widest font-black mt-2">Participantes Activos</span>
          </div>

          <div className="glass-card p-4 border border-cream-300 bg-white shadow-xs">
            <div className="flex justify-between items-start">
              <span className="block text-2xl font-black text-stone-900 leading-none">{totalGroups}</span>
              <Users className="w-4 h-4 text-stone-400" />
            </div>
            <span className="block text-[8px] text-stone-450 uppercase tracking-widest font-black mt-2">Grupos Creados</span>
          </div>

          <div className="glass-card p-4 border border-cream-300 bg-white shadow-xs">
            <div className="flex justify-between items-start">
              <span className="block text-2xl font-black text-stone-900 leading-none">{totalPredictionsCount}</span>
              <Trophy className="w-4 h-4 text-stone-400" />
            </div>
            <span className="block text-[8px] text-stone-450 uppercase tracking-widest font-black mt-2">Pronósticos Totales</span>
          </div>

          <div className="glass-card p-4 border border-cream-300 bg-white shadow-xs">
            <div className="flex justify-between items-start">
              <span className="block text-2xl font-black text-stone-900 leading-none">{totalMatchesPlayed} / {totalMatchesCount}</span>
              <Calendar className="w-4 h-4 text-stone-400" />
            </div>
            <span className="block text-[8px] text-stone-450 uppercase tracking-widest font-black mt-2">Partidos Jugados</span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-cream-100/50 p-1 rounded-2xl border border-cream-300 gap-1 w-full max-w-sm">
          {[
            { id: 'users', label: 'Usuarios' },
            { id: 'groups', label: 'Grupos' },
            { id: 'standings', label: 'Posiciones' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex-1 px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all cursor-pointer ${
                adminTab === tab.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-500 hover:text-stone-850'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="space-y-4">
          {adminTab === 'users' && (
            <div className="glass-card p-6 border border-cream-300 bg-white text-left space-y-6 shadow-sm">
              <div className="border-b border-cream-200 pb-3 flex justify-between items-center gap-3">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gold-505" /> Gestión de Participantes
                </h3>
                <button
                  onClick={() => {
                    setIsCreatingNew(!isCreatingNew);
                    setEditingProfileId(null);
                    setNewUsername('');
                    setNewPassword('');
                  }}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Nuevo Usuario
                </button>
              </div>

              {adminError && <p className="text-[9px] font-bold text-rose-650 bg-rose-50 border border-rose-200 p-2 rounded-lg text-center leading-tight">{adminError}</p>}
              {adminSuccess && <p className="text-[9px] font-bold text-emerald-650 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center leading-tight">{adminSuccess}</p>}

              {/* Create User Form */}
              {isCreatingNew && (
                <form onSubmit={handleCreateUser} className="p-4 border border-cream-250 bg-cream-50/15 rounded-2xl space-y-3">
                  <h4 className="text-[9.5px] font-black tracking-widest text-stone-450 uppercase mb-2">Crear Nuevo Participante</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Nombre de Usuario</label>
                      <input
                        type="text"
                        placeholder="ej: juanp"
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Contraseña</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="ej: 1234"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          className="w-full bg-white border border-cream-300 rounded-lg pl-2.5 pr-8 py-1.5 text-xs focus:outline-none focus:border-gold-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-650 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-2.5 py-1 border border-cream-300 bg-white hover:bg-cream-100/30 text-stone-700 font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="px-3 py-1 bg-stone-900 hover:bg-stone-850 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer">Crear</button>
                  </div>
                </form>
              )}

              {/* Edit User Form */}
              {editingProfileId && (
                <form onSubmit={handleEditUser} className="p-4 border border-gold-500/30 bg-gold-500/5 rounded-2xl space-y-3">
                  <h4 className="text-[9.5px] font-black tracking-widest text-gold-650 uppercase mb-2">Editar Participante</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Usuario</label>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={e => setEditUsername(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-555"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Contraseña</label>
                      <div className="relative">
                        <input
                          type={showEditPassword ? "text" : "password"}
                          placeholder="Nueva contraseña"
                          value={editPassword}
                          onChange={e => setEditPassword(e.target.value)}
                          className="w-full bg-white border border-cream-300 rounded-lg pl-2.5 pr-8 py-1.5 text-xs focus:outline-none focus:border-gold-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-650 cursor-pointer"
                        >
                          {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfileId(null)}
                      className="px-2.5 py-1 border border-cream-300 bg-white hover:bg-cream-100/30 text-stone-700 font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="px-3 py-1 bg-gold-600 hover:bg-gold-700 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all">Guardar Cambios</button>
                  </div>
                </form>
              )}

              {/* User Search */}
              <input
                type="text"
                placeholder="Buscar participante por nombre..."
                value={userSearchQuery}
                onChange={e => setUserSearchQuery(e.target.value)}
                className="w-full bg-cream-50/30 border border-cream-300 rounded-xl px-3.5 py-2 text-xs text-stone-850 placeholder-stone-450 focus:outline-none focus:border-gold-500 transition-all font-semibold"
              />

              {/* User List */}
              <div className="divide-y divide-cream-150 border border-cream-200 rounded-2xl overflow-hidden bg-cream-50/5">
                {filteredParticipants.map(p => {
                  const initials = p.display_name.substring(0, 2).toUpperCase();
                  const pPredCount = predictions.filter(pr => pr.participant_id === p.id).length;

                  return (
                    <div key={p.id} className="flex justify-between items-center p-3.5 hover:bg-cream-50/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-xs font-black text-white uppercase shrink-0">
                          {initials}
                        </span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-stone-850">{p.display_name}</span>
                            <span className="text-[7px] font-bold uppercase bg-stone-105 border border-stone-250/50 text-stone-500 px-1.5 py-0.2 rounded shrink-0">
                              {pPredCount} pronósticos
                            </span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 mt-1 text-[8.5px] text-stone-450 font-semibold uppercase">
                            <span>User: <strong className="text-stone-750 font-bold">{p.username || p.display_name.toLowerCase()}</strong></span>
                            <span className="hidden sm:inline text-stone-300">|</span>
                            <span className="flex items-center gap-1">
                              Pass: <strong className="text-stone-750 font-bold font-mono">{showPasswords[p.id] ? p.password : '••••••••'}</strong>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowPasswords(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                                }}
                                className="p-0.5 text-stone-400 hover:text-stone-650 cursor-pointer"
                              >
                                {showPasswords[p.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProfileId(p.id);
                            setIsCreatingNew(false);
                            setEditUsername(p.username || p.display_name.toLowerCase());
                            setEditPassword(p.password || '');
                            setShowEditPassword(false);
                          }}
                          className="px-2.5 py-1 border border-cream-300 bg-white hover:bg-cream-100/30 text-stone-750 font-bold text-[8px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`¿Estás seguro de eliminar a ${p.display_name}?`)) {
                              await deleteProfile(p.id);
                              showSuccess('Usuario eliminado correctamente.');
                            }
                          }}
                          className="p-1.5 border border-rose-250 bg-rose-50/50 hover:bg-rose-50 text-rose-650 hover:text-rose-700 font-bold text-[8px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {adminTab === 'groups' && (
            <div className="glass-card p-6 border border-cream-300 bg-white text-left space-y-6 shadow-sm">
              <div className="border-b border-cream-200 pb-3 flex justify-between items-center gap-3">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gold-500" /> Gestión de Grupos
                </h3>
                <button
                  onClick={() => {
                    setIsCreatingGroup(!isCreatingGroup);
                    setNewGroupName('');
                    setNewGroupCode('');
                    setGroupError(null);
                  }}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-850 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Nuevo Grupo
                </button>
              </div>

              {groupError && <p className="text-[9px] font-bold text-rose-650 bg-rose-50 border border-rose-200 p-2 rounded-lg text-center leading-tight">{groupError}</p>}
              {groupSuccess && <p className="text-[9px] font-bold text-emerald-650 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center leading-tight">{groupSuccess}</p>}

              {/* Create Group Form */}
              {isCreatingGroup && (
                <form onSubmit={handleCreateGroupSubmit} className="p-4 border border-cream-250 bg-cream-50/15 rounded-2xl space-y-3">
                  <h4 className="text-[9.5px] font-black tracking-widest text-stone-450 uppercase mb-2">Crear Nuevo Grupo</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Nombre del Grupo</label>
                      <input
                        type="text"
                        placeholder="ej: FLIA. LEVY"
                        value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Código de Invitación</label>
                      <input
                        type="text"
                        placeholder="ej: LEVY26"
                        value={newGroupCode}
                        onChange={e => setNewGroupCode(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500 uppercase font-bold"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingGroup(false)}
                      className="px-2.5 py-1 border border-cream-300 bg-white hover:bg-cream-100/30 text-stone-700 font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="px-3 py-1 bg-stone-900 hover:bg-stone-850 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer">Crear Grupo</button>
                  </div>
                </form>
              )}

              {/* Groups List */}
              <div className="divide-y divide-cream-150 border border-cream-200 rounded-2xl overflow-hidden bg-cream-50/5">
                {groups.length === 0 ? (
                  <p className="p-4 text-xs text-stone-450 italic text-center">No hay grupos creados.</p>
                ) : (
                  groups.map(g => {
                    const isGroupExpanded = !!expandedGroups[g.id];
                    const members = groupMembers
                      .filter(gm => gm.group_id === g.id)
                      .map(gm => profiles.find(p => p.id === gm.profile_id))
                      .filter(Boolean) as typeof profiles;

                    return (
                      <div key={g.id} className="p-4 hover:bg-cream-50/10 transition-colors">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-xs font-black text-stone-900 uppercase">{g.name}</h4>
                            <div className="flex gap-2 mt-1 text-[8.5px] text-stone-440 font-bold uppercase tracking-wider">
                              <span>Código: <strong className="text-gold-650 font-black select-all">{g.invite_code}</strong></span>
                              <span>•</span>
                              <span>{members.length} miembros</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setExpandedGroups(prev => ({ ...prev, [g.id]: !prev[g.id] }))}
                            className="px-2.5 py-1 border border-cream-300 bg-white hover:bg-cream-100 text-stone-750 font-bold text-[8px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                          >
                            {isGroupExpanded ? 'Ocultar Miembros' : 'Ver Miembros'}
                          </button>
                        </div>
                        {isGroupExpanded && (
                          <div className="mt-3 pl-3 border-l-2 border-gold-500/30 text-[10px] text-stone-650 space-y-1.5">
                            <strong className="text-[7.5px] text-stone-450 uppercase font-black tracking-widest block">Lista de Miembros:</strong>
                            {members.length === 0 ? (
                              <span className="italic text-stone-400">Sin miembros aún.</span>
                            ) : (
                              members.map(m => (
                                <div key={m.id} className="flex justify-between items-center py-0.5">
                                  <span>• {m.display_name}</span>
                                  <span className="text-[8px] text-stone-400 uppercase font-bold font-mono">User: {m.username}</span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {adminTab === 'standings' && (
            <div className="glass-card p-6 border border-cream-300 bg-white text-left space-y-4 shadow-sm">
              <div className="border-b border-cream-200 pb-3">
                <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-gold-500" /> Tabla General de Competencia
                </h3>
              </div>
              <div className="space-y-3">
                {standings.map((standing, index) => {
                  const initials = standing.display_name ? standing.display_name.substring(0, 2).toUpperCase() : 'US';
                  return (
                    <div key={standing.profile_id} className="p-3.5 flex items-center justify-between border border-cream-300 rounded-xl bg-white shadow-2xs">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-450">{index + 1}</span>
                        <span className="w-6 h-6 rounded-full bg-cream-200 flex items-center justify-center text-[9px] font-black text-stone-650">{initials}</span>
                        <span className="text-xs font-bold text-stone-850 uppercase">{standing.display_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-stone-900">{standing.total_points} pts</span>
                        <p className="text-[7.5px] text-stone-400 font-bold uppercase tracking-wider">{standing.exact_guesses} exactos | {standing.outcome_guesses} ganados</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- REGULAR USER HOME VIEW ---
  const currentStanding = standings.find(s => s.profile_id === currentProfileId);
  const currentChampionPred = activeProfile?.champion_prediction;
  const deadline = new Date('2026-06-10T16:00:00-03:00').getTime();
  const isChampionOpen = new Date().getTime() < deadline;

  return (
    <div className="space-y-8 text-stone-900 max-w-5xl mx-auto pt-2 relative">
      {/* Onboarding Tour Overlay Backdrop & Highlight Card */}
      <AnimatePresence>
        {showTour && (
          <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-cream-300 p-6 rounded-3xl max-w-md w-full shadow-2xl text-left space-y-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold-500/10 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
              
              <div className="flex justify-between items-center">
                <span className="text-[9px] bg-gold-500/10 text-gold-650 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Tutorial Paso {tourStep + 1} de 5
                </span>
                <button 
                  onClick={handleCompleteTour}
                  className="text-stone-400 hover:text-stone-700 cursor-pointer transition-colors p-1"
                  title="Omitir tutorial"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps details */}
              {tourStep === 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-stone-900 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-gold-500 shrink-0" /> ¡Puntapié Inicial!
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Te damos la bienvenida al **Prode Mundial USA-MEX 26′**. En este tutorial te enseñamos las herramientas clave de la app para que no te pierdas nada.
                  </p>
                </div>
              )}

              {tourStep === 1 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-stone-900 uppercase flex items-center gap-1.5">
                    <Trophy className="w-5 h-5 text-gold-500 shrink-0" /> Elegí tu Campeón (+10 pts)
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Antes del comienzo del mundial, tenés que votar cuál selección creés que saldrá campeona. Si acertás, ¡recibís **10 puntos extra** que pueden definir la tabla!
                  </p>
                </div>
              )}

              {tourStep === 2 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-stone-900 uppercase flex items-center gap-1.5">
                    <Users className="w-5 h-5 text-gold-500 shrink-0" /> Tabla y Grupos de Prode
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    En la pantalla principal tenés la tabla de posiciones en tiempo real. Podés unirte a grupos mediante códigos de invitación y filtrar el ranking para competir directamente con amigos y familia.
                  </p>
                </div>
              )}

              {tourStep === 3 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-stone-900 uppercase flex items-center gap-1.5">
                    <Calendar className="w-5 h-5 text-gold-500 shrink-0" /> Fixture y Predicciones
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    En la sección de **fixture** (haciendo clic en Ver Fixture o el botón de abajo) podés cargar tus pronósticos goles para cada partido. Recordá que se bloquean **24 hs antes** de cada pitido inicial.
                  </p>
                </div>
              )}

              {tourStep === 4 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-black text-stone-900 uppercase flex items-center gap-1.5">
                    <Settings className="w-5 h-5 text-gold-500 shrink-0" /> Recordatorios Móviles
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Ingresá a tu perfil para activar las **notificaciones móviles de 24 hs**. Te enviaremos alertas si tenés pronósticos pendientes para que nunca te quedes sin jugar.
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-cream-200">
                <button
                  onClick={handleCompleteTour}
                  className="text-stone-400 hover:text-stone-700 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Omitir Tutorial
                </button>
                <div className="flex gap-2">
                  {tourStep > 0 && (
                    <button
                      onClick={handlePrevStep}
                      className="px-3.5 py-1.5 border border-cream-300 text-stone-700 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                    >
                      Atrás
                    </button>
                  )}
                  <button
                    onClick={handleNextStep}
                    className="px-4 py-1.5 bg-stone-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-stone-850 cursor-pointer flex items-center gap-1"
                  >
                    <span>{tourStep === 4 ? 'Listo' : 'Siguiente'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editorial Title */}
      <div className="text-center pb-2 border-b border-cream-300">
        <h1 className="text-[10px] font-black tracking-widest text-stone-450 uppercase">
          prode mundial usa-mex 26′
        </h1>
      </div>

      {/* Countdown Strip */}
      <Countdown />

      {/* Champion Prediction Banner */}
      <div id="champion-banner" className="glass-card p-5 border border-cream-300 shadow-sm bg-white flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
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

      {/* Restart Tour button */}
      <div className="flex justify-end pr-2">
        <button
          onClick={() => {
            setTourStep(0);
            setShowTour(true);
          }}
          className="flex items-center gap-1 text-[8.5px] text-stone-450 uppercase font-black tracking-widest hover:text-stone-750 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Ver Tutorial</span>
        </button>
      </div>

      {/* Responsive Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Standings */}
        <div id="standings-column" className="lg:col-span-2 space-y-3">
          <div className="border-b border-cream-200 pb-1.5 flex justify-between items-center gap-2">
            <div className="flex items-center gap-2.5">
              <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black shrink-0">TABLA DE POSICIONES</h3>
              
              {/* Group filter dropdown */}
              {myGroups.length > 0 && (
                <div className="relative shrink-0">
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="appearance-none bg-cream-50/50 border border-cream-300 rounded-lg px-2 py-0.5 pr-6 text-[9.5px] font-bold text-stone-650 focus:outline-none focus:border-gold-500 cursor-pointer transition-all"
                  >
                    <option value="all">Ver General</option>
                    {myGroups.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
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
        <div id="fixture-column" className="lg:col-span-1 space-y-3">
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

                    <div className="mt-3 pt-2 border-t border-cream-200 flex justify-between items-center text-[8px] font-bold uppercase tracking-wider text-stone-450">
                      <span>Tu Pronóstico</span>
                      {userPred ? (
                        <span className="text-gold-650 font-black">
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
