'use client';

import { Trophy, Clock, HelpCircle, CheckSquare } from 'lucide-react';

export default function RulesPage() {
  const pointsList = [
    { type: 'Acierto Exacto', desc: 'Acertar el resultado exacto (ej. pronóstico: 2-1, resultado: 2-1)', pts: 3, color: 'text-gold-650 font-bold' },
    { type: 'Acierto de Resultado', desc: 'Acertar el ganador o el empate con marcador diferente (ej. pronóstico: 1-0, resultado: 3-1)', pts: 1, color: 'text-stone-700' },
    { type: 'Sin Acierto', desc: 'No acertar el ganador ni el empate', pts: 0, color: 'text-stone-400' },
    { type: 'Predicción de Campeón', desc: 'Acertar la selección ganadora de la Copa del Mundo (se registra hasta 24 horas antes del inicio del torneo)', pts: 10, color: 'text-gold-650 font-black' },
  ];

  return (
    <div className="space-y-6 text-stone-900 max-w-5xl mx-auto pt-2">
      {/* Page Header */}
      <div className="border-b border-cream-300 pb-4 text-center">
        <h1 className="text-[10px] font-black tracking-widest text-stone-400 uppercase">
          reglas
        </h1>
      </div>

      {/* Responsive Grid layout for rules cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Formato del Torneo */}
        <div className="glass-card p-6 border border-cream-300 flex flex-col justify-between shadow-sm bg-white">
          <div className="space-y-4">
            <div className="flex gap-3 items-center border-b border-cream-200 pb-3">
              <CheckSquare className="w-5 h-5 text-gold-500" />
              <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider">Formato del Torneo</h3>
            </div>
            
            <ul className="space-y-3 text-xs text-stone-700 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-gold-500 font-black mt-0.5">•</span>
                <span><strong>Partidos Habilitados:</strong> Por ahora, solo participan los partidos de la <strong>Fase de Grupos</strong> del torneo.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gold-500 font-black mt-0.5">•</span>
                <span><strong>Participación Abierta:</strong> Cualquier participante puede sumarse a jugar agregando su nombre en el selector.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-gold-500 font-black mt-0.5">•</span>
                <span><strong>Carga en Línea:</strong> Todos los pronósticos deben ingresarse a través de la aplicación en el dispositivo personal.</span>
              </li>
            </ul>
          </div>
          <div className="text-[8px] text-stone-400 uppercase tracking-widest font-bold mt-6 pt-2 border-t border-cream-200">
            Reglamento Oficial Prode 2026
          </div>
        </div>

        {/* Card 2: Sistema de Puntajes */}
        <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white space-y-4">
          <div className="flex gap-3 items-center border-b border-cream-200 pb-3">
            <Trophy className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider">Sistema de Puntajes</h3>
          </div>

          <div className="space-y-3">
            {pointsList.map((item, idx) => (
              <div key={item.type} className="flex justify-between items-start py-2 border-b border-cream-200 last:border-0 last:pb-0">
                <div className="text-xs text-stone-700 pr-4">
                  <span className="font-bold text-stone-850 block">{item.type}</span>
                  <span className="text-[10px] text-stone-500 mt-0.5 block leading-tight">{item.desc}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className={`font-bebas text-lg ${item.color}`}>→ {item.pts}</span>
                  <span className="text-[8px] text-stone-400 uppercase tracking-widest font-black">punto{item.pts !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Cierre de Pronósticos */}
        <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white space-y-4">
          <div className="flex gap-3 items-center border-b border-cream-200 pb-3">
            <Clock className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider">Límite de Tiempo (24 Horas)</h3>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed">
            Para garantizar la honestidad y competitividad del juego, la plataforma bloquea automáticamente la carga de pronósticos con anticipación:
          </p>

          <ul className="space-y-3 text-xs text-stone-750">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span><strong>Cierre Automático:</strong> Las predicciones para cada partido se bloquean estrictamente <strong>24 horas antes</strong> del horario oficial de inicio del partido.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span><strong>Revelación de Pronósticos:</strong> Una vez cerrado el plazo de un partido, se revelan públicamente las predicciones de todos los jugadores para ese encuentro.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">•</span>
              <span><strong>Visualización en Fixture:</strong> Podrás ver qué pronosticó cada participante listado bajo la tarjeta del partido correspondiente.</span>
            </li>
          </ul>
        </div>

        {/* Card 4: Criterios de Desempate */}
        <div className="glass-card p-6 border border-cream-300 shadow-sm bg-white space-y-4">
          <div className="flex gap-3 items-center border-b border-cream-200 pb-3">
            <HelpCircle className="w-5 h-5 text-gold-500" />
            <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider">Criterios de Desempate</h3>
          </div>

          <p className="text-xs text-stone-700 leading-relaxed">
            En caso de igualdad de puntos en la tabla de posiciones, los puestos se ordenarán automáticamente según los siguientes criterios:
          </p>

          <ol className="space-y-3 text-xs text-stone-750 pl-1">
            <li className="flex gap-2">
              <span className="font-bold text-gold-600">1.</span>
              <span>Mayor cantidad de <strong>Aciertos Exactos</strong> (3 puntos).</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gold-600">2.</span>
              <span>Mayor cantidad de <strong>Aciertos de Resultado</strong> (1 punto).</span>
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-gold-600">3.</span>
              <span>Si el empate persiste, los participantes compartirán el mismo puesto de clasificación.</span>
            </li>
          </ol>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-[9px] uppercase tracking-widest text-stone-400 font-bold font-sans">
          Mucha suerte a todos los participantes.
        </p>
      </div>
    </div>
  );
}
