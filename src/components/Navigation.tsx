'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { profiles, currentProfileId, setCurrentProfile } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const activeProfile = profiles.find(p => p.id === currentProfileId);

  const navItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Draft', path: '/draft' },
    { name: 'Fixture', path: '/matches' },
    { name: 'Reglas', path: '/rules' },
    { name: 'Admin', path: '/admin' },
  ];

  // Helper to get initials
  const getInitials = (name: string) => {
    return name ? name.substring(0, 2).toUpperCase() : 'US';
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl h-14 rounded-full border border-cream-300 bg-white/90 backdrop-blur-md px-5 flex items-center justify-between shadow-sm">
      
      {/* Left: Brand logo as plain elegant text */}
      <Link href="/" className="font-sans text-[10px] tracking-widest font-black text-stone-900 uppercase">
        PRODE<span className="text-gold-600 font-normal">2026</span>
      </Link>

      {/* Center: Minimal Text Navigation Links (Desktop only) */}
      <nav className="hidden md:flex items-center gap-4 sm:gap-6">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider transition-all relative py-1 ${
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

      {/* Right: Circular Profile Selector & Mobile Menu Toggle */}
      <div className="flex items-center gap-2">
        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full border border-cream-300 bg-white flex items-center justify-center text-[10px] font-black text-stone-700 hover:bg-cream-100 transition-all focus:outline-none"
          >
            <span>{getInitials(activeProfile?.display_name || 'US')}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white border border-cream-300 shadow-lg p-1.5 z-50 text-stone-900">
              <p className="text-[8px] text-stone-400 font-bold px-2.5 py-1 uppercase tracking-wider">Participante</p>
              <div className="h-px bg-cream-200 my-1" />
              {profiles.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => {
                    setCurrentProfile(prof.id);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all ${
                    prof.id === currentProfileId 
                      ? 'bg-cream-200 text-stone-900 font-bold border-l-2 border-stone-850' 
                      : 'text-stone-605 hover:bg-cream-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cream-200 flex items-center justify-center text-[8px] font-bold text-stone-600">
                      {getInitials(prof.display_name)}
                    </span>
                    <span>{prof.display_name}</span>
                  </div>
                  {prof.is_admin && (
                    <span className="text-[7px] bg-stone-900 text-white px-1 py-0.5 rounded font-bold uppercase tracking-wider">Admin</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-8 h-8 rounded-full border border-cream-300 bg-white flex items-center justify-center text-stone-700 hover:bg-cream-100 transition-all focus:outline-none"
          aria-label="Menú"
        >
          {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 md:hidden bg-white/95 backdrop-blur-md border border-cream-300 rounded-3xl p-3 shadow-lg z-50 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                className={`text-[9px] uppercase font-bold tracking-wider py-2.5 px-4 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-stone-900 text-white font-extrabold shadow-sm' 
                    : 'text-stone-500 hover:bg-cream-100'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
