
import React, { useState, memo } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, Maximize2, DollarSign, Layers } from 'lucide-react';
import { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  index: number;
  onClick: (asset: Asset) => void;
}

export const AssetCard = memo(({ asset, index, onClick }: AssetCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isPositiveDaily = asset.dailyChange >= 0;
  const profitabilityValue = asset.totalValue - asset.totalCost;
  const profitabilityPercent = (profitabilityValue / asset.totalCost) * 100;
  const isProfit = profitabilityValue >= 0;

  return (
    <div 
      style={{ animationDelay: `${index * 80}ms` }}
      className={`group relative overflow-hidden rounded-[1.75rem] bg-white dark:bg-[#1c1c1e] border shadow-sm transition-all duration-500 ease-out animate-entry opacity-0 fill-mode-forwards will-change-transform ${
          isExpanded 
          ? 'border-brand-500/40 shadow-2xl ring-1 ring-brand-500/20 scale-[1.02] z-20 opacity-100' 
          : 'border-gray-100 dark:border-white/5 hover:shadow-lg scale-100 z-10 opacity-[0.98] hover:opacity-100'
      }`}
    >
      <div 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="p-5 flex justify-between items-center relative z-10 cursor-pointer active:scale-[0.99] transition-transform duration-200"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-[10px] shadow-md transition-transform group-hover:scale-105 border border-white/10" style={{ backgroundColor: asset.color }}>
                {asset.shortName}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="font-bold text-base text-gray-900 dark:text-white tracking-tight leading-none">{asset.ticker}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">{asset.quantity} cotas • R$ {asset.currentPrice.toFixed(2)}</p>
          </div>
        </div>
        <div className="text-right">
            <h3 className="font-bold text-base text-gray-900 dark:text-white tabular-nums">R$ {asset.totalValue.toLocaleString('pt-BR')}</h3>
            <div className={`text-[10px] font-bold ${isPositiveDaily ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositiveDaily ? '+' : ''}{asset.dailyChange.toFixed(2)}%
            </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-2 animate-fade-in bg-gray-50/50 dark:bg-[#050505]/30 border-t border-gray-100 dark:border-white/5">
            <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-white dark:bg-[#2c2c2e]/50 p-3 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:border-brand-500/20">
                    <span className="text-[9px] font-bold uppercase text-gray-400 block mb-1">P. Médio</span>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">R$ {asset.averagePrice.toFixed(2)}</p>
                </div>
                <div className="bg-white dark:bg-[#2c2c2e]/50 p-3 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:border-brand-500/20">
                    <span className="text-[9px] font-bold uppercase text-gray-400 block mb-1">Rentab.</span>
                    <p className={`text-sm font-bold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>{isProfit ? '+' : ''}{profitabilityPercent.toFixed(1)}%</p>
                </div>
                <div className="bg-white dark:bg-[#2c2c2e]/50 p-3 rounded-2xl border border-gray-100 dark:border-white/5 transition-all hover:border-brand-500/20">
                    <span className="text-[9px] font-bold uppercase text-gray-400 block mb-1">Yield</span>
                    <p className="text-sm font-bold text-amber-500">{asset.dy12m}%</p>
                </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClick(asset); }} 
              className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-brand-500/20 hover:bg-brand-600"
            >
                <Maximize2 size={14} /> Detalhes Completos
            </button>
        </div>
      )}
    </div>
  );
}, (prev, next) => prev.asset.id === next.asset.id && prev.asset.totalValue === next.asset.totalValue);
