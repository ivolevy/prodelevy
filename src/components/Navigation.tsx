'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Plus, Trash2, Home, Calendar, FileText, User } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { profiles, currentProfileId, setCurrentProfile, addProfile, deleteProfile, teams } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === currentProfileId);

  if (!currentProfileId) return null;

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
          PRODE<span className="text-gold-650 font-normal">2026</span>
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

        {/* Right: Profile Link */}
        <Link 
          href="/profile"
          className="w-8 h-8 rounded-full border border-cream-300 bg-white flex items-center justify-center text-stone-700 hover:bg-cream-100 transition-all focus:outline-none cursor-pointer"
        >
          <User className="w-4 h-4" />
        </Link>
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

        {/* Tab 4: Perfil Link */}
        <Link 
          href="/profile" 
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-1 transition-all duration-200 ease-out transform-gpu active:scale-95 min-h-[48px] ${
            pathname === '/profile' ? 'text-white scale-105 font-black' : 'text-cream-200/55 hover:text-white'
          }`}
        >
          <User className="w-5.5 h-5.5 transition-transform duration-200 ease-out" />
          <span className="text-[7.5px] uppercase tracking-widest font-black transition-colors duration-200">Perfil</span>
        </Link>

      </div>
    </header>
  );
}
