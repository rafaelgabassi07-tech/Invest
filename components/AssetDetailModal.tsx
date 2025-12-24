
import React, { useState, useEffect } from 'react';
import { 
  X, TrendingUp, RefreshCw, ChevronLeft, ArrowUpRight, ArrowDownRight, FileText, Sparkles, Bot
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Asset, Transaction } from '../types';
import { fetchHistoricalData } from '../services/brapiService';
import { analyzeAsset } from '../services/geminiService';

interface AssetDetailModalProps {
  asset: Asset;
  transactions?: Transaction[]; 
  onClose: () => void;
}

type TabType = 'overview' | 'ai_analysis' | 'dividends' | 'history' | 'compare' | 'about';

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({ asset, transactions = [], onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [realHistory, setRealHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      const data = await fetchHistoricalData(asset.ticker);
      setRealHistory(data);
      setIsLoadingHistory(false);
    };
    loadHistory();
  }, [asset.ticker]);

  // Carrega análise IA quando entra na aba
  useEffect(() => {
    if (activeTab === 'ai_analysis' && !aiAnalysis && !isAiLoading) {
        const loadAnalysis = async () => {
            setIsAiLoading(true);
            const text = await analyzeAsset(asset);
            setAiAnalysis(text);
            setIsAiLoading(false);
        };
        loadAnalysis();
    }
  }, [activeTab, asset, aiAnalysis, isAiLoading]);

  const assetTransactions = transactions.filter(t => t.ticker === asset.ticker);

  return (
    <div className="fixed inset-0 left-0 md:left-72 z-[100] flex items-center justify-center pointer-events-auto bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
             <div className="flex items-center gap-3 md:gap-4">
                 <button onClick={onClose} className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90">
                   <ChevronLeft size={22} />
                 </button>
                 <div>
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none flex items-center gap-2">
                        {asset.ticker}
                        <span className="text-[9px] md:text-[10px] bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-md uppercase font-bold tracking-wide">{asset.assetType}</span>
                    </h2>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[150px] md:max-w-none">{asset.companyName}</p>
                 </div>
             </div>

             <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-[#1c1c1e] p-1 rounded-xl">
                {(['overview', 'ai_analysis', 'history'] as TabType[]).map((tab) => {
                    const isActive = activeTab === tab;
                    const labels: Record<string, any> = { 
                        overview: 'Geral', 
                        ai_analysis: <div className="flex items-center gap-1"><Sparkles size={12} /> IA Insight</div>, 
                        history: 'Histórico' 
                    };
                    return (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${isActive ? 'bg-white dark:bg-brand-primary text-gray-900 dark:text-black shadow-sm' : 'text-gray-500 dark:text-white/40 hover:text-gray-800 dark:hover:text-white/70'}`}
                        >
                          {labels[tab] || tab}
                        </button>
                    );
                })}
             </div>

             <div className="flex items-center gap-2 md:gap-3">
                 <button className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/5">
                   <RefreshCw size={18} className={isLoadingHistory ? 'animate-spin' : ''} />
                 </button>
                 <button onClick={onClose} className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 border border-gray-200 dark:border-white/5">
                   <X size={22} />
                 </button>
             </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-[#0d0d0d]">
           <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full h-full">
              
              {/* Mobile Tabs */}
              <div className="md:hidden flex overflow-x-auto custom-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4 sticky top-0 bg-gray-50/95 dark:bg-[#0d0d0d]/95 z-10 pt-2 backdrop-blur-sm">
                 {(['overview', 'ai_analysis', 'history'] as TabType[]).map((tab) => {
                    const isActive = activeTab === tab;
                    const labels: Record<string, string> = { overview: 'Geral', ai_analysis: '✨ IA Insight', history: 'Histórico' };
                    return (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            className={`flex-none px-4 py-2.5 text-xs font-bold rounded-xl border transition-all ${isActive ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20' : 'bg-white dark:bg-[#1c1c1e] text-gray-500 border-gray-200 dark:border-white/10'}`}
                        >
                          {labels[tab] || tab}
                        </button>
                    );
                 })}
              </div>

              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
                    {/* Left Col: Price & Chart */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-200 dark:border-white/5 shadow-xl">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-8 gap-4">
                                <div>
                                    <p className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Cotação Atual</p>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white tracking-tighter">
                                            R$ {asset.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </h1>
                                        <div className={`px-3 py-1 rounded-xl font-bold text-sm border ${asset.dailyChange >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                                            {asset.dailyChange > 0 ? '▲' : '▼'} {Math.abs(asset.dailyChange).toFixed(2)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="h-[250px] md:h-[400px] w-full -ml-2">
                                {isLoadingHistory ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-white/5 rounded-3xl animate-pulse">
                                    <TrendingUp className="text-gray-400 animate-bounce" size={48} />
                                </div>
                                ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={realHistory}>
                                        <defs>
                                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.2}/>
                                                <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Area type="monotone" dataKey="price" stroke="var(--brand-primary)" strokeWidth={3} fill="url(#colorPrice)" dot={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Indicators */}
                    <div className="space-y-4 md:space-y-6">
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-200 dark:border-white/5 shadow-xl">
                            <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-6">Indicadores Fundamentalistas</h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <div className="p-4 bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 dark:text-white/30 text-[10px] font-bold uppercase block mb-1">P / VP</span>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{asset.pvp.toFixed(2)}</span>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <span className="text-gray-400 dark:text-white/30 text-[10px] font-bold uppercase block mb-1">Dividend Yield</span>
                                    <span className="text-xl font-bold text-brand-primary">{asset.dy12m.toFixed(2)}%</span>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-2xl border border-gray-100 dark:border-white/5 col-span-2">
                                    <span className="text-gray-400 dark:text-white/30 text-[10px] font-bold uppercase block mb-1">Liquidez Diária</span>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{asset.liquidity}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-brand-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/30 transition-colors"></div>
                             <p className="text-brand-100 text-xs font-bold uppercase tracking-widest mb-2">Sua Posição</p>
                             <h2 className="text-3xl md:text-4xl font-bold mb-1">R$ {asset.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                             <p className="text-brand-200 text-sm font-medium">{asset.quantity} cotas</p>
                        </div>
                    </div>
                </div>
              )}

              {activeTab === 'ai_analysis' && (
                 <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-200 dark:border-white/5 shadow-xl min-h-[400px] flex flex-col items-center justify-center text-center">
                    {isAiLoading ? (
                        <div className="flex flex-col items-center">
                            <Sparkles className="w-12 h-12 text-brand-500 animate-spin-slow mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">O Gemini está analisando...</h3>
                            <p className="text-sm text-gray-500 mt-2">Processando fundamentos e cotação de {asset.ticker}</p>
                        </div>
                    ) : aiAnalysis ? (
                        <div className="w-full text-left">
                            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-white/5">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Análise do Gemini AI</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Powered by Google</p>
                                </div>
                            </div>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed whitespace-pre-wrap font-medium">
                                    {aiAnalysis}
                                </p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end">
                                <button onClick={() => { setAiAnalysis(null); setIsAiLoading(false); setTimeout(() => setActiveTab('overview'), 100); setTimeout(() => setActiveTab('ai_analysis'), 200); }} className="text-xs font-bold text-brand-500 hover:text-brand-400 flex items-center gap-1">
                                    <RefreshCw size={12} /> Gerar nova análise
                                </button>
                            </div>
                        </div>
                    ) : (
                         <div className="flex flex-col items-center">
                            <Sparkles className="w-12 h-12 text-gray-300 mb-4" />
                            <p className="text-gray-500">Não foi possível gerar a análise.</p>
                            <button onClick={() => setActiveTab('overview')} className="mt-4 text-brand-500 font-bold">Voltar</button>
                        </div>
                    )}
                 </div>
              )}

              {activeTab === 'history' && (
                <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-200 dark:border-white/5 shadow-xl min-h-[500px] mb-10">
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2">
                        <FileText size={20} className="text-brand-500" />
                        Histórico de Transações
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {assetTransactions.length > 0 ? assetTransactions.map((trans) => (
                        <div key={trans.id} className="bg-gray-50 dark:bg-[#2c2c2e]/40 p-5 rounded-2xl border border-gray-100 dark:border-white/5 flex justify-between items-center transition-transform hover:scale-[1.01]">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${trans.type === 'Compra' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                            {trans.type === 'Compra' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                            </div>
                            <div>
                            <h4 className="text-gray-900 dark:text-white font-bold text-base">{trans.type}</h4>
                            <p className="text-gray-400 dark:text-white/30 text-xs font-bold uppercase">{trans.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-900 dark:text-white font-bold text-base">R$ {trans.total.toLocaleString('pt-BR')}</p>
                            <p className="text-gray-500 dark:text-white/40 text-xs">{trans.quantity} cotas a R$ {trans.price}</p>
                        </div>
                        </div>
                    )) : (
                        <div className="col-span-1 lg:col-span-2 py-20 text-center opacity-40">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-base font-bold text-gray-500">Nenhuma movimentação registrada</p>
                        </div>
                    )}
                    </div>
                </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
};
