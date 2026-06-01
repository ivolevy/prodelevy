'use client';

import { useStore } from '@/lib/store';
import { LogIn, Trophy, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginView() {
  const { profiles, setCurrentProfile } = useStore();

  const ivanProfile = profiles.find(p => p.id === 'user-ivan');
  const otherProfiles = profiles.filter(p => p.id !== 'user-ivan');

  const handleLogin = (id: string) => {
    setCurrentProfile(id);
  };

  return (
    <div className="min-h-screen bg-sports-bg flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Editorial Title */}
      <div className="text-center mb-8 max-w-sm">
        <h2 className="text-[10px] tracking-widest font-black uppercase text-stone-400">
          prode mundial usa-mex 26′
        </h2>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900 mt-2 uppercase">
          Iniciar Sesión
        </h1>
        <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
          Ingresá a tu cuenta para cargar pronósticos y seguir la tabla de posiciones en tiempo real.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white border border-cream-300 rounded-3xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.03)] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-500/5 to-transparent rounded-full -mr-12 -mt-12 pointer-events-none" />
        
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-650">
            <Trophy className="w-6 h-6" />
          </div>
        </div>

        <h3 className="text-sm font-black text-stone-850 uppercase tracking-widest mb-6">
          Selecciona tu Perfil
        </h3>

        <div className="space-y-4">
          {/* Main User: Iván */}
          {ivanProfile && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleLogin(ivanProfile.id)}
              className="w-full flex items-center justify-between p-4 bg-stone-900 text-white rounded-2xl hover:bg-stone-800 transition-all shadow-md group"
            >
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xs font-black text-white uppercase">
                  {ivanProfile.display_name.substring(0, 2).toUpperCase()}
                </span>
                <div className="text-left">
                  <span className="block text-xs font-black uppercase tracking-wider">Entrar como {ivanProfile.display_name}</span>
                  <span className="block text-[9px] text-stone-400 font-semibold uppercase leading-none mt-0.5">Administrador</span>
                </div>
              </div>
              <LogIn className="w-4 h-4 text-white/70 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          )}

          {/* Secondary Users (e.g. Catalina, others) */}
          {otherProfiles.length > 0 && (
            <div className="pt-2">
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-cream-200"></div>
                <span className="flex-shrink mx-4 text-[9px] text-stone-400 font-bold uppercase tracking-wider">Otros Participantes</span>
                <div className="flex-grow border-t border-cream-200"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {otherProfiles.map((prof) => (
                  <button
                    key={prof.id}
                    onClick={() => handleLogin(prof.id)}
                    className="flex items-center gap-2.5 p-3 rounded-xl border border-cream-300 hover:border-gold-500/50 bg-cream-50/20 hover:bg-white text-left transition-all text-xs font-bold text-stone-750"
                  >
                    <span className="w-7 h-7 rounded-full bg-cream-200 flex items-center justify-center text-[9px] font-bold text-stone-600 uppercase shrink-0">
                      {prof.display_name.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{prof.display_name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
