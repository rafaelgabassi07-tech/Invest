
import React, { useEffect, useState, useRef } from 'react';
import { FinancialSummary } from '../types';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export const SummaryCard: React.FC<{ data: FinancialSummary }> = ({ data }) => {
  const [displayBalance, setDisplayBalance] = useState(data.totalBalance);
  const lastValue = useRef(data.totalBalance);

  useEffect(() => {
    const diff = Math.abs(data.totalBalance - lastValue.current);
    
    // Se a diferença for muito pequena ou zero, atualiza direto sem animação
    if (diff < 0.01) {
      setDisplayBalance(data.totalBalance);
      lastValue.current = data.totalBalance;
      return;
    }

    let startTimestamp: number | null = null;
    let animationFrameId: number;
    const duration = 1000; // Duração um pouco maior para suavidade
    const startValue = lastValue.current;
    const endValue = data.totalBalance;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function (easeOutQuart) para movimento mais natural
      const ease = 1 - Math.pow(1 - progress, 4);
      
      const current = startValue + (endValue - startValue) * ease;
      setDisplayBalance(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        lastValue.current = endValue;
        setDisplayBalance(endValue); // Garante valor final exato
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [data.totalBalance]);

  return (
    <div className="p-7 rounded-[2.5rem] bg-white/5 dark:bg-brand-muted/40 backdrop-blur-2xl relative overflow-hidden shadow-2xl border border-brand-highlight group animate-pop-in will-change-transform transform-gpu h-full">
      
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h2 className="text-[10px] font-extrabold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase flex items-center gap-2">
            Patrimônio Total
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_var(--brand-primary)]"></span>
        </h2>
        <span className="px-3 py-1 bg-brand-highlight dark:bg-brand-primary/10 text-brand-primary text-[9px] font-bold rounded-full border border-brand-primary/20 shadow-sm uppercase tracking-tighter">
          Ao Vivo
        </span>
      </div>

      <div className="mb-10 relative z-10">
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 transform -translate-y-1">R$</span>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white tracking-tighter mb-3 font-sans tabular-nums leading-none">
            {displayBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-brand-accent/10 px-3 py-1.5 rounded-xl border border-brand-accent/10">
            <TrendingUp size={14} className="text-brand-accent" />
            <span className="text-brand-accent text-xs font-bold tabular-nums">{data.dailyChange >= 0 ? '+' : ''}{data.dailyChange.toFixed(2)}%</span>
          </div>
          <span className="text-gray-500 dark:text-gray-400 text-xs font-bold tabular-nums flex items-center gap-1">
             <ArrowUpRight size={12} className="text-brand-primary" />
             R$ {data.dailyChangeValue >= 0 ? '+' : ''}{data.dailyChangeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 relative z-10 border-t border-brand-highlight pt-6">
        <div>
          <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Total Investido</p>
          <p className="text-gray-900 dark:text-white font-bold text-lg tracking-tight tabular-nums">
            R$ {data.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Yield on Cost</p>
          <p className="text-brand-primary font-bold text-lg tracking-tight tabular-nums">
            {data.yieldOnCost.toFixed(2)}%
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Renda Projetada</p>
          <p className="text-gray-900 dark:text-white font-bold text-lg tracking-tight tabular-nums">
            R$ {data.projectedAnnualIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Ganho de Capital</p>
          <p className="text-brand-accent font-bold text-lg tracking-tight tabular-nums">
            R$ {data.capitalGain >= 0 ? '+' : ''}{data.capitalGain.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
};
    