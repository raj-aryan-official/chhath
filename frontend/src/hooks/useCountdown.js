import { useEffect, useState } from 'react';

const TICK_MS = 1000;

export function useCountdown(target) {
  const targetTime = target ? new Date(target).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  if (!Number.isFinite(targetTime)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, target: null };
  }

  const diff = Math.max(0, targetTime - now);
  const totalSeconds = Math.floor(diff / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    isPast: diff === 0,
    target: new Date(targetTime),
  };
}
