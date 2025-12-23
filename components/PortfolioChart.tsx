
import React from 'react';
import { PortfolioItem } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, ChevronRight, CircleOff } from 'lucide-react';

interface PortfolioChartProps {
  items: PortfolioItem[];
  onClick: () => void;
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ items, onClick }) => {
  const isEmpty = items.length === 0;

  return (
    <div 
      onClick={onClick}
      className="mx-4 p-6 rounded-[2.5rem] bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-2xl shadow-xl shadow-gray-200/40 dark:shadow-black/20 border border-white/40 dark:border-white/10 relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all hover:bg-white/80 dark:hover:bg-[#262629]/80"
    >
      {/* Decorative Blur - Subtle */}
      <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50/50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-500 border border-blue-100/50 dark:border-white/5 shadow-sm backdrop-blur-sm">
            <PieIcon size={20} />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm leading-none flex items-center gap-2">
                Carteira
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-medium mt-1">Distribuição</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-[#2c2c2e]/50 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-blue-500 transition-colors border border-white/40 dark:border-white/5 shadow-sm backdrop-blur-sm">
          <ChevronRight size={16} />
        </div>
      </div>

      <div className="flex items-center relative z-10">
        {isEmpty ? (
            <div className="w-full py-4 flex flex-col items-center justify-center opacity-50 gap-2">
                 <CircleOff size={24} className="text-gray-400" />
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Sem dados</span>
            </div>
        ) : (
            <>
                <div className="flex-1 pr-6 space-y-3">
                {items.map((item, index) => (
                    <div key={item.id} style={{ transitionDelay: `${index * 50}ms` }} className="group/item">
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wide group-hover/item:text-gray-700 dark:group-hover/item:text-gray-300 transition-colors">{item.name}</span>
                        <span className="text-gray-900 dark:text-white text-[10px] font-bold transition-colors">{item.percentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100/50 dark:bg-[#0d0d0d]/50 rounded-full overflow-hidden border border-white/20 dark:border-white/5">
                        <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden group-hover/item:opacity-80" 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                        >
                        </div>
                    </div>
                    </div>
                ))}
                </div>

                {/* Adicionado style minWidth/minHeight para corrigir erro do Recharts */}
                <div className="w-24 h-24 relative shrink-0" style={{ minWidth: '96px', minHeight: '96px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={items}
                        innerRadius={32}
                        outerRadius={42} 
                        paddingAngle={4}
                        dataKey="percentage"
                        stroke="none"
                        startAngle={90}
                        endAngle={-270}
                        cornerRadius={4}
                    >
                        {items.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-white/50 dark:bg-[#1c1c1e]/50 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)] flex items-center justify-center transition-colors backdrop-blur-sm">
                        <span className="text-gray-400 dark:text-gray-600 font-bold text-[9px]">{items.length}</span>
                    </div>
                </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};
