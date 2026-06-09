'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Trophy, LogOut, ArrowRight, User, Award, Shield, CheckCircle, HelpCircle, Users, Bell, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { 
    currentProfileId, 
    setCurrentProfile, 
    profiles, 
    standings, 
    teams, 
    addProfile, 
    deleteProfile, 
    editProfile, 
    predictions, 
    matches,
    groups,
    groupMembers,
    createGroup,
    joinGroup,
    leaveGroup
  } = useStore();
  const router = useRouter();
  const [notificationStatus, setNotificationStatus] = useState<string>('default');

  // Admin form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [newUserGroupId, setNewUserGroupId] = useState<string>('');
  const [editUserGroupId, setEditUserGroupId] = useState<string>('');
  
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // Group form state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCode, setNewGroupCode] = useState('');
  const [inviteCodeToJoin, setInviteCodeToJoin] = useState('');
  const [groupError, setGroupError] = useState<string | null>(null);
  const [groupSuccess, setGroupSuccess] = useState<string | null>(null);

  // Password visibility visibility states
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Expanded lists in admin panel
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedGroupParticipants, setExpandedGroupParticipants] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

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
      await addProfile(cleanUsername, cleanUsername, newPassword, newUserGroupId || undefined);
      setIsCreatingNew(false);
      setNewDisplayName('');
      setNewUsername('');
      setNewPassword('');
      setNewUserGroupId('');
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
      await editProfile(editingProfileId!, cleanUsername, cleanUsername, editPassword || undefined, editUserGroupId || undefined);
      setEditingProfileId(null);
      setEditDisplayName('');
      setEditUsername('');
      setEditPassword('');
      setEditUserGroupId('');
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

  const handleJoinGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeToJoin.trim()) {
      showGroupError('Por favor ingresa un código.');
      return;
    }
    try {
      await joinGroup(inviteCodeToJoin);
      setInviteCodeToJoin('');
      showGroupSuccess('Te uniste al grupo con éxito.');
    } catch (err: any) {
      showGroupError(err.message || 'Error al unirse al grupo.');
    }
  };

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);
      
      if (permission === 'granted') {
        triggerTestNotification();
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const triggerTestNotification = () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messages = [
        '¿Querés salir campeón del Prode? 😉 ¡Cargá tus pronósticos antes de que cierre!',
        'Terminó el partido. ¿Le pegaste al resultado o diste lástima? 😜',
        '¡Ojo! Te quedan menos de 24hs para cargar tus resultados. No te duermas 🐑',
        '¡Listo! Los recordatorios del Prode se enviarán 24 hs antes de cada partido. 🏆'
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title: '🏆 Prode Mundial 2026',
          body: randomMsg
        }
      });
    }
  };

  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const activeStanding = standings.find(s => s.profile_id === currentProfileId);

  // Filter profiles based on selected group in admin panel
  const filteredProfiles = profiles.filter(p => {
    if (selectedGroupId === 'all') return true;
    return groupMembers.some(gm => gm.group_id === selectedGroupId && gm.profile_id === p.id);
  });

  // Get champion prediction details
  const championTeam = activeProfile?.champion_prediction 
    ? teams.find(t => t.id === activeProfile.champion_prediction)
    : null;

  const handleLogout = () => {
    setCurrentProfile('');
    router.push('/');
  };

  if (!activeProfile) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cream-300 border-t-gold-500 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Cargando perfil</span>
      </div>
    );
  }

  // Initials
  const initials = activeProfile.display_name ? activeProfile.display_name.substring(0, 2).toUpperCase() : 'US';

  return (
    <div className="space-y-6 text-stone-900 max-w-xl mx-auto pt-2 text-left pb-24">
      {/* Page Header */}
      <div className="border-b border-cream-300 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-[10px] tracking-widest font-black uppercase text-stone-450">
            MI CUENTA
          </h2>
          <h1 className="text-xl font-extrabold tracking-tight text-stone-900 uppercase mt-0.5">
            Perfil de Usuario
          </h1>
        </div>

        {/* Exit Icon / Salir */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-rose-250 bg-rose-50/50 hover:bg-rose-50 text-rose-650 hover:text-rose-700 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-xs"
          title="Cerrar sesión"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>

      {!activeProfile.is_admin && (
        <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cream-150 to-transparent rounded-full -mr-12 -mt-12 pointer-events-none" />
        
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-cream-200">
            <div className="w-16 h-16 rounded-full bg-stone-900 flex items-center justify-center text-xl font-black text-white shrink-0 shadow-md">
              {initials}
            </div>
            
            <div className="text-center sm:text-left space-y-1 mt-2 sm:mt-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-black text-stone-900 uppercase leading-none">{activeProfile.display_name}</h2>
                {activeProfile.is_admin && (
                  <span className="text-[7.5px] bg-stone-900 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-0.5">
                    <Shield className="w-2 h-2" /> Admin
                  </span>
                )}
              </div>
            </div>
          </div>

        {/* Selected Champion Info */}
        <div className="py-4 border-b border-cream-200">
          <h4 className="text-[9.5px] font-black tracking-widest text-stone-450 uppercase mb-2.5 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-gold-500 shrink-0" /> Selección Elegida (Campeón)
          </h4>
          {championTeam ? (
            <div className="flex items-center justify-between p-3 border border-cream-250 bg-cream-50/10 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-base">{championTeam.flag_emoji}</span>
                <span className="text-xs font-bold text-stone-850">{championTeam.name}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 border border-dashed border-cream-300 rounded-xl text-center">
              <p className="text-xs text-stone-400 italic">No has seleccionado tu campeón todavía.</p>
              <Link 
                href="/" 
                className="inline-flex items-center gap-1 text-[9.5px] text-gold-650 font-black uppercase tracking-wider hover:underline mt-2"
              >
                Elegir Campeón <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div id="notifications-card" className="py-4 border-b border-cream-200 text-left">
          <h4 className="text-[9.5px] font-black tracking-widest text-stone-450 uppercase mb-2.5 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-gold-500 shrink-0" /> Recordatorios y Alertas (24 hs)
          </h4>
          <div className="p-3.5 border border-cream-250 bg-cream-50/10 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="block text-xs font-bold text-stone-850">Alertas de Cierre</span>
                <span className="block text-[9px] text-stone-500 mt-0.5 leading-tight">
                  Recibí recordatorios en tu celular si tenés pronósticos de fase de grupos pendientes de carga.
                </span>
              </div>
              
              {notificationStatus === 'granted' ? (
                <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-650 px-2.5 py-1 rounded font-black uppercase tracking-wider">
                  Activadas
                </span>
              ) : (
                <button
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-xs"
                >
                  Activar
                </button>
              )}
            </div>

            {notificationStatus === 'denied' && (
              <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[9.5px] text-amber-800 font-medium leading-normal flex items-start gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Notificaciones bloqueadas por el navegador.</strong> Para activarlas, debés hacer clic en los ajustes de tu sitio en la barra de direcciones del navegador (haciendo clic en el ícono a la izquierda de la URL) y cambiar el permiso a &quot;Permitir&quot;.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Scoring & Stats */}
        <div className="pt-4">
          <h4 className="text-[9.5px] font-black tracking-widest text-stone-450 uppercase mb-3 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-gold-500 shrink-0" /> Tu Puntaje del Prode
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-cream-50/20 border border-cream-250 rounded-2xl text-center">
              <span className="block text-2xl font-black text-stone-900 leading-none">
                {activeStanding?.total_points || 0}
              </span>
              <span className="block text-[8px] text-stone-450 uppercase tracking-widest font-black mt-1.5">Puntos</span>
            </div>

            <div className="p-3 bg-cream-50/20 border border-cream-250 rounded-2xl text-center">
              <span className="block text-xl font-bold text-stone-800 leading-none">
                {activeStanding?.exact_guesses || 0}
              </span>
              <span className="block text-[8px] text-stone-450 uppercase tracking-widest font-bold mt-1.5">Aciertos Exactos</span>
            </div>

            <div className="p-3 bg-cream-50/20 border border-cream-250 rounded-2xl text-center">
              <span className="block text-xl font-bold text-stone-800 leading-none">
                {activeStanding?.outcome_guesses || 0}
              </span>
              <span className="block text-[8px] text-stone-450 uppercase tracking-widest font-bold mt-1.5">Ganadores Acertados</span>
            </div>
          </div>
        </div>
      </div>
  )}

      {/* Groups Card (Temporarily Hidden) */}
      {false && (
        <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white text-left space-y-6">
          <div className="border-b border-cream-200 pb-3 flex justify-between items-center">
            <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gold-500" /> Mis Grupos de Prode
            </h3>
          </div>

          {groupError && (
            <p className="text-[9px] font-bold text-rose-650 bg-rose-50 border border-rose-200 p-2 rounded-lg text-center leading-tight">
              {groupError}
            </p>
          )}
          {groupSuccess && (
            <p className="text-[9px] font-bold text-emerald-650 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center leading-tight">
              {groupSuccess}
            </p>
          )}

          {/* Join Group Form */}
          <form onSubmit={handleJoinGroupSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="CÓDIGO DE GRUPO (ej: LEVY26)"
              value={inviteCodeToJoin}
              onChange={e => setInviteCodeToJoin(e.target.value)}
              className="flex-1 bg-cream-50/30 border border-cream-300 rounded-xl px-3.5 py-2 text-xs text-stone-850 placeholder-stone-400 focus:outline-none focus:border-gold-500 transition-all uppercase font-bold"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[9px] uppercase tracking-widest rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
            >
              Unirse
            </button>
          </form>

          {/* List of My Groups */}
          {(() => {
            const myGroupMemberships = groupMembers.filter(gm => gm.profile_id === currentProfileId);
            if (myGroupMemberships.length === 0) {
              return (
                <div className="p-4 border border-dashed border-cream-300 rounded-2xl text-center">
                  <p className="text-xs text-stone-400 italic">No perteneces a ningún grupo de Prode.</p>
                  <p className="text-[10px] text-stone-400 mt-1">Ingresá un código arriba para unirte a un grupo familiar o de amigos.</p>
                </div>
              );
            }

            return (
              <div className="divide-y divide-cream-150 border border-cream-200 rounded-2xl overflow-hidden bg-cream-50/5">
                {myGroupMemberships.map(membership => {
                  const group = groups.find(g => g.id === membership.group_id);
                  if (!group) return null;
                  const memberCount = groupMembers.filter(gm => gm.group_id === group.id).length;

                  return (
                    <div key={group.id} className="flex justify-between items-center p-3.5 hover:bg-cream-50/30 transition-colors">
                      <div>
                        <h4 className="text-xs font-bold text-stone-850 uppercase">{group.name}</h4>
                        <div className="flex gap-2 mt-1 text-[8.5px] text-stone-440 font-semibold uppercase tracking-wider">
                          <span>Código: <strong className="text-gold-650 font-bold select-all">{group.invite_code}</strong></span>
                          <span>•</span>
                          <span>{memberCount} {memberCount === 1 ? 'miembro' : 'miembros'}</span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (confirm(`¿Estás seguro de salir del grupo "${group.name}"?`)) {
                            await leaveGroup(group.id);
                            showGroupSuccess(`Saliste del grupo ${group.name}`);
                          }
                        }}
                        className="px-2.5 py-1 border border-rose-250 bg-rose-50/50 hover:bg-rose-50 text-rose-650 hover:text-rose-700 font-bold text-[8px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                      >
                        Salir
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Admin Panel Card */}
      {activeProfile.is_admin && (
        <div className="space-y-6">
          {/* User Admin */}
          <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white text-left space-y-6">
            <div className="border-b border-cream-200 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gold-500" /> Administración de Usuarios
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNew(!isCreatingNew);
                  setEditingProfileId(null);
                  setNewDisplayName('');
                  setNewUsername('');
                  setNewPassword('');
                  setNewUserGroupId(selectedGroupId !== 'all' ? selectedGroupId : '');
                  setAdminError(null);
                }}
                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Nuevo Usuario
              </button>
            </div>

            {/* Filter by Group Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-cream-50/20 border border-cream-250 rounded-xl mb-2">
              <div className="text-left">
                <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450">Filtrar por Grupo</label>
                <span className="text-[10px] text-stone-500 font-medium">Mostrando usuarios asociados a este grupo</span>
              </div>
              <select
                value={selectedGroupId}
                onChange={e => {
                  setSelectedGroupId(e.target.value);
                  setAdminError(null);
                }}
                className="bg-white border border-cream-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-stone-750 focus:outline-none focus:border-gold-500 min-w-[160px]"
              >
                <option value="all">Todos los usuarios</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {/* Error and Success Feedback */}
            {adminError && (
              <p className="text-[9px] font-bold text-rose-650 bg-rose-50 border border-rose-200 p-2 rounded-lg text-center leading-tight">
                {adminError}
              </p>
            )}
            {adminSuccess && (
              <p className="text-[9px] font-bold text-emerald-650 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-center leading-tight">
                {adminSuccess}
              </p>
            )}

            {/* Create User Form */}
            {isCreatingNew && (
              <form onSubmit={handleCreateUser} className="p-4 border border-cream-250 bg-cream-50/15 rounded-2xl space-y-3">
                <h4 className="text-[9.5px] font-black tracking-widest text-stone-450 uppercase mb-2">Crear Nuevo Participante</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Usuario</label>
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
                        title={showNewPassword ? "Ocultar" : "Mostrar"}
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Grupo</label>
                    <select
                      value={newUserGroupId}
                      onChange={e => setNewUserGroupId(e.target.value)}
                      className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                    >
                      <option value="">Ninguno / Sin grupo</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                      ))}
                    </select>
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
                  <button
                    type="submit"
                    className="px-3 py-1 bg-stone-900 hover:bg-stone-850 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                  >
                    Crear
                  </button>
                </div>
              </form>
            )}

            {/* Edit User Form */}
            {editingProfileId && (
              <form onSubmit={handleEditUser} className="p-4 border border-gold-500/30 bg-gold-500/5 rounded-2xl space-y-3">
                <h4 className="text-[9.5px] font-black tracking-widest text-gold-650 uppercase mb-2">Editar Participante</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Usuario</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value)}
                      className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
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
                        title={showEditPassword ? "Ocultar" : "Mostrar"}
                      >
                        {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Grupo</label>
                    <select
                      value={editUserGroupId}
                      onChange={e => setEditUserGroupId(e.target.value)}
                      className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500 font-semibold"
                    >
                      <option value="">Ninguno / Sin grupo</option>
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                      ))}
                    </select>
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
                  <button
                    type="submit"
                    className="px-3 py-1 bg-gold-600 hover:bg-gold-700 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            )}

            {/* User List */}
            <div className="divide-y divide-cream-150 border border-cream-200 rounded-2xl overflow-hidden bg-cream-50/5">
              {filteredProfiles.map(p => {
                const userGroups = groups.filter(g => groupMembers.some(gm => gm.group_id === g.id && gm.profile_id === p.id));
                return (
                  <div key={p.id} className="flex justify-between items-center p-3.5 hover:bg-cream-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-xs font-black text-white uppercase shrink-0">
                        {p.display_name.substring(0, 2).toUpperCase()}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-stone-850">{p.display_name}</span>
                          {p.is_admin && (
                            <span className="text-[6.5px] bg-stone-900 text-white px-1 py-0.2 rounded font-black uppercase tracking-wider">Admin</span>
                          )}
                          {p.id === currentProfileId && (
                            <span className="text-[6.5px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-650 px-1 py-0.2 rounded font-black uppercase tracking-wider">Tú</span>
                          )}
                          {/* Group Badges */}
                          {userGroups.map(ug => (
                            <span key={ug.id} className="text-[6.5px] bg-gold-500/10 border border-gold-500/25 text-gold-700 px-1 py-0.2 rounded font-black uppercase tracking-wider">
                              {ug.name}
                            </span>
                          ))}
                          {userGroups.length === 0 && (
                            <span className="text-[6.5px] bg-stone-150 border border-stone-250 text-stone-500 px-1 py-0.2 rounded font-bold uppercase tracking-wider">
                              Sin grupo
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-x-2 gap-y-1 mt-1 text-[8.5px] text-stone-450 font-semibold uppercase">
                          <span>User: <strong className="text-stone-700 font-bold">{p.username || p.display_name.toLowerCase()}</strong></span>
                          <span className="hidden sm:inline text-stone-300">|</span>
                          <span className="flex items-center gap-1">
                            Pass: <strong className="text-stone-700 font-bold font-mono">{showPasswords[p.id] ? p.password : '••••••••'}</strong>
                            <button
                              type="button"
                              onClick={() => {
                                setShowPasswords(prev => ({
                                  ...prev,
                                  [p.id]: !prev[p.id]
                                }));
                              }}
                              className="p-0.5 hover:bg-cream-150 rounded transition-colors text-stone-400 hover:text-stone-650 cursor-pointer"
                              title={showPasswords[p.id] ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                          setEditDisplayName(p.display_name);
                          setEditUsername(p.username || p.display_name.toLowerCase());
                          setEditPassword(p.password || '');
                          setShowEditPassword(false);
                          setAdminError(null);
                          const currentMemberRecord = groupMembers.find(gm => gm.profile_id === p.id);
                          setEditUserGroupId(currentMemberRecord ? currentMemberRecord.group_id : '');
                        }}
                        className="p-1.5 border border-cream-300 bg-white hover:bg-cream-100/30 text-stone-750 font-bold text-[8px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                      >
                        Editar
                      </button>
                      {p.id !== currentProfileId && (
                        <button
                          onClick={async () => {
                            if (confirm(`¿Estás seguro de eliminar a ${p.display_name}?`)) {
                              await deleteProfile(p.id);
                              showSuccess('Usuario eliminado correctamente.');
                            }
                          }}
                          className="p-1.5 border border-rose-250 bg-rose-50/50 hover:bg-rose-50 text-rose-650 hover:text-rose-700 font-bold text-[8px] uppercase tracking-widest rounded-lg transition-all cursor-pointer animate-none"
                          title="Eliminar usuario"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Admin */}
          <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white text-left space-y-6">
            <div className="border-b border-cream-200 pb-3 flex justify-between items-center">
              <h3 className="text-xs font-black text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-gold-500" /> Administración de Grupos
              </h3>
              <button
                onClick={() => {
                  setIsCreatingGroup(!isCreatingGroup);
                  setNewGroupName('');
                  setNewGroupCode('');
                  setGroupError(null);
                }}
                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Nuevo Grupo
              </button>
            </div>

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
                  <button
                    type="submit"
                    className="px-3 py-1 bg-stone-900 hover:bg-stone-850 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                  >
                    Crear Grupo
                  </button>
                </div>
              </form>
            )}

            {/* Groups List */}
            <div className="divide-y divide-cream-150 border border-cream-200 rounded-2xl overflow-hidden bg-cream-50/5">
              {groups.length === 0 ? (
                <p className="p-4 text-xs text-stone-400 italic text-center">No hay grupos creados.</p>
              ) : (
                groups.map(g => {
                  const isGroupExpanded = !!expandedGroups[g.id];
                  const members = groupMembers
                    .filter(gm => gm.group_id === g.id)
                    .map(gm => {
                      const profile = profiles.find(p => p.id === gm.profile_id);
                      return profile;
                    })
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
                          {isGroupExpanded ? 'Ocultar Detalle' : 'Ver Detalle'}
                        </button>
                      </div>
                      
                      {/* Members sublist (Simple inline list) */}
                      {!isGroupExpanded && (
                        <div className="mt-2 text-[9px] text-stone-500">
                          <strong className="text-[8.5px] text-stone-450 uppercase font-bold tracking-wider">Miembros: </strong>
                          {members.map(m => m.display_name).join(', ')}
                        </div>
                      )}

                      {/* Expanded Group Details */}
                      {isGroupExpanded && (
                        <div className="mt-4 pt-4 border-t border-cream-200 space-y-4">
                          <h5 className="text-[8.5px] font-black uppercase tracking-widest text-stone-450">Participantes del Grupo</h5>
                          
                          <div className="space-y-3">
                            {members.length === 0 ? (
                              <p className="text-[10px] text-stone-450 italic">El grupo no tiene miembros.</p>
                            ) : (
                              members.map(m => {
                                const favoriteTeam = m.champion_prediction ? teams.find(t => t.id === m.champion_prediction) : null;
                                const userPreds = predictions.filter(p => p.participant_id === m.id);
                                const isMemberExpanded = !!expandedGroupParticipants[`${g.id}-${m.id}`];

                                return (
                                  <div key={m.id} className="p-3 border border-cream-250 bg-white rounded-2xl space-y-2.5">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <h6 className="text-xs font-bold text-stone-850 uppercase flex items-center gap-1.5">
                                          <span className="w-5 h-5 rounded-full bg-cream-150 flex items-center justify-center text-[7.5px] font-extrabold text-stone-600 shrink-0">
                                            {m.display_name.substring(0,2).toUpperCase()}
                                          </span>
                                          {m.display_name}
                                        </h6>
                                        <div className="flex items-center gap-2 mt-1 text-[8.5px] font-bold text-stone-450 uppercase tracking-wider">
                                          <span>Favorito: <strong className="text-gold-650 font-black">{favoriteTeam ? `${favoriteTeam.flag_emoji} ${favoriteTeam.name}` : 'Ninguno'}</strong></span>
                                          <span>•</span>
                                          <span>Pronósticos: <strong className="text-stone-750 font-black">{userPreds.length}</strong></span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => setExpandedGroupParticipants(prev => ({ ...prev, [`${g.id}-${m.id}`]: !prev[`${g.id}-${m.id}`] }))}
                                        className="px-2 py-0.5 border border-cream-300 hover:bg-cream-50 text-stone-600 font-bold text-[8px] uppercase tracking-wider rounded-md transition-all cursor-pointer"
                                      >
                                        {isMemberExpanded ? 'Ocultar Pronósticos' : 'Ver Pronósticos'}
                                      </button>
                                    </div>

                                    {/* Member predictions grid */}
                                    {isMemberExpanded && (
                                      <div className="pt-2 border-t border-cream-150">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-56 overflow-y-auto pr-1">
                                          {matches.map(match => {
                                            const p = userPreds.find(pred => pred.match_id === match.id);
                                            const homeT = teams.find(t => t.id === match.home_team_id);
                                            const awayT = teams.find(t => t.id === match.away_team_id);
                                            return (
                                              <div key={match.id} className="flex justify-between items-center text-[9px] p-1.5 bg-cream-50/50 rounded-lg border border-cream-200">
                                                <span className="truncate max-w-[80px] font-bold text-stone-500">
                                                  {homeT?.flag_emoji} {homeT?.id} vs {awayT?.id} {awayT?.flag_emoji}
                                                </span>
                                                <span className="font-mono font-black text-stone-900 bg-cream-200/60 px-1 py-0.2 rounded shrink-0">
                                                  {p ? `${p.home_score}-${p.away_score}` : '-'}
                                                </span>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
