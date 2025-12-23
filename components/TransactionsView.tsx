
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { 
  Search, Calendar, Download, FileText, 
  ChevronRight, ArrowUpRight, ArrowDownRight, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, Tooltip, ResponsiveContainer
} from 'recharts';

const parseDate = (dateStr: string) => {
  const months: { [key: string]: number } = {
    'Jan': 0, 'Fev': 1, 'Mar': 2, 'Abr': 3, 'Mai': 4, 'Jun': 5,
    'Jul': 6, 'Ago': 7, 'Set': 8, 'Out': 9, 'Nov': 10, 'Dez': 11
  };
  const parts = dateStr.split(' ');
  if (parts.length < 3) return new Date();
  const day = parseInt(parts[0]);
  const month = months[parts[1]] || 0;
  const year = parseInt(parts[2]);
  return new Date(year, month, day);
};

interface TransactionsViewProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onEditTransaction }) => {
  const [filterType, setFilterType] = useState<'all' | 'Compra' | 'Venda'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'all' ? true : t.type === filterType;
      const matchesSearch = t.ticker.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    }).sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  }, [transactions, filterType, searchTerm]);

  const stats = useMemo(() => {
    const buy = transactions.filter(t => t.type === 'Compra').reduce((acc, t) => acc + t.total, 0);
    const sell = transactions.filter(t => t.type === 'Venda').reduce((acc, t) => acc + t.total, 0);
    // Lógica Patrimonial: Compra aumenta patrimônio (+), Venda diminui (-)
    const netInvestment = buy - sell;
    return { buy, sell, netInvestment };
  }, [transactions]);

  const chartData = useMemo(() => {
    const grouped: Record<string, { month: string, buy: number, sell: number }> = {};
    const chronological = [...transactions].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

    chronological.forEach(t => {
        const parts = t.date.split(' ');
        const key = `${parts[1]}`;
        if (!grouped[key]) grouped[key] = { month: key, buy: 0, sell: 0 };
        // Compra (Positivo visualmente no gráfico de volume)
        if (t.type === 'Compra') grouped[key].buy += t.total;
        // Venda
        if (t.type === 'Venda') grouped[key].sell += t.total;
    });
    return Object.values(grouped).slice(-6);
  }, [transactions]);

  const groupedList = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filteredTransactions.forEach(t => {
        const parts = t.date.split(' ');
        const monthYear = `${parts[1]} ${parts[2]}`;
        if (!groups[monthYear]) groups[monthYear] = [];
        groups[monthYear].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
        const headers = "Data,Ticker,Tipo,Quantidade,Preço,Total\n";
        const rows = filteredTransactions.map(t => `${t.date},${t.ticker},${t.type},${t.quantity},${t.price},${t.total}`).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI("data:text/csv;charset=utf-8," + headers + rows));
        link.setAttribute("download", "extrato_invest.csv");
        link.click();
        setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="animate-fade-in pb-32">
      <div className="px-6 pt-2 pb-6 space-y-4">
         <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-brand-500" />
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Investimento Líquido</p>
                    </div>
                    <h2 className={`text-3xl font-bold ${stats.netInvestment >= 0 ? 'text-gray-900 dark:text-white' : 'text-rose-500'}`}>
                        R$ {stats.netInvestment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h2>
                </div>
                <button onClick={handleExport} className="w-10 h-10 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-white/20 dark:border-white/5">
                    {isExporting ? <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/> : <Download size={18} />}
                </button>
             </div>
             
             <div className="flex items-center gap-6">
                 <div>
                     <div className="flex items-center gap-1.5 mb-1">
                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                         <span className="text-[10px] font-bold text-gray-500 uppercase">Aportes (Compras)</span>
                     </div>
                     <span className="text-sm font-bold text-emerald-500">+ R$ {stats.buy.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                 </div>
                 <div>
                     <div className="flex items-center gap-1.5 mb-1">
                         <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                         <span className="text-[10px] font-bold text-gray-500 uppercase">Retiradas (Vendas)</span>
                     </div>
                     <span className="text-sm font-bold text-rose-500">- R$ {stats.sell.toLocaleString('pt-BR', { notation: 'compact' })}</span>
                 </div>
             </div>

             <div className="h-24 w-full mt-4 opacity-90">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barGap={4}>
                         <Bar dataKey="buy" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                         <Bar dataKey="sell" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                         <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ backgroundColor: '#1c1c1e', borderRadius: '8px', border: 'none', fontSize: '10px' }}
                            formatter={(value: number, name: string) => [`R$ ${value.toLocaleString('pt-BR')}`, name === 'buy' ? 'Aportes' : 'Vendas']}
                         />
                    </BarChart>
                </ResponsiveContainer>
             </div>
         </div>
      </div>

      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl px-6 py-3 border-b border-gray-200/50 dark:border-white/5 space-y-3">
         <div className="flex gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Buscar ticker..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#1c1c1e] text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-2xl border border-transparent focus:border-brand-500/30 outline-none text-xs font-bold transition-all"
                />
             </div>
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['all', 'Compra', 'Venda'].map((type) => (
                <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-4 py-1.5 text-[10px] font-extrabold rounded-full transition-all border uppercase tracking-wider ${
                        filterType === type 
                        ? 'bg-brand-500 text-white border-brand-500 shadow-md' 
                        : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                >
                    {type === 'all' ? 'Tudo' : type === 'Compra' ? 'Entradas (+)' : 'Saídas (-)'}
                </button>
            ))}
         </div>
      </div>

      <div className="px-6 mt-6 space-y-8">
         {(Object.entries(groupedList) as [string, Transaction[]][]).map(([dateGroup, items], groupIndex) => (
            <div key={dateGroup} className="animate-slide-up" style={{ animationDelay: `${groupIndex * 50}ms` }}>
                <div className="flex items-center gap-3 mb-4 sticky top-[110px] z-20 py-2 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-sm">
                    <Calendar size={12} className="text-brand-500" />
                    <span className="text-gray-900 dark:text-white text-xs font-black uppercase tracking-[0.1em]">
                        {dateGroup}
                    </span>
                    <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                </div>
                
                <div className="space-y-3">
                    {items.map((t, idx) => (
                        <div 
                            key={t.id} 
                            onClick={() => onEditTransaction && onEditTransaction(t)}
                            className="group cursor-pointer animate-entry relative overflow-hidden bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]"
                            style={{ animationDelay: `${idx * 30}ms` }}
                        >
                            {/* Linha indicadora lateral: Verde para Compra, Vermelho para Venda */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.type === 'Compra' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

                            <div className="flex justify-between items-center pl-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
                                        t.type === 'Compra' 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                    }`}>
                                        {/* Seta para Cima em Compra (Aumento de posição), Seta para Baixo em Venda */}
                                        {t.type === 'Compra' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-gray-900 dark:text-white font-black text-sm">{t.ticker}</h4>
                                            <span className="text-[10px] text-gray-400 font-bold bg-gray-100 dark:bg-white/5 px-1.5 rounded">{t.date.split(' ')[0]}</span>
                                        </div>
                                        <p className="text-gray-500 text-[10px] mt-0.5 font-bold">
                                            {t.quantity} un x R$ {t.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <p className={`font-black text-sm tabular-nums ${t.type === 'Compra' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {t.type === 'Compra' ? '+' : '-'} R$ {t.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[9px] text-brand-500 font-bold uppercase">Editar</span>
                                        <ChevronRight size={10} className="text-brand-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         ))}

         {filteredTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                <FileText size={48} className="text-gray-300 mb-4" />
                <h3 className="text-gray-900 dark:text-white font-bold text-sm">Sem movimentações</h3>
                <p className="text-gray-500 text-xs mt-1">Toque no + para começar.</p>
            </div>
         )}
      </div>
    </div>
  );
};
