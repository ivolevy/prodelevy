'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function StoreInitializer({ children }: { children: React.ReactNode }) {
  const initStore = useStore((state) => state.initStore);
  const initialized = useRef(false);

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

  return <>{children}</>;
}
