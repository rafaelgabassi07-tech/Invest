
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import { 
  ArrowUpRight, ArrowDownLeft, Search, Calendar, Download, 
  FileText, Edit2, TrendingUp, TrendingDown, Filter, Wallet, 
  ChevronRight, Plus
} from 'lucide-react';
import { 
  BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, CartesianGrid, Cell
} from 'recharts';
import { AddTransactionModal } from './AddTransactionModal';

interface TransactionsViewProps {
  transactions: Transaction[];
  onEditTransaction?: (transaction: Transaction) => void;
}

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

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions, onEditTransaction }) => {
  const [filterType, setFilterType] = useState<'all' | 'Compra' | 'Venda'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesType = filterType === 'all' ? true : t.type === filterType;
      const matchesSearch = t.ticker.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    }).sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
  }, [transactions, filterType, searchTerm]);

  const stats = useMemo(() => {
    const buy = filteredTransactions.filter(t => t.type === 'Compra').reduce((acc, t) => acc + t.total, 0);
    const sell = filteredTransactions.filter(t => t.type === 'Venda').reduce((acc, t) => acc + t.total, 0);
    return { buy, sell, net: sell - buy };
  }, [filteredTransactions]);

  const chartData = useMemo(() => {
    const grouped: Record<string, { month: string, buy: number, sell: number }> = {};
    const chronological = [...transactions].sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime());

    chronological.forEach(t => {
        const parts = t.date.split(' ');
        const key = `${parts[1]}`;
        if (!grouped[key]) grouped[key] = { month: key, buy: 0, sell: 0 };
        if (t.type === 'Compra') grouped[key].buy += t.total;
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
      
      {/* 1. Header Summary Section - More Compact */}
      <div className="px-6 pt-2 pb-2">
         <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                            <Wallet size={18} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest leading-none">Fluxo de Caixa</p>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                R$ {stats.net.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                    </div>
                    <button onClick={handleExport} className="w-9 h-9 rounded-full bg-white/50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all border border-white/20 dark:border-white/5">
                        {isExporting ? <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/> : <Download size={16} />}
                    </button>
                </div>

                <div className="h-28 w-full opacity-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barGap={4}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888815" />
                            <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#1c1c1e', borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                            <Bar dataKey="buy" fill="#10b981" radius={[2, 2, 0, 0]} barSize={12} name="Compras" />
                            <Bar dataKey="sell" fill="#f43f5e" radius={[2, 2, 0, 0]} barSize={12} name="Vendas" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
         </div>
      </div>

      {/* 2. Sticky Filters - Adjusted for dense scrolling */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl px-6 py-3 border-b border-gray-200/50 dark:border-white/5 space-y-3">
         <div className="flex gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Filtrar por ticker..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-[#1c1c1e] text-gray-900 dark:text-white pl-9 pr-4 py-2.5 rounded-2xl border border-transparent focus:border-brand-500/30 outline-none text-xs font-bold transition-all"
                />
             </div>
             <button className="w-10 rounded-2xl bg-gray-100 dark:bg-[#1c1c1e] flex items-center justify-center text-gray-400">
                 <Filter size={16} />
             </button>
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['all', 'Compra', 'Venda'].map((type) => (
                <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-4 py-1.5 text-[10px] font-extrabold rounded-full transition-all border uppercase tracking-wider ${
                        filterType === type 
                        ? 'bg-brand-primary text-black border-brand-primary shadow-lg shadow-brand-primary/20' 
                        : 'bg-transparent text-gray-500 border-gray-200 dark:border-white/10'
                    }`}
                >
                    {type === 'all' ? 'Tudo' : type}
                </button>
            ))}
         </div>
      </div>

      {/* 3. Grouped List Section */}
      <div className="px-6 mt-6 space-y-10">
         {(Object.entries(groupedList) as [string, Transaction[]][]).map(([dateGroup, items], groupIndex) => (
            <div key={dateGroup} className="animate-slide-up" style={{ animationDelay: `${groupIndex * 50}ms` }}>
                {/* Month/Year Label */}
                <div className="flex items-center gap-4 mb-5 sticky top-[115px] z-20 py-1 bg-white dark:bg-[#050505]">
                    <span className="text-gray-900 dark:text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        {dateGroup}
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary"></span>
                    </span>
                    <div className="h-px bg-gray-100 dark:bg-white/5 flex-1"></div>
                    <span className="text-gray-400 text-[10px] font-bold">{items.length} itens</span>
                </div>
                
                {/* Timeline Items */}
                <div className="relative pl-5 border-l border-gray-100 dark:border-white/5 space-y-3">
                    {items.map((t, idx) => (
                        <div 
                            key={t.id} 
                            onClick={() => setEditingTransaction(t)}
                            className="relative group cursor-pointer animate-entry"
                            style={{ animationDelay: `${idx * 30}ms` }}
                        >
                            {/* Dot on Line */}
                            <div className={`absolute -left-[25.5px] top-5 w-2.5 h-2.5 rounded-full border-2 bg-white dark:bg-[#050505] transition-transform group-hover:scale-125 z-10 ${
                                t.type === 'Compra' ? 'border-emerald-500' : 'border-rose-500'
                            }`}></div>

                            <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-md p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex justify-between items-center hover:border-brand-primary/30 transition-all active:scale-[0.99] group-hover:shadow-lg shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border ${
                                        t.type === 'Compra' 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                    }`}>
                                        {t.ticker.substring(0,2)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-gray-900 dark:text-white font-black text-sm">{t.ticker}</h4>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase border ${
                                                t.type === 'Compra' ? 'border-emerald-500/30 text-emerald-500' : 'border-rose-500/30 text-rose-500'
                                            }`}>
                                                {t.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-[10px] mt-0.5 font-bold">
                                            {t.quantity} un <span className="mx-1 text-gray-300 dark:text-gray-800">•</span> R$ {t.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-black text-sm tabular-nums ${t.type === 'Compra' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {t.type === 'Compra' ? '' : '-'} R$ {t.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <Calendar size={10} className="text-gray-400" />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{t.date.split(' ')[0]} {t.date.split(' ')[1]}</span>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 dark:text-gray-700 ml-2 group-hover:text-brand-primary transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         ))}

         {filteredTransactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-white/5 shadow-inner">
                    <FileText size={24} className="text-gray-300" />
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-sm">Nada por aqui</h3>
                <p className="text-gray-500 text-xs mt-1">Tente ajustar seus filtros ou busca.</p>
            </div>
         )}
      </div>

      {editingTransaction && (
          <AddTransactionModal 
             onClose={() => setEditingTransaction(null)}
             onSave={(t) => { if(onEditTransaction) onEditTransaction(t); setEditingTransaction(null); }}
             initialTransaction={editingTransaction}
          />
      )}
    </div>
  );
};
