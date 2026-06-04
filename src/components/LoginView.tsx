'use client';
 
import { useStore } from '@/lib/store';
import { LogIn, Lock, User as UserIcon, Trophy, Smartphone, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
 
export default function LoginView() {
  const { profiles, setCurrentProfile } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPwaGuide, setShowPwaGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsStandalone(
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    }
  }, []);
 
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

      {/* PWA Mobile Installation Guide */}
      {!isStandalone && (
        <div className="w-full max-w-md mt-6 bg-white border border-cream-300 rounded-3xl overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.03)] relative z-10 text-left transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-cream-200/20 to-transparent rounded-full -mr-12 -mt-12 pointer-events-none" />
        
          <button 
            type="button"
            onClick={() => setShowPwaGuide(!showPwaGuide)}
            className="w-full flex items-center justify-between p-5 focus:outline-none hover:bg-stone-50/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-stone-700 shrink-0" />
              <div className="text-left">
                <h4 className="text-[9.5px] font-extrabold text-stone-450 uppercase leading-none mb-1">Cómo instalar el Prode en tu celular</h4>
                <h3 className="text-xs font-black text-stone-900 uppercase">Instalar App Móvil</h3>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden xs:inline-block text-[8px] bg-stone-100 border border-stone-250 text-stone-550 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
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
                  <div className="grid grid-cols-1 gap-4 text-xs text-stone-600">
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
    </div>
  );
}
