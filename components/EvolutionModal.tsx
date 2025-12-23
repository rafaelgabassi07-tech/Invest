
import React, { useState } from 'react';
import { ChevronLeft, Share2, TrendingUp, Wallet, BarChart2, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface EvolutionModalProps {
  onClose: () => void;
  totalValue: number;
}

type TimeRange = '1M' | '6M' | '1A' | 'Tudo';

export const EvolutionModal: React.FC<EvolutionModalProps> = ({ onClose, totalValue }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1A');
  const chartData: any[] = []; // Empty for initial state
  const hasData = chartData.length > 0;
  
  const totalGrowthValue = 0;
  const totalGrowthPercent = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Evolução</h1>
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wide">Performance da Carteira</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-6 py-8 w-full h-full flex flex-col">
                
                {/* Time Range Selector & Summary */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-6">
                    <div>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Crescimento no Período</p>
                        <div className="flex items-center gap-4">
                            <h2 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
                                R$ {totalGrowthValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h2>
                            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                                <TrendingUp size={16} className="text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-500 font-bold text-sm">+{totalGrowthPercent.toFixed(2)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex p-1.5 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                        {(['1M', '6M', '1A', 'Tudo'] as TimeRange[]).map((range) => (
                            <button 
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-6 py-2 text-xs font-bold rounded-xl transition-all duration-300 uppercase ${
                                    timeRange === range 
                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Chart */}
                <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-6 border border-gray-200 dark:border-white/5 shadow-xl flex-1 min-h-[400px] relative mb-8 flex items-center justify-center">
                     {!hasData ? (
                        <div className="text-center opacity-40">
                            <BarChart2 size={64} className="mx-auto mb-4 text-gray-500" />
                            <p className="text-lg font-bold text-gray-500">Aguardando dados históricos</p>
                            <p className="text-sm text-gray-400 mt-2">Adicione ativos e aguarde a atualização do mercado.</p>
                        </div>
                     ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(val) => `R$${val/1000}k`} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }} 
                                />
                                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={4} fill="url(#colorTotal)" name="Patrimônio" activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                     )}
                </div>

                {/* Footer Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                             <Wallet size={28} />
                         </div>
                         <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Investido</p>
                            <p className="text-gray-900 dark:text-white font-bold text-2xl">R$ 0,00</p>
                         </div>
                     </div>
                     
                     <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                             <TrendingUp size={28} />
                         </div>
                         <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Lucro de Capital</p>
                            <p className="text-emerald-500 font-bold text-2xl">+ R$ 0,00</p>
                         </div>
                     </div>

                     <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg flex items-center gap-5">
                         <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                             <Share2 size={28} />
                         </div>
                         <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Proventos Acumulados</p>
                            <p className="text-amber-500 font-bold text-2xl">R$ 0,00</p>
                         </div>
                     </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
