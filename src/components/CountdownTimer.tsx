'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Ustaw czas końca promocji na dzisiaj o 23:59:59
    const now = new Date();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = endOfDay.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (isExpired) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-semibold">Promocja zakończona!</span>
        </div>
        <p className="text-gray-300 text-sm">
          Sprawdź nasze aktualne oferty
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-3">
        <Clock className="w-5 h-5 text-red-400 animate-pulse" />
        <span className="text-red-400 font-semibold">PROMOCJA KOŃCZY SIĘ ZA:</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{timeLeft.hours.toString().padStart(2, '0')}</div>
          <div className="text-xs text-gray-300">GODZIN</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{timeLeft.minutes.toString().padStart(2, '0')}</div>
          <div className="text-xs text-gray-300">MINUT</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{timeLeft.seconds.toString().padStart(2, '0')}</div>
          <div className="text-xs text-gray-300">SEKUND</div>
        </div>
      </div>
      
      <p className="text-gray-300 text-sm">
        Rabat -30% ważny tylko do końca dnia!
      </p>
    </div>
  );
}
