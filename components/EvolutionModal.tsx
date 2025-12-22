
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Share2, TrendingUp, Calendar, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface EvolutionModalProps {
  onClose: () => void;
  totalValue: number;
}

type TimeRange = '1M' | '6M' | '1A' | 'Tudo';

const generateHistoryData = (months: number) => {
    const data = [];
    let invested = 5000;
    let total = 5000;
    
    for (let i = 0; i < months; i++) {
        const contribution = Math.random() > 0.2 ? 500 + Math.random() * 500 : 0; 
        const growth = total * (Math.random() * 0.03 - 0.005); 
        
        invested += contribution;
        total += contribution + growth;

        data.push({
            month: i,
            label: `M${i+1}`,
            invested: Math.floor(invested),
            total: Math.floor(total),
            profit: Math.floor(total - invested)
        });
    }
    return data;
};

export const EvolutionModal: React.FC<EvolutionModalProps> = ({ onClose, totalValue }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1A');

  const chartData = useMemo(() => {
      const points = timeRange === '1M' ? 30 : timeRange === '6M' ? 6 : timeRange === '1A' ? 12 : 24;
      return generateHistoryData(points);
  }, [timeRange]);

  const currentStats = chartData[chartData.length - 1];
  const startStats = chartData[0];
  
  const totalGrowthValue = currentStats.total - startStats.total;
  const totalGrowthPercent = ((currentStats.total - startStats.total) / startStats.total) * 100;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-2xl animate-pop-in">
          <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">Período {label}</p>
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Patrimônio:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">R$ {payload[0].value.toLocaleString()}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Investido:</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">R$ {payload[1].value.toLocaleString()}</span>
             </div>
             <div className="mt-2 pt-2 border-t border-gray-200 dark:border-white/10 flex justify-between items-center">
                 <span className="text-[10px] font-bold text-emerald-500 uppercase">Lucro Acumulado</span>
                 <span className="text-xs font-bold text-emerald-500">+ R$ {(payload[0].value - payload[1].value).toLocaleString()}</span>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-[#0d0d0d]">
      <div className="w-full max-w-md h-full flex flex-col bg-gray-50 dark:bg-[#0d0d0d] relative animate-fade-in transition-colors">
        
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

            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-4 border border-gray-200 dark:border-white/5 shadow-xl h-80 relative mb-8 animate-pop-in">
                 <div className="absolute top-6 left-6 z-10">
                     <h3 className="text-gray-900 dark:text-white font-bold text-sm">Patrimônio vs. Investido</h3>
                 </div>
                 
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 40, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} tickFormatter={(val) => `R$${val/1000} mil`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fill="url(#colorTotal)" name="Patrimônio" />
                        <Area type="monotone" dataKey="invested" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorInvested)" name="Investido" />
                    </AreaChart>
                 </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
                 <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-xl p-5 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg">
                     <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 mb-3">
                         <Wallet size={20} />
                     </div>
                     <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">Total Investido</p>
                     <p className="text-gray-900 dark:text-white font-bold text-lg">R$ {currentStats.invested.toLocaleString()}</p>
                 </div>
                 
                 <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-xl p-5 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg">
                     <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3">
                         <TrendingUp size={20} />
                     </div>
                     <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest mb-1">Lucro de Capital</p>
                     <p className="text-emerald-500 font-bold text-lg">+ R$ {currentStats.profit.toLocaleString()}</p>
                 </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                 <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 px-2">Histórico Recente</h3>
                 <div className="space-y-3">
                     {[...chartData].reverse().slice(0, 6).map((month, idx) => (
                         <div key={idx} className="bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl border border-gray-200 dark:border-white/5 flex justify-between items-center shadow-sm">
                             <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#2c2c2e] flex items-center justify-center border border-gray-100 dark:border-white/5">
                                     <Calendar size={18} className="text-gray-400" />
                                 </div>
                                 <div>
                                     <p className="text-gray-900 dark:text-white font-bold text-sm">Mês {month.label}</p>
                                     <p className="text-gray-500 text-[10px]">Patrimônio Total</p>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-gray-900 dark:text-white font-bold text-sm">R$ {month.total.toLocaleString()}</p>
                                 <p className="text-emerald-500 text-[10px] font-bold flex items-center justify-end gap-0.5">
                                     <ArrowUpRight size={10} /> {((month.total - month.invested) > 0 ? '+' : '')} R$ {(month.total - month.invested).toLocaleString()}
                                 </p>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};
