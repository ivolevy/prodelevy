'use client';

import { Trophy, Shield, GitCommit } from 'lucide-react';

export default function BracketView() {
  const phases = [
    { name: '16avos de Final', description: '32 Equipos', active: true },
    { name: 'Octavos de Final', description: '16 Equipos', active: false },
    { name: 'Cuartos de Final', description: '8 Equipos', active: false },
    { name: 'Semifinales', description: '4 Equipos', active: false },
    { name: 'Gran Final', description: '2 Equipos', active: false }
  ];

  return (
    <div className="w-full space-y-6 text-left">
      {/* Header Info */}
      <div className="border-b border-cream-200 pb-2 flex justify-between items-center">
        <h3 className="text-[10px] text-stone-450 uppercase tracking-widest font-black flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-gold-500" /> Cuadro Eliminatorio
        </h3>
        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-wider">
          Mundial 2026
        </span>
      </div>

      {/* Main Coming Soon Card */}
      <div className="w-full max-w-xl mx-auto bg-white border border-cream-300 rounded-3xl p-8 shadow-[0_12px_45px_rgba(0,0,0,0.02)] relative overflow-hidden text-center mt-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-gold-500/5 to-transparent rounded-full -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-cream-100/10 to-transparent rounded-full -ml-12 -mb-12 pointer-events-none" />

        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gold-500/10 flex items-center justify-center text-gold-650 animate-pulse">
            <Trophy className="w-8 h-8" />
          </div>
        </div>

        <span className="inline-block text-[8.5px] bg-gold-500/10 border border-gold-500/25 text-gold-700 px-3 py-0.5 rounded-full font-black uppercase tracking-widest mb-3">
          Próximamente
        </span>

        <h2 className="text-lg font-black text-stone-900 uppercase tracking-tight">
          Fase Eliminatoria (16avos de Final)
        </h2>
        
        <p className="text-[11px] text-stone-500 mt-2.5 leading-relaxed max-w-md mx-auto">
          El cuadro final y los cruces de eliminación directa se definirán automáticamente a medida que se jueguen los partidos y se definan los clasificados de la Fase de Grupos.
        </p>

        {/* Visual Road/Timeline of Phases */}
        <div className="mt-8 border-t border-cream-200 pt-6">
          <h4 className="text-[9px] font-black tracking-widest text-stone-400 uppercase mb-5 text-left pl-1">
            Camino a la Gloria
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {phases.map((phase, idx) => (
              <div 
                key={idx} 
                className={`relative p-3 rounded-2xl border text-center transition-all ${
                  phase.active 
                    ? 'bg-gold-500/10 border-gold-500/30 shadow-2xs' 
                    : 'bg-stone-50/50 border-cream-200'
                }`}
              >
                {/* Connector dot */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white px-1">
                  <GitCommit className={`w-3.5 h-3.5 ${phase.active ? 'text-gold-500' : 'text-stone-300'}`} />
                </div>

                <span className={`block text-[9px] font-black uppercase ${
                  phase.active ? 'text-gold-700' : 'text-stone-700'
                } mt-1`}>
                  {phase.name}
                </span>
                <span className="block text-[8px] font-bold text-stone-450 uppercase mt-0.5">
                  {phase.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
