'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Trophy, LogOut, ArrowRight, User, Award, Shield, CheckCircle, HelpCircle, Users, Bell, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ProfilePage() {
  const { currentProfileId, setCurrentProfile, profiles, standings, teams, addProfile, deleteProfile, editProfile } = useStore();
  const router = useRouter();
  const [notificationStatus, setNotificationStatus] = useState<string>('default');

  // Admin form state
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

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
    if (!newDisplayName.trim() || !newUsername.trim() || !newPassword.trim()) {
      showError('Por favor completa todos los campos.');
      return;
    }
    try {
      await addProfile(newDisplayName, newUsername, newPassword);
      setIsCreatingNew(false);
      setNewDisplayName('');
      setNewUsername('');
      setNewPassword('');
      showSuccess('Usuario creado con éxito.');
    } catch (err: any) {
      showError(err.message || 'Error al crear usuario.');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDisplayName.trim() || !editUsername.trim()) {
      showError('Por favor completa los campos requeridos.');
      return;
    }
    try {
      await editProfile(editingProfileId!, editDisplayName, editUsername, editPassword || undefined);
      setEditingProfileId(null);
      setEditDisplayName('');
      setEditUsername('');
      setEditPassword('');
      showSuccess('Usuario modificado con éxito.');
    } catch (err: any) {
      showError(err.message || 'Error al modificar usuario.');
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
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title: '🏆 Prode Mundial 2026',
          body: '¡Listo! Los recordatorios del Prode se enviarán 24 hs antes de cada partido.'
        }
      });
    }
  };

  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const activeStanding = standings.find(s => s.profile_id === currentProfileId);

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

      {/* Main Profile Info Card */}
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
            <p className="text-[10px] text-stone-450 uppercase tracking-widest font-bold">
              ID: {activeProfile.id}
            </p>
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
              <span className="text-[8px] bg-gold-500/10 border border-gold-500/25 text-gold-650 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                Predicción Activa
              </span>
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
        <div className="py-4 border-b border-cream-200 text-left">
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

            {notificationStatus === 'granted' && (
              <div className="pt-2 border-t border-cream-200 flex justify-between items-center">
                <span className="text-[9px] text-stone-450 uppercase tracking-wider font-bold">Verificar funcionalidad:</span>
                <button
                  onClick={triggerTestNotification}
                  className="px-2.5 py-1 border border-cream-300 bg-white hover:bg-cream-100/30 text-stone-750 font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                >
                  Probar Notificación
                </button>
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

      {/* Admin Panel Card */}
      {activeProfile.is_admin && (
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
                setAdminError(null);
              }}
              className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Nuevo Usuario
            </button>
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
                  <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="ej: Juan P."
                    value={newDisplayName}
                    onChange={e => setNewDisplayName(e.target.value)}
                    className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
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
                  <input
                    type="text"
                    placeholder="ej: 1234"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
                  />
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
                  className="px-3 py-1 bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-[8.5px] uppercase tracking-widest rounded-lg transition-all"
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
                  <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={e => setEditDisplayName(e.target.value)}
                    className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
                  />
                </div>
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
                  <label className="block text-[8px] font-black uppercase tracking-wider text-stone-450 mb-1">Contraseña (opcional)</label>
                  <input
                    type="text"
                    placeholder="Nueva contraseña"
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    className="w-full bg-white border border-cream-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-gold-500"
                  />
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
            {profiles.map(p => (
              <div key={p.id} className="flex justify-between items-center p-3.5 hover:bg-cream-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-xs font-black text-white uppercase shrink-0">
                    {p.display_name.substring(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-850">{p.display_name}</span>
                      {p.is_admin && (
                        <span className="text-[6.5px] bg-stone-900 text-white px-1 py-0.2 rounded font-black uppercase tracking-wider">Admin</span>
                      )}
                      {p.id === currentProfileId && (
                        <span className="text-[6.5px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-650 px-1 py-0.2 rounded font-black uppercase tracking-wider">Tú</span>
                      )}
                    </div>
                    <span className="block text-[8.5px] text-stone-450 font-semibold uppercase leading-none mt-1">
                      User: <strong className="text-stone-700 font-bold">{p.username || p.display_name.toLowerCase()}</strong> | Pass: <strong className="text-stone-700 font-bold">{p.password}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingProfileId(p.id);
                      setIsCreatingNew(false);
                      setEditDisplayName(p.display_name);
                      setEditUsername(p.username || p.display_name.toLowerCase());
                      setEditPassword('');
                      setAdminError(null);
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
