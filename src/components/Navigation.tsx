'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Plus, Trash2, Home, Calendar, FileText } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { profiles, currentProfileId, setCurrentProfile, addProfile, deleteProfile, teams } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === currentProfileId);

  const getChampionInfo = (prof: any) => {
    if (!prof.champion_prediction) return null;
    const team = teams.find(t => t.id === prof.champion_prediction);
    return team ? `${team.flag_emoji} ${team.name}` : null;
  };

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Fixture', path: '/matches' },
    { name: 'Reglas', path: '/rules' },
  ];

  // Helper to get initials
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  const handleAddParticipant = async () => {
    const name = newParticipantName.trim();
    if (!name) return;
    
    // Error Prevention: Check for duplicate name
    const isDuplicate = profiles.some(p => p.display_name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) {
      setErrorMsg('El nombre ya existe');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setErrorMsg(null);
    await addProfile(name);
    setNewParticipantName('');
    setIsAdding(false);
  };

  return (
    <header className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] h-16 rounded-3xl border border-gold-500/30 bg-gold-600 shadow-[0_8px_30px_rgba(0,0,0,0.12),0_4px_20px_rgba(181,148,105,0.2)] px-4 flex items-center justify-around z-50 md:fixed md:top-4 md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:w-[94%] md:max-w-2xl md:h-14 md:rounded-full md:border md:border-cream-300 md:bg-white/90 md:px-5 md:shadow-sm md:justify-between animate-in slide-in-from-bottom duration-300">
      
      {/* ───────────────── DESKTOP LAYOUT ───────────────── */}
      <div className="hidden md:flex items-center justify-between w-full">
        {/* Left: Brand logo */}
        <Link href="/" className="font-sans text-[10px] tracking-widest font-black text-stone-900 uppercase">
          PRODE<span className="text-gold-600 font-normal">2026</span>
        </Link>

        {/* Center: Nav links */}
        <nav className="flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-[10px] uppercase font-bold tracking-wider transition-all relative py-1 ${
                  isActive 
                    ? 'text-stone-900 font-extrabold' 
                    : 'text-stone-400 hover:text-stone-700'
                }`}
              >
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-0.5 rounded-full bg-stone-900" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Profile Selector */}
        <div className="relative">
          <button 
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setIsAdding(false);
              setErrorMsg(null);
            }}
            className="w-8 h-8 rounded-full border border-cream-300 bg-white flex items-center justify-center text-[10px] font-black text-stone-700 hover:bg-cream-100 transition-all focus:outline-none cursor-pointer"
          >
            <span>{getInitials(activeProfile?.display_name || 'US')}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-56 rounded-xl bg-white border border-cream-300 shadow-lg p-1.5 z-50 text-stone-900 animate-in fade-in slide-in-from-top-1 duration-150">
              <p className="text-[8px] text-stone-400 font-bold px-2.5 py-1 uppercase tracking-wider">Participante</p>
              <div className="h-px bg-cream-200 my-1" />
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {profiles.map((prof) => {
                  const isProtected = prof.id === 'user-ivan' || prof.id === 'user-catalina';
                  return (
                    <div 
                      key={prof.id} 
                      className="group flex items-center justify-between rounded-lg hover:bg-cream-100 transition-all"
                    >
                      <button
                        onClick={() => {
                          setCurrentProfile(prof.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                          prof.id === currentProfileId 
                            ? 'bg-cream-200 text-stone-900 font-bold border-l-2 border-stone-850' 
                            : 'text-stone-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-cream-200 flex items-center justify-center text-[8px] font-bold text-stone-600">
                            {getInitials(prof.display_name)}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold">{prof.display_name}</span>
                            {getChampionInfo(prof) && (
                              <span className="text-[7.5px] text-gold-650 font-normal leading-none mt-0.5">
                                Campeón: {getChampionInfo(prof)}
                              </span>
                            )}
                          </div>
                        </div>
                        {prof.is_admin && (
                          <span className="text-[7px] bg-stone-900 text-white px-1 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Admin</span>
                        )}
                      </button>

                      {!isProtected && activeProfile?.is_admin && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`¿Eliminar participante "${prof.display_name}"? Sus pronósticos y puntos se perderán de manera permanente.`)) {
                              await deleteProfile(prof.id);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-650 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-cream-200 mr-1 shrink-0 cursor-pointer"
                          title="Eliminar participante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {activeProfile?.is_admin && (
                <>
                  <div className="h-px bg-cream-200 my-1" />
                  {isAdding ? (
                    <div className="px-2 py-1.5 space-y-1.5">
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          placeholder="Nombre..."
                          value={newParticipantName}
                          onChange={(e) => setNewParticipantName(e.target.value)}
                          className="w-full bg-cream-50 border border-cream-300 rounded-lg px-2 py-1 text-xs text-stone-850 placeholder-stone-400 focus:outline-none focus:border-gold-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddParticipant();
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleAddParticipant}
                          className="p-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                          aria-label="Agregar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {errorMsg && (
                        <p className="text-[8px] font-bold text-rose-650 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-center leading-none">
                          {errorMsg}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 text-[9px] uppercase font-extrabold tracking-wider text-gold-650 hover:bg-cream-100 rounded-lg transition-all cursor-pointer"
                    >
                      <span>+ Nuevo Participante</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ───────────────── MOBILE LAYOUT ───────────────── */}
      <div className="flex md:hidden items-center justify-around w-full h-full text-cream-100">
        {/* Tab 1: Inicio */}
        <Link 
          href="/" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200 ease-out transform-gpu active:scale-95 min-h-[48px] ${
            pathname === '/' ? 'text-white scale-105 font-black' : 'text-cream-200/55 hover:text-white'
          }`}
        >
          <Home className="w-5.5 h-5.5 transition-transform duration-200 ease-out" />
          <span className="text-[7.5px] uppercase tracking-widest font-black transition-colors duration-200">Inicio</span>
        </Link>

        {/* Tab 2: Fixture */}
        <Link 
          href="/matches" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200 ease-out transform-gpu active:scale-95 min-h-[48px] ${
            pathname === '/matches' ? 'text-white scale-105 font-black' : 'text-cream-200/55 hover:text-white'
          }`}
        >
          <Calendar className="w-5.5 h-5.5 transition-transform duration-200 ease-out" />
          <span className="text-[7.5px] uppercase tracking-widest font-black transition-colors duration-200">Fixture</span>
        </Link>

        {/* Tab 3: Reglas */}
        <Link 
          href="/rules" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200 ease-out transform-gpu active:scale-95 min-h-[48px] ${
            pathname === '/rules' ? 'text-white scale-105 font-black' : 'text-cream-200/55 hover:text-white'
          }`}
        >
          <FileText className="w-5.5 h-5.5 transition-transform duration-200 ease-out" />
          <span className="text-[7.5px] uppercase tracking-widest font-black transition-colors duration-200">Reglas</span>
        </Link>

        {/* Tab 4: Perfil Dropdown */}
        <div className="relative flex-1 flex justify-center">
          <button 
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setIsAdding(false);
              setErrorMsg(null);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 focus:outline-none transition-all duration-200 ease-out transform-gpu active:scale-95 relative cursor-pointer min-h-[48px] ${
              dropdownOpen ? 'text-white scale-105 font-black' : 'text-cream-200/55 hover:text-white'
            }`}
          >
            <span className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center text-[8px] font-black shrink-0 transition-all duration-200 ${
              dropdownOpen ? 'border-white bg-white text-gold-600' : 'border-cream-100/40 bg-gold-700/30 text-cream-100'
            }`}>
              {getInitials(activeProfile?.display_name || 'US')}
            </span>
            <span className="text-[7.5px] uppercase tracking-widest font-black transition-colors duration-200">Perfil</span>
          </button>

          {dropdownOpen && (
            <>
              {/* Tap backdrop to dismiss dropdown on mobile */}
              <div 
                className="fixed inset-0 z-40 bg-black/25 backdrop-blur-xs md:hidden animate-in fade-in duration-250" 
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-1/2 translate-x-1/2 bottom-full mb-3 w-56 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-250 ease-out transform-gpu text-left">
              <p className="text-[8px] text-stone-400 font-bold px-2.5 py-1 uppercase tracking-wider">Participante</p>
              <div className="h-px bg-stone-800 my-1" />
              <div className="max-h-60 overflow-y-auto space-y-0.5">
                {profiles.map((prof) => {
                  const isProtected = prof.id === 'user-ivan' || prof.id === 'user-catalina';
                  return (
                    <div 
                      key={prof.id} 
                      className="group flex items-center justify-between rounded-lg hover:bg-stone-800 transition-all"
                    >
                      <button
                        onClick={() => {
                          setCurrentProfile(prof.id);
                          setDropdownOpen(false);
                        }}
                        className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                          prof.id === currentProfileId 
                            ? 'bg-stone-800 text-white font-bold border-l-2 border-gold-500' 
                            : 'text-stone-350'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-850 text-cream-100 flex items-center justify-center text-[8px] font-bold shrink-0">
                            {getInitials(prof.display_name)}
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold">{prof.display_name}</span>
                            {getChampionInfo(prof) && (
                              <span className="text-[7.5px] text-gold-400 font-normal leading-none mt-0.5">
                                Campeón: {getChampionInfo(prof)}
                              </span>
                            )}
                          </div>
                        </div>
                        {prof.is_admin && (
                          <span className="text-[7px] bg-stone-800 text-stone-300 border border-stone-700 px-1 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Admin</span>
                        )}
                      </button>

                      {!isProtected && activeProfile?.is_admin && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`¿Eliminar participante "${prof.display_name}"? Sus pronósticos y puntos se perderán de manera permanente.`)) {
                              await deleteProfile(prof.id);
                            }
                          }}
                          className="p-1.5 text-stone-550 hover:text-rose-400 transition-all rounded hover:bg-stone-800 mr-1 shrink-0 cursor-pointer"
                          title="Eliminar participante"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {activeProfile?.is_admin && (
                <>
                  <div className="h-px bg-stone-800 my-1" />
                  {isAdding ? (
                    <div className="px-2 py-1.5 space-y-1.5">
                      <div className="flex gap-1 items-center">
                        <input
                          type="text"
                          placeholder="Nombre..."
                          value={newParticipantName}
                          onChange={(e) => setNewParticipantName(e.target.value)}
                          className="w-full bg-stone-850 border border-stone-800 rounded-lg px-2 py-1 text-xs text-white placeholder-stone-550 focus:outline-none focus:border-gold-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddParticipant();
                            }
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleAddParticipant}
                          className="p-1 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer"
                          aria-label="Agregar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {errorMsg && (
                        <p className="text-[8px] font-bold text-rose-400 bg-rose-950/20 border border-rose-900/30 px-2 py-0.5 rounded text-center leading-none">
                          {errorMsg}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAdding(true)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 text-[9px] uppercase font-extrabold tracking-wider text-gold-400 hover:bg-stone-800 rounded-lg transition-all cursor-pointer"
                    >
                      <span>+ Nuevo Participante</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </>)}
        </div>
      </div>
    </header>
  );
}
