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

      // ── Register Service Worker with auto-update ──────────
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado:', registration.scope);

            // Check for updates every 60 seconds
            setInterval(() => {
              registration.update();
            }, 60_000);

            // When a new SW is available, tell it to activate immediately
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'activated' &&
                  navigator.serviceWorker.controller
                ) {
                  // New version is active – the network-first strategy
                  // ensures the next navigation loads the updated page.
                  // No reinstall needed.
                  console.log('Nueva versión disponible. Se aplicará automáticamente.');
                }
              });
            });
          })
          .catch((err) =>
            console.error('Error al registrar Service Worker:', err)
          );

        // If a new SW took over while this page was open, reload to
        // pick up the latest assets.
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });
      }
    }
  }, [initStore]);

  // ── Background Auto-Sync (Gemini polling) ───────────────
  useEffect(() => {
    if (isLoading || matchesRef.current.length === 0) return;

    let isSyncing = false;

    const performSync = async () => {
      if (isSyncing) return;
      isSyncing = true;
      try {
        const res = await fetch('/api/sync-matches', {
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
            const scoreChanged =
              currentMatch.home_score !== item.home_score ||
              currentMatch.away_score !== item.away_score;

            if (statusChanged || scoreChanged) {
              await updateMatchScore(
                item.id,
                item.home_score,
                item.away_score,
                item.status
              );
            }
          }
        }
      } catch (err) {
        console.error(
          'Error en la sincronización automática de partidos:',
          err
        );
      } finally {
        isSyncing = false;
      }
    };

    // Run sync immediately on load
    performSync();

    // Poll every 60 seconds for real-time tournament scores
    const interval = setInterval(performSync, 60_000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return <>{children}</>;
}
