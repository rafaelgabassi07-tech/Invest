
import React, { useState, useMemo } from 'react';
import { AssetCard } from './AssetCard.jsx';
import { Wallet as WalletIcon, ArrowDown, ArrowUp, PlusCircle } from 'lucide-react';

export const WalletView = ({ assets, onAssetClick }) => {
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedAssets = useMemo(() => {
    if (!assets) return [];
    return [...assets].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'value':
          comparison = a.totalValue - b.totalValue;
          break;
        case 'name':
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case 'change':
          comparison = a.dailyChange - b.dailyChange;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [assets, sortBy, sortOrder]);

  const totalWalletValue = assets?.reduce((acc, curr) => acc + (curr.totalValue || 0), 0) || 0;
  const weightedDailyChange = totalWalletValue > 0 
    ? assets.reduce((acc, curr) => acc + ((curr.dailyChange || 0) * (curr.totalValue || 0)), 0) / totalWalletValue 
    : 0;

  const toggleSort = (option) => {
    if (sortBy === option) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(option);
      setSortOrder('desc');
    }
  };

  const SortButton = ({ option, label }) => {
    const isActive = sortBy === option;
    return (
      <button 
        onClick={() => toggleSort(option)}
        className={`px-4 py-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
            isActive 
            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 ring-1 ring-brand-400/50' 
            : 'bg-white/50 dark:bg-[#2c2c2e]/50 backdrop-blur-md text-gray-600 dark:text-gray-400 border border-white/20 dark:border-white/5 hover:bg-white/80 dark:hover:bg-[#3a3a3c] hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        {label}
        {isActive && (
            sortOrder === 'desc' ? <ArrowDown size={12} strokeWidth={3} /> : <ArrowUp size={12} strokeWidth={3} />
        )}
      </button>
    );
  };

  return (
    <div className="pb-32">
       <div className="px-6 pt-2 pb-3 relative z-10 transition-colors">
         <div className="bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-white/40 dark:border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>
            
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-600 dark:text-brand-500 border border-brand-500/20 shadow-sm backdrop-blur-sm">
                            <WalletIcon size={20} />
                        </div>
                        <div>
                            <span className="text-gray-900 dark:text-white font-bold text-sm block leading-none">Patrimônio</span>
                            <span className="text-gray-500 text-[10px] font-medium block mt-0.5">Em Ativos</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
                        R$ {totalWalletValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h1>
                </div>
            </div>

            <div className="mt-2 flex items-center gap-3">
                 <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 backdrop-blur-sm ${weightedDailyChange >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-500'}`}>
                    {weightedDailyChange >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                    <span className="text-xs font-bold">{Math.abs(weightedDailyChange).toFixed(2)}% hoje</span>
                 </div>
                 <span className="text-gray-500 text-[10px] font-medium bg-white/40 dark:bg-[#2c2c2e]/40 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20 dark:border-white/5">{assets?.length || 0} ativos</span>
            </div>
         </div>
       </div>

       <div className="sticky top-0 z-20 bg-white/60 dark:bg-[#050505]/60 backdrop-blur-xl border-b border-white/40 dark:border-white/5 py-3 px-6 mb-3 flex items-center gap-3 overflow-x-auto custom-scrollbar transition-colors">
          <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mr-1">Ordenar:</span>
          <SortButton option="value" label="Valor" />
          <SortButton option="change" label="Variação" />
          <SortButton option="name" label="Nome" />
       </div>
       
       <div className="px-4 space-y-2 min-h-[50vh]">
         {sortedAssets.length > 0 ? sortedAssets.map((asset, index) => (
           <AssetCard 
             key={asset.id} 
             asset={asset} 
             index={index}
             onClick={onAssetClick}
           />
         )) : (
            <div className="flex flex-col items-center justify-center py-16 opacity-60 animate-fade-in">
                <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-gray-200 dark:border-white/5 shadow-inner">
                    <PlusCircle size={24} className="text-gray-400" />
                </div>
                <h3 className="text-gray-900 dark:text-white font-bold text-sm">Carteira Vazia</h3>
                <p className="text-gray-500 text-xs mt-1 text-center max-w-[200px]">
                    Toque no botão "+" no topo para adicionar sua primeira transação.
                </p>
            </div>
         )}
       </div>
    </div>
  );
};
