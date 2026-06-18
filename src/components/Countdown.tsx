'use client';

import { useEffect, useState } from 'react';

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false,
  });

  useEffect(() => {
    const targetDate = new Date('2026-06-11T16:00:00-03:00').getTime(); // World cup starts June 11, 2026 at 16:00 ARG

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        clearInterval(interval);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isOver: false });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (timeLeft.isOver) {
    return null;
  }

  return (
    <div className="w-full bg-white border border-cream-300 rounded-xl px-5 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
      <span className="text-[9px] uppercase font-black tracking-widest text-stone-400">
        COUNTDOWN AL MUNDIAL 2026
      </span>
      <div className="flex gap-4 items-center">
        {[
          { label: 'días', value: timeLeft.days },
          { label: 'hs', value: timeLeft.hours },
          { label: 'min', value: timeLeft.minutes },
          { label: 'seg', value: timeLeft.seconds },
        ].map((block, index, arr) => (
          <div key={block.label} className="flex items-center text-xs">
            <span className="font-bold text-stone-900">{String(block.value).padStart(2, '0')}</span>
            <span className="text-[8px] text-stone-400 font-semibold uppercase tracking-wider ml-1">{block.label}</span>
            {index < arr.length - 1 && (
              <span className="text-cream-400 ml-4 font-light text-[10px]">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
