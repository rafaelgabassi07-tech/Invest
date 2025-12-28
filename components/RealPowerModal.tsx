
import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, AlertCircle, BarChart3, X, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getInflationAnalysis } from '../services/geminiService';

interface RealPowerModalProps {
  onClose: () => void;
}

export const RealPowerModal: React.FC<RealPowerModalProps> = ({ onClose }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Simulação de dados para funcionalidade imediata
  const simulationData = useMemo(() => {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const data = [];
      let walletValue = 100; // Base index 100
      let inflationValue = 100; // Base index 100
      
      for(let i=0; i<12; i++) {
          const walletChange = (Math.random() * 4) - 1; // -1% a +3% ao mês
          const inflationChange = 0.3 + (Math.random() * 0.4); // 0.3% a 0.7% ao mês (IPCA aprox)
          
          walletValue = walletValue * (1 + (walletChange/100));
          inflationValue = inflationValue * (1 + (inflationChange/100));
          
          data.push({
              month: months[i],
              wallet: parseFloat(walletValue.toFixed(2)),
              inflation: parseFloat(inflationValue.toFixed(2)),
              realGain: parseFloat((walletValue - inflationValue).toFixed(2))
          });
      }
      return data;
  }, []);

  const lastPoint = simulationData[simulationData.length - 1];
  const accumulatedReal = lastPoint.realGain;
  const accumulatedNominal = lastPoint.wallet - 100;
  const accumulatedInflation = lastPoint.inflation - 100;
  const isPositive = accumulatedReal >= 0;

  useEffect(() => {
    const fetchAnalysis = async () => {
        setLoadingAi(true);
        // Passamos a rentabilidade nominal acumulada para a IA analisar contra o IPCA real
        const text = await getInflationAnalysis(accumulatedNominal);
        setAiAnalysis(text);
        setLoadingAi(false);
    };
    fetchAnalysis();
  }, [accumulatedNominal]);

  return (
    <div className="fixed inset-0 left-0 md:left-72 z-[100] flex items-center justify-center pointer-events-auto bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex flex-col items-center">
             <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Poder Real de Compra</h1>
             <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                  Rentabilidade vs IPCA
             </p>
          </div>
          
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
             <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full h-full flex flex-col lg:flex-row gap-6 md:gap-8 pb-20">
                
                {/* Left Column: Stats */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden animate-slide-up flex flex-col justify-center min-h-[300px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                        
                        <div className="relative z-10 text-center py-6 md:py-10">
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Ganho Real Estimado (12m)</p>
                            <h2 className={`text-6xl lg:text-8xl font-bold tracking-tighter mb-4 md:mb-6 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isPositive ? '+' : ''}{accumulatedReal.toFixed(2)}%
                            </h2>
                            <div className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full ${isPositive ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                                {isPositive ? <TrendingUp size={16} className="text-emerald-500" /> : <TrendingDown size={16} className="text-rose-500" />}
                                <span className={`font-bold text-sm ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                                    {isPositive ? 'Acima da Inflação' : 'Abaixo da Inflação'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-10 mt-6 md:mt-8">
                            <div className="bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-3xl p-4 md:p-6 border border-gray-100 dark:border-white/5 text-center">
                                <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase mb-1 md:mb-2">Nominal</p>
                                <p className="text-indigo-500 font-bold text-xl md:text-3xl">+{accumulatedNominal.toFixed(2)}%</p>
                            </div>
                            <div className="bg-gray-50 dark:bg-[#2c2c2e]/50 rounded-3xl p-4 md:p-6 border border-gray-100 dark:border-white/5 text-center">
                                <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase mb-1 md:mb-2">IPCA (Est.)</p>
                                <p className="text-amber-500 font-bold text-xl md:text-3xl">-{accumulatedInflation.toFixed(2)}%</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Gemini AI Analysis Block */}
                    <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} className="text-brand-500" />
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Análise Macro Gemini 2.5</h4>
                        </div>
                        {loadingAi ? (
                            <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded"></div>
                                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-xs dark:prose-invert">
                                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium whitespace-pre-wrap">
                                    {aiAnalysis || "Iniciando busca por dados de inflação..."}
                                </p>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column: Chart */}
                <div className="lg:w-1/2 bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-200 dark:border-white/5 shadow-lg flex flex-col min-h-[400px] animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BarChart3 className="text-emerald-500" size={20}/>
                            Histórico Comparativo
                        </h3>
                        <div className="flex gap-2">
                            <span className="text-[10px] font-bold text-gray-400">Base 100</span>
                        </div>
                    </div>

                    <div className="flex-1 w-full flex items-center justify-center bg-gray-50/50 dark:bg-[#2c2c2e]/20 rounded-3xl border border-gray-100 dark:border-white/5 relative p-2 md:p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={simulationData}>
                                <defs>
                                    <linearGradient id="colorWallet" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorInf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#88888820" vertical={false} />
                                <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} dy={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1c1c1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="wallet" name="Sua Carteira" stroke="var(--brand-primary)" strokeWidth={3} fill="url(#colorWallet)" />
                                <Area type="monotone" dataKey="inflation" name="Inflação" stroke="#f59e0b" strokeWidth={3} fill="url(#colorInf)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
