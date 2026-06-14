'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { supabase } from '@/lib/supabaseClient';
import LoginView from './LoginView';

export default function StoreInitializer({ children }: { children: React.ReactNode }) {
  const initStore = useStore((state) => state.initStore);
  const matches = useStore((state) => state.matches);
  const isLoading = useStore((state) => state.isLoading);
  const currentProfileId = useStore((state) => state.currentProfileId);
  const updateMatchScore = useStore((state) => state.updateMatchScore);
  const initialized = useRef(false);
  const matchesRef = useRef(matches);
  const savePushSubscription = useStore((state) => state.savePushSubscription);

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

            // Force update check immediately when app opens
            registration.update();

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

  // ── Supabase Realtime Synchronization ───────────────────
  useEffect(() => {
    if (!supabase) return;

    // Listen to changes in profiles, predictions, groups, group_members
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          initStore(false, true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          initStore(false, true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'groups' },
        () => {
          initStore(false, true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'group_members' },
        () => {
          initStore(false, true);
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
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

    // Run sync immediately on load (delayed slightly to prevent state updates before child components have fully mounted)
    const timeoutId = setTimeout(performSync, 100);

    // Poll every 60 seconds for real-time tournament scores
    const interval = setInterval(performSync, 60_000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [isLoading]);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Prompt for notification permission on first login/profile activation
  useEffect(() => {
    if (typeof window !== 'undefined' && currentProfileId && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const timer = setTimeout(async () => {
          try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'SHOW_NOTIFICATION',
                payload: {
                  title: '🏆 ¡Bienvenido al Prode Familiar!',
                  body: '¡Notificaciones activadas! "¿Vos tenés ganas de ganar, eh gordito? 😉"'
                }
              });
              
              const registration = await navigator.serviceWorker.ready;
              const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
              if (vapidPublicKey) {
                const subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                });
                await savePushSubscription(currentProfileId, subscription);
              }
            }
          } catch (err) {
            console.error('Error requesting notifications:', err);
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentProfileId]);

  // Synchronize Push Subscription if permission is already granted
  useEffect(() => {
    if (typeof window !== 'undefined' && currentProfileId && 'Notification' in window) {
      if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        const syncSubscription = async () => {
          try {
            const registration = await navigator.serviceWorker.ready;
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            
            if (vapidPublicKey) {
              let subscription = await registration.pushManager.getSubscription();
              
              if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
                });
              }
              
              await savePushSubscription(currentProfileId, subscription);
            }
          } catch (e) {
            console.error('Error synchronizing push subscription:', e);
          }
        };
        
        syncSubscription();
      }
    }
  }, [currentProfileId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-cream-300 border-t-gold-500 animate-spin" />
        <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">Cargando</span>
      </div>
    );
  }

  if (!currentProfileId) {
    return <LoginView />;
  }

  return <>{children}</>;
}
