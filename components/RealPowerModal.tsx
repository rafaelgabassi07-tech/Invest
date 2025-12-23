
import React from 'react';
import { ChevronLeft, ShieldCheck, TrendingUp, AlertCircle, BarChart3, X } from 'lucide-react';
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
    <div className="fixed inset-0 md:left-72 z-[100] flex items-center justify-center pointer-events-auto bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in overflow-hidden">
        
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
          
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
             <X size={24} />
          </button>
        </div>

        {/* Content - Full Screen Layout */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-6 py-8 w-full">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    {/* Left Column: Stats */}
                    <div className="space-y-6 flex flex-col">
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden animate-slide-up flex-1 flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                            
                            <div className="relative z-10 text-center py-10">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Ganho Real Acumulado (12m)</p>
                                <h2 className="text-7xl lg:text-8xl font-bold text-gray-900 dark:text-white tracking-tighter mb-6">
                                    +{accumulatedReal.toFixed(2)}%
                                </h2>
                                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
                                    <TrendingUp size={16} className="text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-500 font-bold text-sm">Acima da Inflação</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10 mt-8">
                                <div className="bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-3xl p-6 border border-gray-100 dark:border-white/5 text-center">
                                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">Rentabilidade Nominal</p>
                                    <p className="text-indigo-500 font-bold text-2xl lg:text-3xl">+{accumulatedNominal.toFixed(2)}%</p>
                                </div>
                                <div className="bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-3xl p-6 border border-gray-100 dark:border-white/5 text-center">
                                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">Inflação (IPCA)</p>
                                    <p className="text-rose-500 font-bold text-2xl lg:text-3xl">-{accumulatedInflation.toFixed(2)}%</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 bg-amber-500/5 border border-amber-500/10 p-6 rounded-[2rem]">
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                                <AlertCircle size={20} className="text-amber-500" />
                            </div>
                            <div>
                                <h4 className="text-amber-500 font-bold text-sm mb-1">Entenda o Ganho Real</h4>
                                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                                    O ganho real é o que realmente importa para o crescimento do seu patrimônio. Ele desconta a inflação (IPCA) da sua rentabilidade nominal, mostrando o aumento efetivo do seu poder de compra.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Chart */}
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 shadow-lg flex flex-col min-h-[500px] lg:h-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="text-emerald-500" size={20}/>
                                Histórico de Rentabilidade
                            </h3>
                            <div className="flex gap-2">
                                {['12m', '24m', 'Total'].map(range => (
                                    <button key={range} className="px-3 py-1 text-[10px] font-bold rounded-lg bg-gray-100 dark:bg-[#2c2c2e] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 w-full flex items-center justify-center bg-gray-50/50 dark:bg-[#2c2c2e]/20 rounded-3xl border border-gray-100 dark:border-white/5 relative">
                            {!hasData ? (
                                <div className="text-center opacity-40">
                                    <BarChart3 size={48} className="mx-auto mb-3 text-gray-500" />
                                    <p className="text-sm font-bold text-gray-500">Dados insuficientes para o período</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={historyData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                                        <Area type="monotone" dataKey="yield" name="Rentabilidade" stroke="#10b981" strokeWidth={3} fill="url(#colorYield)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
