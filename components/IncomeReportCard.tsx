
import React from 'react';
import { Asset } from '../types';
import { BarChart3, ChevronRight, TrendingUp } from 'lucide-react';

interface IncomeReportCardProps {
  assets: Asset[];
  onClick?: () => void;
}

export const IncomeReportCard: React.FC<IncomeReportCardProps> = ({ assets, onClick }) => {
  // Logic to separate FIIs/Fiagro from Stocks (Ações)
  const incomeData = assets.reduce(
    (acc, asset) => {
      const monthlyIncome = asset.lastDividend * asset.quantity;
      const isFII = ['FII', 'FIAGRO'].includes(asset.assetType.toUpperCase());

      if (isFII) {
        acc.fii += monthlyIncome;
      } else {
        acc.stocks += monthlyIncome;
      }
      acc.total += monthlyIncome;
      
      acc.totalInvested += asset.totalValue;
      acc.weightedDySum += asset.dy12m * asset.totalValue;

      return acc;
    },
    { fii: 0, stocks: 0, total: 0, totalInvested: 0, weightedDySum: 0 }
  );

  const fiiPercentage = incomeData.total > 0 ? (incomeData.fii / incomeData.total) * 100 : 0;
  const stocksPercentage = incomeData.total > 0 ? (incomeData.stocks / incomeData.total) * 100 : 0;
  
  const averageDy = incomeData.totalInvested > 0 
    ? incomeData.weightedDySum / incomeData.totalInvested 
    : 0;

  return (
    <div 
      onClick={onClick}
      className="mx-4 md:mx-0 p-6 rounded-[2.5rem] bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 relative overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/20 group cursor-pointer active:scale-[0.98] transition-all hover:bg-white/80 dark:hover:bg-[#262629]/80 animate-pop-in h-full flex flex-col justify-between"
    >
      {/* Decorative Blur */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-amber-50/50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500 border border-amber-100/50 dark:border-white/5 shadow-sm backdrop-blur-sm">
              <BarChart3 size={20} />
           </div>
           <div>
             <h3 className="text-gray-900 dark:text-white font-bold text-sm leading-none flex items-center gap-2">
                Proventos
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
             </h3>
             <p className="text-gray-500 dark:text-gray-400 text-[10px] font-medium mt-1">
                Relatório de Renda
             </p>
           </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-[#2c2c2e]/50 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-amber-500 transition-colors border border-white/40 dark:border-white/5 shadow-sm backdrop-blur-sm">
          <ChevronRight size={16} />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end">
        {/* Main Stats */}
        <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Renda Mensal</p>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                R$ {incomeData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h2>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 mb-1">
                    <span className="text-gray-400 text-[10px] font-bold uppercase">DY Médio</span>
                    <span className="text-amber-600 dark:text-amber-500 text-xs font-bold">{averageDy.toFixed(2)}%</span>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/10 backdrop-blur-sm">
                    <TrendingUp size={12} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-500 text-[10px] font-bold">+2.4%</span>
                </div>
            </div>
        </div>

        {/* Composition Bar */}
        <div className="relative z-10">
            <div className="h-2 w-full bg-[#f3f4f6]/50 dark:bg-[#0d0d0d]/50 rounded-full overflow-hidden flex border border-gray-100/50 dark:border-white/5 backdrop-blur-sm">
                <div 
                    className="h-full bg-indigo-500 relative group/bar" 
                    style={{ width: `${fiiPercentage}%` }}
                ></div>
                <div 
                    className="h-full bg-emerald-500 relative group/bar" 
                    style={{ width: `${stocksPercentage}%` }}
                ></div>
            </div>

            {/* Legend */}
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]"></div>
                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold">FIIs ({fiiPercentage.toFixed(0)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold">Ações ({stocksPercentage.toFixed(0)}%)</span>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};
