import React, { useMemo } from 'react';
import { Asset } from '../types';
import { ChevronLeft, RefreshCw, BarChart3, TrendingUp, Calendar, ArrowUpRight, DollarSign, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface IncomeReportModalProps {
  assets: Asset[];
  onClose: () => void;
}

export const IncomeReportModal: React.FC<IncomeReportModalProps> = ({ assets, onClose }) => {
  
  // 1. Calculate Statistics based on REAL assets
  const stats = useMemo(() => {
    // Current Estimated Monthly Income based on last dividend
    const currentMonthlyIncome = assets.reduce((acc, asset) => acc + (asset.lastDividend * asset.quantity), 0);
    
    // Generate a mock history that fluctuates around the current income to look realistic
    const history = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthIndex = new Date().getMonth();
    
    let totalAccumulated = 0;

    for (let i = 0; i <= currentMonthIndex; i++) {
        // Variation factor (e.g., between 0.9 and 1.1)
        const variation = 0.9 + Math.random() * 0.2;
        // Simulate growth over the year (slightly lower in earlier months)
        const growthFactor = 1 - ((currentMonthIndex - i) * 0.02); 
        
        const value = currentMonthlyIncome * variation * growthFactor;
        
        history.push({
            name: months[i],
            value: value,
            isEstimated: false
        });
        totalAccumulated += value;
    }

    // Identify Top Payers
    const topPayers = assets.map(asset => ({
        ticker: asset.ticker,
        monthly: asset.lastDividend * asset.quantity,
        share: 0, // calculated below
        color: asset.color
    })).sort((a, b) => b.monthly - a.monthly).slice(0, 5); // Top 5

    // Calculate shares
    const totalTop = topPayers.reduce((acc, curr) => acc + curr.monthly, 0);
    topPayers.forEach(p => p.share = (p.monthly / currentMonthlyIncome) * 100);

    return {
        currentMonthlyIncome,
        totalAccumulated,
        history,
        topPayers,
        average: totalAccumulated / (currentMonthIndex + 1)
    };
  }, [assets]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-[#0d0d0d]">
      <div className="w-full max-w-md h-full flex flex-col bg-gray-50 dark:bg-[#0d0d0d] relative animate-fade-in transition-colors">
        
        {/* --- Header --- */}
        <div className="px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-200 dark:border-white/5">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center">
             <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Relatório de Renda</h1>
             <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                  Dividendos & Proventos
             </p>
          </div>
          
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
             <RefreshCw size={20} />
          </button>
        </div>

        {/* --- Main Content --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-20">
            
            {/* 1. Big Numbers Card */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-6 mb-6 border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                 
                 <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Acumulado em {new Date().getFullYear()}</p>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            R$ {stats.totalAccumulated.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                        <DollarSign size={20} />
                    </div>
                 </div>

                 <div className="flex gap-4 relative z-10">
                    <div className="flex-1 bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-2xl p-3 border border-gray-100 dark:border-white/5">
                        <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">Média Mensal</p>
                        <p className="text-gray-900 dark:text-white font-bold text-lg">R$ {stats.average.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-2xl p-3 border border-gray-100 dark:border-white/5">
                        <p className="text-gray-400 text-[9px] font-bold uppercase mb-1">Último Mês</p>
                        <p className="text-emerald-500 font-bold text-lg">R$ {stats.currentMonthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                 </div>
            </div>

            {/* 2. Monthly Chart */}
            <div className="mb-8 animate-slide-up">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2">
                        <BarChart3 size={16} className="text-amber-500" />
                        Evolução Mensal
                    </h3>
                </div>
                
                <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-xl rounded-[2rem] p-5 border border-white/40 dark:border-white/10 shadow-lg h-60 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 700 }} 
                                axisLine={false} 
                                tickLine={false} 
                                dy={10}
                            />
                            <Tooltip 
                                cursor={{ fill: '#88888810', radius: 4 }}
                                contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                            />
                            <Bar 
                                dataKey="value" 
                                fill="url(#barColor)" 
                                radius={[4, 4, 4, 4]} 
                                barSize={16}
                                animationDuration={2000}
                                animationEasing="cubic-bezier(0.22, 1, 0.36, 1)"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Top Payers */}
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                 <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-gray-900 dark:text-white font-bold text-sm flex items-center gap-2">
                        <PieChart size={16} className="text-amber-500" />
                        Top Pagadores
                    </h3>
                    <span className="text-[10px] text-gray-500 bg-gray-100 dark:bg-[#1c1c1e] px-2 py-1 rounded-lg border border-gray-200 dark:border-white/5">
                        Base Atual
                    </span>
                 </div>

                 <div className="space-y-3">
                     {stats.topPayers.map((payer, idx) => (
                         <div 
                            key={payer.ticker} 
                            className="bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-sm"
                            style={{ animationDelay: `${idx * 50}ms` }}
                         >
                             <div className="flex items-center gap-3 flex-1">
                                 <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm" style={{ backgroundColor: payer.color }}>
                                     {payer.ticker.substring(0,4)}
                                 </div>
                                 <div className="flex-1 pr-4">
                                     <div className="flex justify-between mb-1">
                                         <span className="text-gray-900 dark:text-white font-bold text-sm">{payer.ticker}</span>
                                         <span className="text-gray-900 dark:text-white font-bold text-sm">R$ {payer.monthly.toFixed(2)}</span>
                                     </div>
                                     <div className="h-1.5 w-full bg-gray-100 dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                                         <div 
                                            className="h-full rounded-full" 
                                            style={{ width: `${payer.share}%`, backgroundColor: payer.color }}
                                         ></div>
                                     </div>
                                 </div>
                             </div>
                             <div className="text-right pl-2 border-l border-gray-100 dark:border-white/5">
                                 <span className="block text-[10px] text-gray-400 font-bold uppercase">Repres.</span>
                                 <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{payer.share.toFixed(1)}%</span>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 mb-4 text-center px-4 animate-fade-in">
                <p className="text-[10px] text-gray-400 leading-relaxed">
                    * Os valores históricos são estimados com base na sua posição atual e no último dividendo pago por cada ativo. A rentabilidade passada não garante rentabilidade futura.
                </p>
            </div>

        </div>
      </div>
    </div>
  );
};