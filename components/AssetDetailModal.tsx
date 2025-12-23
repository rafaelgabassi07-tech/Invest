
import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, TrendingUp, RefreshCw, ChevronLeft, Calendar, Building2, BarChart2, 
  Wallet, Info, FileText, Scale, Percent, Briefcase, Activity, 
  Landmark, Target, ArrowUpRight, ArrowDownRight, Scroll, Globe, Mail, Users, Download, File
} from 'lucide-react';
import { AreaChart, Area, Cell, ResponsiveContainer, Tooltip, XAxis, CartesianGrid, LineChart, Line, YAxis } from 'recharts';
import { Asset, Dividend, Transaction } from '../types';
import { fetchHistoricalData } from '../services/brapiService';

interface AssetDetailModalProps {
  asset: Asset;
  transactions?: Transaction[]; 
  onClose: () => void;
}

type TabType = 'overview' | 'dividends' | 'history' | 'compare' | 'about' | 'docs';

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, transactions = [], onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [realHistory, setRealHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      const data = await fetchHistoricalData(asset.ticker);
      setRealHistory(data);
      setIsLoadingHistory(false);
    };
    loadHistory();
  }, [asset.ticker]);

  const assetTransactions = transactions.filter(t => t.ticker === asset.ticker);
  const isFii = ['FII', 'FIAGRO'].includes(asset.assetType.toUpperCase());
  
  const min52 = asset.min52w || asset.currentPrice * 0.9;
  const max52 = asset.max52w || asset.currentPrice * 1.1;
  const currentPos = ((asset.currentPrice - min52) / (max52 - min52)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />

      <div className="bg-white dark:bg-brand-muted w-full h-full md:w-full md:max-w-lg md:h-[85vh] md:rounded-[2.5rem] flex flex-col relative z-10 shadow-2xl animate-slide-up overflow-hidden md:border border-gray-200 dark:border-white/10 transition-all duration-500">
        
        <div className="flex w-full justify-center pt-3 pb-1 md:hidden">
            <div className="w-12 h-1.5 rounded-full bg-gray-200 dark:bg-white/10"></div>
        </div>

        <div className="px-6 py-4 bg-white/95 dark:bg-brand-muted border-b border-gray-100 dark:border-white/5 z-30">
          <div className="flex justify-between items-center mb-6">
             <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90 border border-gray-200 dark:border-white/5">
               <ChevronLeft size={22} />
             </button>
             <div className="flex flex-col items-center">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">{asset.ticker}</h2>
                <span className="text-brand-primary text-[10px] font-bold uppercase tracking-widest mt-1">{asset.assetType}</span>
             </div>
             <button className="w-10 h-10 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-white/50 border border-gray-200 dark:border-white/5">
               <RefreshCw size={18} className={isLoadingHistory ? 'animate-spin' : ''} />
             </button>
          </div>

          <div className="mb-4 flex justify-between items-end bg-gray-50 dark:bg-white/[0.03] p-5 rounded-[1.75rem] border border-gray-200 dark:border-white/5">
            <div>
                <p className="text-gray-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1.5">Preço Atual</p>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white leading-none tracking-tight tabular-nums">
                    R$ {asset.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h1>
            </div>
            <div className="text-right">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-sm ${asset.dailyChange >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                    {asset.dailyChange > 0 ? '▲' : '▼'} {Math.abs(asset.dailyChange).toFixed(2)}%
                </div>
            </div>
          </div>
          
          <div className="flex overflow-x-auto custom-scrollbar gap-1 p-1 bg-gray-100 dark:bg-white/[0.05] rounded-xl no-scrollbar">
            {(['overview', 'dividends', 'history', 'compare', 'about', 'docs'] as TabType[]).map((tab) => {
                const isActive = activeTab === tab;
                const labels: Record<TabType, string> = {
                  overview: 'Geral', dividends: 'Proventos', history: 'Extrato', 
                  compare: 'Evolução', about: 'Sobre', docs: 'Documentos'
                };
                return (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-none px-4 py-2 text-[11px] font-bold rounded-lg transition-all ${isActive ? 'bg-white dark:bg-brand-primary text-gray-900 dark:text-black shadow-sm' : 'text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70'}`}>
                      {labels[tab]}
                    </button>
                );
            })}
          </div>
        </div>

        <div key={activeTab} className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar flex flex-col bg-white dark:bg-brand-muted animate-fade-in pb-10">
          
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-gray-50 dark:bg-white/[0.03] rounded-[1.75rem] p-5 border border-gray-200 dark:border-white/5">
                 <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-900 dark:text-white/80 mb-4">Gráfico Real de Preços</h3>
                 <div className="h-40 w-full">
                    {isLoadingHistory ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100/50 dark:bg-white/5 rounded-xl animate-pulse">
                         <TrendingUp className="text-gray-400 animate-bounce" />
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={realHistory}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="price" stroke="var(--brand-primary)" strokeWidth={3} fill="url(#colorPrice)" dot={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                         </AreaChart>
                      </ResponsiveContainer>
                    )}
                 </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 bg-gray-50 dark:bg-white/[0.03] p-5 rounded-[1.5rem] border border-gray-200 dark:border-white/5">
                <div className="space-y-1">
                    <span className="text-gray-400 dark:text-white/30 text-[9px] font-bold uppercase block">P / VP</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">{asset.pvp.toFixed(2)}</span>
                </div>
                <div className="space-y-1">
                    <span className="text-gray-400 dark:text-white/30 text-[9px] font-bold uppercase block">D.Y. (12m)</span>
                    <span className="text-base font-bold text-brand-primary">{asset.dy12m.toFixed(2)}%</span>
                </div>
                <div className="space-y-1">
                    <span className="text-gray-400 dark:text-white/30 text-[9px] font-bold uppercase block">Liquidez</span>
                    <span className="text-base font-bold text-gray-900 dark:text-white">{asset.liquidity}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {assetTransactions.length > 0 ? assetTransactions.map((trans) => (
                <div key={trans.id} className="bg-gray-50 dark:bg-white/[0.03] p-4 rounded-2xl border border-gray-200 dark:border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trans.type === 'Compra' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {trans.type === 'Compra' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-sm">{trans.type}</h4>
                      <p className="text-gray-400 dark:text-white/30 text-[10px] font-bold uppercase">{trans.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 dark:text-white font-bold text-sm">R$ {trans.total.toLocaleString('pt-BR')}</p>
                    <p className="text-gray-500 dark:text-white/40 text-[10px]">{trans.quantity} cotas</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center opacity-40">
                  <FileText size={48} className="mx-auto mb-4" />
                  <p className="text-sm font-bold">Nenhuma movimentação</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
