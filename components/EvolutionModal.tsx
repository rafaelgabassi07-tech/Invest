
import React, { useMemo } from 'react';
import { ChevronLeft, TrendingUp, X } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../types';

interface EvolutionModalProps {
  onClose: () => void;
  totalValue: number;
  transactions?: Transaction[]; // Opcional, mas idealmente passado pelo pai
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({ onClose, totalValue, transactions = [] }) => {
  
  // Utiliza as transações passadas via props, ou tenta fallback local apenas se vazio
  const localTransactions = useMemo(() => {
      if (transactions && transactions.length > 0) return transactions;
      try {
          const saved = localStorage.getItem('invest_transactions');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  }, [transactions]);

  const chartData = useMemo(() => {
    if (localTransactions.length === 0) return [];
    
    // 1. Ordenar transações cronologicamente
    const sorted = [...localTransactions].sort((a: Transaction, b: Transaction) => {
        const parseDate = (d: string) => {
            const ms: {[k:string]:number} = {'Jan':0,'Fev':1,'Mar':2,'Abr':3,'Mai':4,'Jun':5,'Jul':6,'Ago':7,'Set':8,'Out':9,'Nov':10,'Dez':11};
            const p = d.split(' ');
            if(p.length < 3) return 0;
            return new Date(parseInt(p[2]), ms[p[1]] || 0, parseInt(p[0])).getTime();
        };
        return parseDate(a.date) - parseDate(b.date);
    });

    // 2. Acumular saldo patrimonial (Investido)
    let currentInvested = 0;
    const historyPoints: { date: string, value: number }[] = [];

    sorted.forEach((t: Transaction) => {
        // Lógica de Acúmulo: Compra aumenta base, Venda diminui base
        if (t.type === 'Compra') currentInvested += t.total;
        else currentInvested -= t.total;

        // Simplificação da data para o gráfico (Mês/Ano)
        const parts = t.date.split(' ');
        const shortDate = `${parts[1]}/${parts[2].slice(2)}`;
        
        historyPoints.push({
            date: shortDate,
            value: currentInvested,
        });
    });

    // Filtragem para evitar excesso de pontos (pega o último de cada mês)
    const filteredPoints: typeof historyPoints = [];
    const seenMonths = new Set();
    
    for (let i = historyPoints.length - 1; i >= 0; i--) {
        if (!seenMonths.has(historyPoints[i].date)) {
            filteredPoints.unshift(historyPoints[i]);
            seenMonths.add(historyPoints[i].date);
        }
    }
    
    return filteredPoints;
  }, [localTransactions]);

  const stats = useMemo(() => {
     const invested = localTransactions.filter((t: Transaction) => t.type === 'Compra').reduce((a: number, b: Transaction) => a + b.total, 0) - 
                      localTransactions.filter((t: Transaction) => t.type === 'Venda').reduce((a: number, b: Transaction) => a + b.total, 0);
     const profit = totalValue - invested;
     const profitPercent = invested > 0 ? (profit / invested) * 100 : 0;
     
     return { invested, profit, profitPercent };
  }, [localTransactions, totalValue]);

  return (
    <div className="fixed inset-0 left-0 md:left-72 z-[100] flex items-center justify-center pointer-events-auto bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center">
             <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Evolução Patrimonial</h1>
             <p className="text-[10px] text-brand-500 font-bold uppercase tracking-wider">Crescimento Histórico</p>
          </div>
          
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
             <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Investido (Custo)</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ {stats.invested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Valor Atual (Mercado)</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                    </div>
                    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg">
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Resultado Líquido</p>
                        <div className="flex items-center gap-2">
                            <h3 className={`text-2xl font-bold ${stats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {stats.profit >= 0 ? '+' : ''}R$ {stats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                            <span className={`text-xs font-bold px-2 py-1 rounded-lg ${stats.profit >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {stats.profitPercent.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden min-h-[350px] mb-20 md:mb-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 px-2">
                        <TrendingUp className="text-brand-500" />
                        Curva de Aportes
                    </h3>
                    
                    <div className="w-full h-[300px] md:h-[350px] -ml-2">
                        {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEvol" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} minTickGap={30} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Investido Acumulado']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="var(--brand-primary)" 
                                    strokeWidth={3} 
                                    fill="url(#colorEvol)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                                <TrendingUp size={48} className="text-gray-400 mb-4" />
                                <p className="text-gray-500 font-bold">Sem dados suficientes para o gráfico</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
