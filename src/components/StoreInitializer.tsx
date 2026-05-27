'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function StoreInitializer({ children }: { children: React.ReactNode }) {
  const initStore = useStore((state) => state.initStore);
  const matches = useStore((state) => state.matches);
  const isLoading = useStore((state) => state.isLoading);
  const updateMatchScore = useStore((state) => state.updateMatchScore);
  const initialized = useRef(false);
  const matchesRef = useRef(matches);

  // Keep matches reference up to date to avoid recreation of sync effect
  useEffect(() => {
    matchesRef.current = matches;
  }, [matches]);

  useEffect(() => {
    if (!initialized.current) {
      initStore();
      initialized.current = true;

      // Register Service Worker for PWA support
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then((reg) => console.log('Service Worker registrado con éxito:', reg.scope))
            .catch((err) => console.error('Error al registrar Service Worker:', err));
        });
      }
    }
  }, [initStore]);

  // Background Auto-Sync Effect
  useEffect(() => {
    if (isLoading || matchesRef.current.length === 0) return;

    let isSyncing = false;

    const performSync = async () => {
      if (isSyncing) return;
      isSyncing = true;
      try {
        const res = await fetch('/api/sync-gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matches: matchesRef.current }),
        });
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          for (const item of data.results) {
            const currentMatch = matchesRef.current.find(m => m.id === item.id);
            if (!currentMatch) continue;
            
            const statusChanged = currentMatch.status !== item.status;
            const scoreChanged = currentMatch.home_score !== item.home_score || currentMatch.away_score !== item.away_score;
            
            if (statusChanged || scoreChanged) {
              await updateMatchScore(item.id, item.home_score, item.away_score, item.status);
            }
          }
        }
      } catch (err) {
        console.error('Error en la sincronización automática de partidos:', err);
      } finally {
        isSyncing = false;
      }
    };

    // Run sync immediately on load
    performSync();

    // Poll every 2 minutes (120000ms) for real-time tournament scores
    const interval = setInterval(performSync, 120000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return <>{children}</>;
}

