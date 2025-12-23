
import React, { useMemo } from 'react';
import { Asset } from '../types';
import { ChevronLeft, RefreshCw, BarChart3, TrendingUp, Calendar, ArrowUpRight, DollarSign, PieChart, X } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface IncomeReportModalProps {
  assets: Asset[];
  onClose: () => void;
}

export const IncomeReportModal: React.FC<IncomeReportModalProps> = ({ assets, onClose }) => {
  
  const stats = useMemo(() => {
    const currentMonthlyIncome = assets.reduce((acc, asset) => acc + (asset.lastDividend * asset.quantity), 0);
    const history = [];
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonthIndex = new Date().getMonth();
    
    let totalAccumulated = 0;
    for (let i = 0; i <= currentMonthIndex; i++) {
        const variation = 0.9 + Math.random() * 0.2;
        const growthFactor = 1 - ((currentMonthIndex - i) * 0.02); 
        const value = currentMonthlyIncome * variation * growthFactor;
        history.push({ name: months[i], value: value, isEstimated: false });
        totalAccumulated += value;
    }

    const topPayers = assets.map(asset => ({
        ticker: asset.ticker,
        monthly: asset.lastDividend * asset.quantity,
        share: 0,
        color: asset.color
    })).sort((a, b) => b.monthly - a.monthly).slice(0, 5);

    const totalTop = topPayers.reduce((acc, curr) => acc + curr.monthly, 0);
    topPayers.forEach(p => p.share = (p.monthly / currentMonthlyIncome) * 100);

    return { currentMonthlyIncome, totalAccumulated, history, topPayers, average: totalAccumulated / (currentMonthIndex + 1) };
  }, [assets]);

  return (
    <div className="fixed inset-0 md:left-72 z-[100] flex items-center justify-center pointer-events-auto bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-200 dark:border-white/5">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center">
             <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Relatório de Renda</h1>
             <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Dividendos & Proventos</p>
          </div>
          
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
             <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-6 py-8 w-full">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Main Section: Chart & Big Stats (Col 8) */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {/* Hero Cards Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="bg-amber-500 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-amber-500/20">
                                 <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                                 <p className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-2">Acumulado {new Date().getFullYear()}</p>
                                 <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-2">
                                     R$ {stats.totalAccumulated.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                 </h2>
                                 <div className="inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-lg">
                                    <TrendingUp size={14} className="text-white" />
                                    <span className="text-xs font-bold">+12.5% vs ano anterior</span>
                                 </div>
                             </div>

                             <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 shadow-xl flex flex-col justify-center">
                                 <div className="flex items-center gap-4 mb-4">
                                     <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                         <DollarSign size={24} />
                                     </div>
                                     <div>
                                         <p className="text-gray-400 text-[10px] font-bold uppercase">Média Mensal</p>
                                         <p className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.average.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                     </div>
                                 </div>
                                 <div className="h-px w-full bg-gray-100 dark:bg-white/5 my-2"></div>
                                 <div className="flex items-center justify-between">
                                     <span className="text-xs font-bold text-gray-500">Último Mês</span>
                                     <span className="text-xl font-bold text-emerald-500">R$ {stats.currentMonthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                 </div>
                             </div>
                        </div>

                        {/* Chart Section */}
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 shadow-xl flex-1 min-h-[400px]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <BarChart3 className="text-amber-500" /> Evolução de Proventos
                            </h3>
                            <div className="w-full h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="barColorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.6}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                                        <Tooltip 
                                            cursor={{ fill: '#88888810', radius: 8 }}
                                            contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                                            formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Proventos']}
                                        />
                                        <Bar 
                                            dataKey="value" 
                                            fill="url(#barColorIncome)" 
                                            radius={[6, 6, 6, 6]} 
                                            barSize={32}
                                            animationDuration={1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Top Payers (Col 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-6 border border-gray-200 dark:border-white/5 shadow-xl flex-1 flex flex-col">
                             <div className="flex items-center justify-between mb-6 px-2">
                                <h3 className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2">
                                    <PieChart size={20} className="text-amber-500" />
                                    Top Pagadores
                                </h3>
                             </div>

                             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                 {stats.topPayers.map((payer, idx) => (
                                     <div 
                                        key={payer.ticker} 
                                        className="bg-gray-50 dark:bg-[#2c2c2e]/40 p-5 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm transition-transform hover:scale-[1.02]"
                                     >
                                         <div className="flex items-center gap-4 flex-1">
                                             <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-md" style={{ backgroundColor: payer.color }}>
                                                 {payer.ticker.substring(0,4)}
                                             </div>
                                             <div className="flex-1">
                                                 <div className="flex justify-between items-baseline mb-1">
                                                     <span className="text-gray-900 dark:text-white font-bold">{payer.ticker}</span>
                                                 </div>
                                                 <div className="flex items-center gap-2">
                                                     <div className="h-2 w-20 bg-gray-200 dark:bg-[#0d0d0d] rounded-full overflow-hidden">
                                                         <div className="h-full rounded-full" style={{ width: `${payer.share}%`, backgroundColor: payer.color }}></div>
                                                     </div>
                                                     <span className="text-[10px] font-bold text-gray-500">{payer.share.toFixed(0)}%</span>
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <span className="block text-sm font-bold text-gray-900 dark:text-white">R$ {payer.monthly.toFixed(2)}</span>
                                             <span className="text-[10px] text-gray-400 font-bold uppercase">Mensal</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
