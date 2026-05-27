'use client';

import { Trophy, Flame, Scale, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RulesPage() {
  const pointsList = [
    { stage: 'Octavos de Final', pts: 1, color: 'text-stone-500' },
    { stage: 'Cuartos de Final', pts: 2, color: 'text-stone-600' },
    { stage: 'Semifinal', pts: 3, color: 'text-stone-700' },
    { stage: 'Finalista', pts: 5, color: 'text-gold-650 font-bold' },
    { stage: 'Campeón del Mundo', pts: 8, color: 'text-gradient-gold font-black' },
  ];

  return (
    <div className="space-y-6 text-stone-900 max-w-5xl mx-auto pt-2">
      {/* Page Header */}
      <div className="border-b border-cream-300 pb-4 text-center sm:text-left">
        <h2 className="text-[10px] tracking-widest font-black uppercase text-stone-400">
          REGLAMENTO OFICIAL
        </h2>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900 leading-none mt-1">
          Bases del Prode Familiar del Mundial 2026.
        </h1>
      </div>

      {/* Responsive Grid layout for rules cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Formato */}
        <div className="glass-card p-6 border border-cream-300 flex flex-col justify-between shadow-sm bg-white">
          <div className="space-y-4">
            <div className="flex gap-3 items-center border-b border-cream-200 pb-3">
              <BookOpen className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider">Formato del Torneo</h3>
            </div>
            
            <ul className="space-y-3 text-xs text-stone-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-gold-500 font-black mt-0.5">•</span>
                <span><strong>Participantes:</strong> Exactamente 5 competidores familiares.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gold-500 font-black mt-0.5">•</span>
                <span><strong>Draft Inicial:</strong> Cada participante elige 2 selecciones antes de que arranque el Mundial.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[8px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.5 rounded uppercase mt-0.5 shrink-0">Importante</span>
                <span><strong>Restricción:</strong> No se pueden repetir países. Los países elegidos son exclusivos de cada uno.</span>
              </li>
            </ul>
          </div>
          <div className="text-[8px] text-stone-400 uppercase tracking-widest font-bold mt-6 pt-2 border-t border-cream-200">
            Reglamento Oficial Mundial 2026
          </div>
        </div>

        {/* Card 2: Sistema de Puntajes */}
        <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white space-y-4">
          <div className="flex gap-3 items-center border-b border-cream-200 pb-3">
            <Trophy className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider">Sistema de Puntajes</h3>
          </div>

          <div className="space-y-2">
            {pointsList.map((item, idx) => (
              <div key={item.stage} className="flex justify-between items-center py-1.5 border-b border-cream-200 last:border-0">
                <span className="text-xs text-stone-700 flex items-center gap-2">
                  <span className="text-[9px] text-stone-400 font-bold">{idx + 1}.</span>
                  {item.stage}
                </span>
                <div className="flex items-center gap-1">
                  <span className={`font-bebas text-lg ${item.color}`}>→ {item.pts}</span>
                  <span className="text-[8px] text-stone-400 uppercase tracking-widest font-black">punto{item.pts > 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gold-100/10 border border-gold-500/20 rounded-xl p-3 text-[11px] text-stone-700 space-y-1">
            <span className="font-bold text-gold-600 block uppercase tracking-wider text-[8px]">⚠️ NO ACUMULATIVO POR FASE</span>
            <p className="leading-relaxed">
              Cada selección suma únicamente el puntaje de la instancia máxima alcanzada. No se acumulan las fases anteriores.
            </p>
          </div>

          <div className="space-y-1 pt-1.5 text-[10px] text-stone-500">
            <span className="font-bold text-stone-400 uppercase tracking-wider block">Ejemplos:</span>
            <p>• Si un país pierde en cuartos suma 2 puntos (no 1+2).</p>
            <p>• Si sale campeón suma 8 puntos (únicamente).</p>
          </div>
        </div>

        {/* Card 3: Criterios de Desempate */}
        <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white space-y-4">
          <div className="flex gap-3 items-center border-b border-cream-200 pb-3">
            <Scale className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider">Criterios de Desempate</h3>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed">
            En caso de empate en puntos totales al finalizar el torneo, el ganador se definirá mediante los siguientes pasos sucesivos:
          </p>

          <ol className="space-y-3 text-xs text-stone-750 pl-1">
            <li className="flex gap-2">
              <span className="font-bebas text-gold-600 text-sm">1.</span>
              <span>Gana quien tenga al <strong>campeón del mundo</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bebas text-gold-600 text-sm">2.</span>
              <span>Si sigue el empate, gana quien tenga <strong>más finalistas</strong>.</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bebas text-gold-600 text-sm">3.</span>
              <span>Si sigue igual, se define por <strong>penales, moneda o batalla campal familiar</strong>.</span>
            </li>
          </ol>
        </div>

        {/* Card 4: Castigo */}
        <motion.div 
          initial={{ scale: 0.99, opacity: 0.97 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ repeat: Infinity, repeatType: "reverse", duration: 3 }}
          className="rounded-2xl p-6 border border-rose-200 bg-rose-50/50 shadow-sm relative overflow-hidden space-y-3 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl -z-10" />

          <div className="space-y-3">
            <div className="flex gap-3 items-center border-b border-rose-200 pb-3">
              <Flame className="w-5 h-5 text-rose-750 animate-pulse" />
              <h3 className="text-sm font-bold text-rose-800 uppercase tracking-widest flex items-center gap-1.5">
                EL CASTIGO DEL ÚLTIMO
              </h3>
            </div>

            <p className="text-xs text-rose-950 leading-relaxed">
              El participante que termine en el último puesto de la tabla de posiciones sufrirá la siguiente sanción oficial:
            </p>

            <div className="bg-white border-l-4 border-rose-450 rounded-r-xl p-4 text-left shadow-sm">
              <p className="text-xs font-bold text-rose-800 italic leading-relaxed">
                “Será oficialmente ‘La de Leila de las tetas caídas’ durante 24 horas y deberá actuar como esclavo de los otros cuatro participantes durante todo un día.”
              </p>
            </div>
          </div>

          <p className="text-[8px] text-rose-500 text-center font-bold uppercase tracking-widest mt-4">
            ¡A sumar puntos para salvarse del castigo!
          </p>
        </motion.div>

      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold">
          Queda oficialmente inaugurado el torneo.
        </p>
      </div>
    </div>
  );
}
