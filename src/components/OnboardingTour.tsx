'use client';

import { useEffect, useState, useRef } from 'react';
import { useStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Users, Calendar, Settings, ArrowRight, X, FileText } from 'lucide-react';

interface TourStepConfig {
  step: number;
  path: string;
  elementId: string;
  title: string;
  description: string;
  icon: any;
}

const TOUR_STEPS: TourStepConfig[] = [
  {
    step: 0,
    path: '/',
    elementId: 'tour-step-0',
    title: '¡Puntapié Inicial!',
    description: 'Te damos la bienvenida al Prode Mundial USA-MEX 26′. Este es el contador de cuenta regresiva para el inicio del torneo. ¡El mundial empieza pronto!',
    icon: Sparkles
  },
  {
    step: 1,
    path: '/',
    elementId: 'champion-banner',
    title: 'Elegí tu Campeón (+10 pts)',
    description: 'Antes del comienzo del mundial, tenés que registrar cuál selección creés que ganará la Copa del Mundo. Si acertás, ¡recibís 10 puntos extra!',
    icon: Trophy
  },
  {
    step: 2,
    path: '/',
    elementId: 'standings-column',
    title: 'Tabla de Posiciones',
    description: 'Aquí podés ver el ranking en tiempo real de todos los participantes del prode ordenados por puntaje. ¡Competí y seguí el minuto a minuto!',
    icon: Users
  },
  {
    step: 3,
    path: '/matches',
    elementId: 'matches-tabs',
    title: 'Secciones del Fixture',
    description: 'En el fixture podés alternar entre el calendario de Partidos, la Tabla de grupos oficial, el Cuadro eliminatorio y las Posiciones del Prode.',
    icon: FileText
  },
  {
    step: 4,
    path: '/matches',
    elementId: 'matches-list',
    title: 'Carga de Pronósticos',
    description: 'Hacé clic en "Pronosticar" en cualquier partido para cargar los goles de cada selección. Podés guardar tus pronósticos hasta 24 hs antes de cada partido.',
    icon: Calendar
  },
  {
    step: 5,
    path: '/rules',
    elementId: 'rules-container',
    title: 'Reglamento y Puntos',
    description: 'Revisá las reglas oficiales. Acertar el marcador exacto te otorga 3 puntos. Si acertás el ganador o empate con otro marcador, recibís 1 punto.',
    icon: Trophy
  },
  {
    step: 6,
    path: '/profile',
    elementId: 'notifications-card',
    title: 'Alertas Móviles',
    description: 'En tu perfil podés activar notificaciones para recibir recordatorios si tenés pronósticos pendientes 24 hs antes del partido. ¡Listo para jugar!',
    icon: Settings
  }
];

export default function OnboardingTour() {
  const pathname = usePathname();
  const router = useRouter();
  const { 
    showTour, 
    tourStep, 
    setShowTour, 
    setTourStep, 
    profiles, 
    currentProfileId 
  } = useStore();

  const [highlightRect, setHighlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const activeProfile = profiles.find(p => p.id === currentProfileId);
  const currentStepConfig = TOUR_STEPS.find(s => s.step === tourStep);

  // 1. Auto-trigger tour on login for regular users who haven't completed it
  useEffect(() => {
    if (typeof window !== 'undefined' && currentProfileId && activeProfile && !activeProfile.is_admin) {
      const completed = localStorage.getItem('prode_onboarding_completed');
      if (!completed && !showTour) {
        setTourStep(0);
        setShowTour(true);
      }
    }
  }, [currentProfileId, activeProfile, showTour, setShowTour, setTourStep]);

  // 2. Direct user to the correct path as they step through the tour
  useEffect(() => {
    if (showTour && currentStepConfig && pathname !== currentStepConfig.path) {
      // Clear highlight while navigating
      setHighlightRect(null);
      router.push(currentStepConfig.path);
    }
  }, [showTour, tourStep, currentStepConfig, pathname, router]);

  // 3. Track position and dimensions of the highlighted element
  useEffect(() => {
    if (!showTour || !currentStepConfig || pathname !== currentStepConfig.path) {
      setHighlightRect(null);
      return;
    }

    const updatePosition = () => {
      const el = document.getElementById(currentStepConfig.elementId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setHighlightRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        });
      } else {
        setHighlightRect(null);
      }
    };

    // Run initially after layout settles
    const timer = setTimeout(updatePosition, 100);

    // Watch for scroll/resize
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    // Watch for element size changes using ResizeObserver
    const el = document.getElementById(currentStepConfig.elementId);
    if (el && typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(() => {
        updatePosition();
      });
      resizeObserverRef.current.observe(el);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [showTour, tourStep, currentStepConfig, pathname]);

  // Disable page scrolling when tour is active
  useEffect(() => {
    if (showTour) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [showTour]);

  if (!showTour || !currentStepConfig) return null;

  const handleNext = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  const handleComplete = () => {
    setShowTour(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('prode_onboarding_completed', 'true');
    }
    // Go home on completion
    router.push('/');
  };

  const StepIcon = currentStepConfig.icon;

  // Determine card vertical alignment based on target position to avoid covering it
  const isTargetInBottomHalf = highlightRect 
    ? (highlightRect.top - window.scrollY) > (window.innerHeight / 2) 
    : false;

  return (
    <>
      {/* Dark Spotlight Backdrop */}
      <div 
        className="fixed inset-0 bg-stone-950/65 pointer-events-none"
        style={{
          zIndex: 48,
          clipPath: highlightRect ? `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%, 
            0% 0%,
            ${highlightRect.left}px ${highlightRect.top - window.scrollY}px,
            ${highlightRect.left}px ${highlightRect.top - window.scrollY + highlightRect.height}px,
            ${highlightRect.left + highlightRect.width}px ${highlightRect.top - window.scrollY + highlightRect.height}px,
            ${highlightRect.left + highlightRect.width}px ${highlightRect.top - window.scrollY}px,
            ${highlightRect.left}px ${highlightRect.top - window.scrollY}px
          )` : undefined,
          transition: 'clip-path 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Interactive elements shield/glow box */}
      {highlightRect && (
        <div 
          className="absolute rounded-[22px] border-2 border-gold-500 shadow-[0_0_25px_rgba(181,148,105,0.4)] pointer-events-none transition-all duration-300"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            zIndex: 49
          }}
        />
      )}

      {/* Explanation Dialog Card */}
      <div 
        className={`fixed left-1/2 -translate-x-1/2 w-[92%] max-w-sm transition-all duration-300`}
        style={{
          top: isTargetInBottomHalf ? '20px' : undefined,
          bottom: !isTargetInBottomHalf ? '88px' : undefined,
          zIndex: 50
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tourStep}
            initial={{ y: isTargetInBottomHalf ? -15 : 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: isTargetInBottomHalf ? -15 : 15, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="bg-white border border-cream-300 p-5 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.15)] text-left space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold-500/10 to-transparent rounded-full -mr-8 -mt-8 pointer-events-none" />
            
            <div className="flex justify-between items-center">
              <span className="text-[8.5px] bg-gold-500/10 text-gold-650 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                Tutorial Paso {tourStep + 1} de {TOUR_STEPS.length}
              </span>
              <button 
                onClick={handleComplete}
                className="text-stone-400 hover:text-stone-700 cursor-pointer transition-colors p-1"
                title="Omitir tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-stone-900 uppercase flex items-center gap-1.5">
                <StepIcon className="w-4 h-4 text-gold-500 shrink-0" />
                {currentStepConfig.title}
              </h3>
              <p className="text-[11px] text-stone-650 leading-relaxed">
                {currentStepConfig.description}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-cream-200">
              <button
                onClick={handleComplete}
                className="text-stone-400 hover:text-stone-700 text-[9px] font-bold uppercase tracking-wider cursor-pointer"
              >
                Omitir
              </button>
              <div className="flex gap-2">
                {tourStep > 0 && (
                  <button
                    onClick={handleBack}
                    className="px-3 py-1.5 border border-cream-300 text-stone-700 rounded-xl text-[8.5px] font-black uppercase tracking-wider hover:bg-stone-50 cursor-pointer"
                  >
                    Atrás
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-4 py-1.5 bg-stone-900 text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest hover:bg-stone-850 cursor-pointer flex items-center gap-1"
                >
                  <span>{tourStep === TOUR_STEPS.length - 1 ? 'Listo' : 'Siguiente'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
