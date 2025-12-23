
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Share2, TrendingUp, Wallet, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EvolutionModalProps {
  onClose: () => void;
  totalValue: number;
}

type TimeRange = '1M' | '6M' | '1A' | 'Tudo';

export const EvolutionModal: React.FC<EvolutionModalProps> = ({ onClose, totalValue }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1A');

  // Para o app zerado, não geramos dados fakes.
  // Em uma versão futura com backend, isso viria da API de histórico real.
  const chartData: any[] = []; // VAZIO para produção inicial

  const hasData = chartData.length > 0;
  
  const totalGrowthValue = 0;
  const totalGrowthPercent = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="w-full h-full md:w-full md:max-w-md md:h-[85vh] flex flex-col bg-gray-50 dark:bg-[#0d0d0d] relative z-10 md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up transition-colors md:border border-gray-200 dark:border-white/5">
        
        <div className="px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Evolução</h1>
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wide">Performance da Carteira</span>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-20">
            
            <div className="mb-8 text-center animate-slide-up">
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">Crescimento no Período</p>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                    R$ {totalGrowthValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h2>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-500 font-bold text-sm">+{totalGrowthPercent.toFixed(2)}%</span>
                </div>
            </div>

            <div className="flex p-1 bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-xl rounded-2xl mb-6 border border-gray-200 dark:border-white/5 shadow-sm animate-slide-up">
                {(['1M', '6M', '1A', 'Tudo'] as TimeRange[]).map((range) => (
                    <button 
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all duration-300 uppercase ${
                            timeRange === range 
                            ? 'bg-white dark:bg-[#2c2c2e] text-gray-900 dark:text-white shadow-md border border-gray-100 dark:border-white/5' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-4 border border-gray-200 dark:border-white/5 shadow-xl h-80 relative mb-8 animate-pop-in flex items-center justify-center">
                 {!hasData ? (
                    <div className="text-center opacity-40">
                        <BarChart2 size={32} className="mx-auto mb-2 text-gray-500" />
                        <p className="text-xs font-bold text-gray-500">Dados insuficientes</p>
                        <p className="text-[10px] text-gray-400">Adicione ativos e aguarde o tempo passar.</p>
                    </div>
                 ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 40, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(val) => `R$${val/1000} mil`} />
                            <Tooltip cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fill="url(#colorTotal)" name="Patrimônio" />
                        </AreaChart>
                    </ResponsiveContainer>
                 )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                 <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-xl p-5 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg">
                     <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3">
                         <Wallet size={20} />
                     </div>
                     <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">Total Investido</p>
                     <p className="text-gray-900 dark:text-white font-bold text-lg">R$ 0,00</p>
                 </div>
                 
                 <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-xl p-5 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg">
                     <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                         <TrendingUp size={20} />
                     </div>
                     <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">Lucro de Capital</p>
                     <p className="text-emerald-500 font-bold text-lg">+ R$ 0,00</p>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};
