
import React from 'react';
import { TrendingUp, ChevronRight, BarChart3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface EvolutionCardProps {
  onClick: () => void;
}

// Sparkline zerado ou plano para estado inicial
const data = [
  { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, 
  { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }
];

export const EvolutionCard: React.FC<EvolutionCardProps> = ({ onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="mx-4 p-6 rounded-[2.5rem] bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 relative overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/20 group cursor-pointer active:scale-[0.98] transition-all hover:bg-white/80 dark:hover:bg-[#262629]/80 animate-pop-in"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>

      <div className="flex justify-between items-start relative z-10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-100/50 dark:border-white/5 shadow-sm backdrop-blur-sm">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold text-sm leading-none flex items-center gap-2">
               Evolução Patrimonial
               <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-medium mt-1">
               Rentabilidade Histórica
            </p>
          </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-[#2c2c2e]/50 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors border border-white/40 dark:border-white/5 shadow-sm backdrop-blur-sm">
          <ChevronRight size={16} />
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
         <div>
            <div className="flex items-center gap-1.5 mb-1">
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-sm flex items-center gap-1">
                    <TrendingUp size={10} /> 0.00%
                </span>
                <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Acumulado</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                R$ 0,00
            </h2>
         </div>

         {/* Sparkline Chart */}
         <div className="h-10 w-24 relative mb-1 opacity-50">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorEvo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4}/>
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        strokeWidth={2} 
                        fill="url(#colorEvo)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};
