'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Trophy, LogOut, ArrowRight, User, Award, Shield, CheckCircle, HelpCircle, Users } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { currentProfileId, setCurrentProfile, profiles, standings, teams } = useStore();
  const router = useRouter();

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

  const otherProfiles = profiles.filter(p => p.id !== currentProfileId);

  return (
    <div className="space-y-6 text-stone-900 max-w-xl mx-auto pt-2 text-left">
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

      {/* Switch Participant Section */}
      {otherProfiles.length > 0 && (
        <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white text-left">
          <h4 className="text-[9.5px] font-black tracking-widest text-stone-450 uppercase mb-3 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-stone-600 shrink-0" /> Cambiar de Participante
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {otherProfiles.map((prof) => {
              const initials = prof.display_name ? prof.display_name.substring(0, 2).toUpperCase() : 'US';
              return (
                <button
                  key={prof.id}
                  onClick={() => setCurrentProfile(prof.id)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-cream-300 hover:border-gold-500/50 bg-cream-50/20 hover:bg-white text-left transition-all text-xs font-bold text-stone-750 cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center text-[9px] font-bold text-stone-600 uppercase shrink-0">
                    {initials}
                  </span>
                  <span className="truncate">{prof.display_name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
