
import React from 'react';
import { ChevronLeft, ShieldCheck, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealPowerModalProps {
  onClose: () => void;
}

// Sem dados iniciais
const historyData: any[] = [];

export const RealPowerModal: React.FC<RealPowerModalProps> = ({ onClose }) => {
  const accumulatedNominal = 0;
  const accumulatedInflation = 0;
  const accumulatedReal = 0;
  const hasData = historyData.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="w-full h-full md:w-full md:max-w-md md:h-[85vh] flex flex-col bg-gray-50 dark:bg-[#0d0d0d] relative z-10 md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up transition-colors md:border border-gray-200 dark:border-white/5">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center">
             <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Poder Real</h1>
             <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                  Proteção contra Inflação
             </p>
          </div>
          
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
             <ShieldCheck size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-20">
            
            {/* Hero Card */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-6 mb-6 border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden animate-pop-in">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                 
                 <div className="relative z-10 text-center mb-6">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Ganho Real Acumulado (12m)</p>
                    <h2 className="text-5xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                        +{accumulatedReal.toFixed(2)}%
                    </h2>
                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                         <TrendingUp size={14} className="text-emerald-500" />
                         <span className="text-emerald-600 dark:text-emerald-500 font-bold text-sm">Acima da Inflação</span>
                    </div>
                 </div>

                 <div className="flex gap-4 relative z-10">
                    <div className="flex-1 bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-2xl p-3 border border-gray-100 dark:border-white/5 text-center">
                        <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">Rentabilidade</p>
                        <p className="text-indigo-500 font-bold text-lg">+{accumulatedNominal.toFixed(2)}%</p>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-2xl p-3 border border-gray-100 dark:border-white/5 text-center">
                        <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">Inflação (IPCA)</p>
                        <p className="text-rose-500 font-bold text-lg">-{accumulatedInflation.toFixed(2)}%</p>
                    </div>
                 </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-5 mb-6 border border-gray-200 dark:border-white/5 shadow-lg animate-slide-up flex items-center justify-center h-56">
                {!hasData ? (
                    <div className="text-center opacity-40">
                         <BarChart3 size={32} className="mx-auto mb-2 text-gray-500" />
                         <p className="text-xs font-bold text-gray-500">Dados insuficientes</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={historyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="yield" name="Rentabilidade" stroke="#6366f1" strokeWidth={2} fill="url(#colorYield)" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl animate-fade-in">
                 <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                 <div>
                     <h4 className="text-amber-500 font-bold text-xs mb-1">Entenda o Ganho Real</h4>
                     <p className="text-gray-500 dark:text-gray-400 text-[10px] leading-relaxed">
                        O ganho real é o que realmente importa para o crescimento do seu patrimônio. Ele desconta a inflação (IPCA) da sua rentabilidade nominal, mostrando o aumento efetivo do seu poder de compra.
                     </p>
                 </div>
            </div>

        </div>
      </div>
    </div>
  );
};
