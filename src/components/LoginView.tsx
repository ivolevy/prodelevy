'use client';
 
import { useStore } from '@/lib/store';
import { LogIn, Lock, User as UserIcon, Trophy } from 'lucide-react';
import { useState } from 'react';
 
export default function LoginView() {
  const { profiles, setCurrentProfile } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
 
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
 
    const u = username.trim().toLowerCase();
    const p = password.trim();
 
    if (!u || !p) {
      setError('Por favor, ingresá usuario y contraseña.');
      return;
    }
 
    // Check credentials
    const user = profiles.find(prof => prof.username?.toLowerCase() === u || prof.display_name?.toLowerCase() === u);
    if (user && user.password === p) {
      setCurrentProfile(user.id);
    } else {
      setError('Usuario o contraseña incorrectos.');
    }
  };
 
  return (
    <div className="min-h-screen bg-sports-bg flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Editorial Title */}
      <div className="text-center mb-8 max-w-sm relative z-10">
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
 
      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-cream-300 rounded-3xl p-8 shadow-[0_12px_40px_rgba(0,0,0,0.03)] relative overflow-hidden z-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gold-500/5 to-transparent rounded-full -mr-12 -mt-12 pointer-events-none" />
        
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-650">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
 
        {/* Form */}
        <form onSubmit={handleFormLogin} className="space-y-4 text-left">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-450 mb-1.5">
              Usuario
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={14}
                className="w-full bg-cream-50/30 border border-cream-300 rounded-xl px-4 py-2.5 pl-10 text-xs text-stone-850 placeholder-stone-400 focus:outline-none focus:border-gold-500 transition-all"
              />
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
          </div>
 
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-stone-450 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={14}
                className="w-full bg-cream-50/30 border border-cream-300 rounded-xl px-4 py-2.5 pl-10 text-xs text-stone-850 placeholder-stone-400 focus:outline-none focus:border-gold-500 transition-all"
              />
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            </div>
          </div>
 
          {error && (
            <p className="text-[10px] font-bold text-rose-650 bg-rose-50 border border-rose-200/50 p-2.5 rounded-lg text-center leading-tight animate-in fade-in duration-200">
              {error}
            </p>
          )}
 
          <button
            type="submit"
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <LogIn className="w-3.5 h-3.5" />
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}
