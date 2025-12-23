
import React, { useEffect, useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export const SplashScreen = ({ onComplete }) => {
  const [isExiting, setIsExiting] = useState(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    // Reduzido para 1.2s total para uma sensação de rapidez (snappy)
    const timer = setTimeout(() => {
      if (hasCompleted.current) return;
      setIsExiting(true);
      
      const exitTimer = setTimeout(() => {
        hasCompleted.current = true;
        onComplete();
      }, 400); // Tempo da animação de saída suave
      
      return () => clearTimeout(exitTimer);
    }, 800); 

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] transition-all duration-500 ease-out ${isExiting ? 'opacity-0 scale-95 blur-sm pointer-events-none' : 'opacity-100'}`}>
      <div className="relative will-change-transform">
        {/* Glow Effect - Optimized with simpler shadow */}
        <div className="absolute inset-0 bg-brand-primary/20 blur-[40px] rounded-full animate-pulse"></div>
        
        <div className="relative w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-[1.75rem] flex items-center justify-center shadow-xl shadow-brand-primary/20 animate-pop-in">
          <Sparkles size={40} className="text-white animate-spin-slow" />
        </div>
      </div>
      
      <div className="mt-6 text-center animate-slide-up">
        <h1 className="text-xl font-bold text-white tracking-tighter mb-1">Invest</h1>
        <div className="flex items-center justify-center gap-1.5 h-1">
          <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce"></span>
          <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce [animation-delay:0.1s]"></span>
          <span className="w-1 h-1 rounded-full bg-brand-primary animate-bounce [animation-delay:0.2s]"></span>
        </div>
      </div>
    </div>
  );
};
