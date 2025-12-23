
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Share2, Layers, Info, CheckCircle2, Ticket, LayoutGrid, Building2, X, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { Asset, PortfolioItem } from '../types';

interface PortfolioModalProps {
  onClose: () => void;
  items?: PortfolioItem[]; 
  assets: Asset[];         
  totalValue: number;
}

type ViewMode = 'assets' | 'segments' | 'allocation';

const COLORS = {
    assets: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'],
    segments: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
    allocation: ['#8b5cf6', '#10b981', '#f97316', '#3b82f6']
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-3xl font-bold drop-shadow-sm">
        {payload.percentage}%
      </text>
      <text x={cx} y={cy + 20} dy={8} textAnchor="middle" fill="#9ca3af" className="text-xs font-bold uppercase tracking-widest">
        {payload.name.length > 12 ? payload.name.substring(0, 10) + '..' : payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={8}
        stroke="none"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 12}
        outerRadius={innerRadius - 8}
        fill={fill}
        fillOpacity={0.2}
        cornerRadius={4}
        stroke="none"
      />
    </g>
  );
};

export const PortfolioModal: React.FC<PortfolioModalProps> = ({ onClose, assets, totalValue }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('segments');

  const chartData = useMemo(() => {
    setActiveIndex(0);

    if (viewMode === 'assets') {
        return assets.map((a, idx) => ({
            id: a.id,
            name: a.ticker,
            value: a.totalValue,
            percentage: parseFloat(((a.totalValue / totalValue) * 100).toFixed(1)),
            color: a.color || COLORS.assets[idx % COLORS.assets.length]
        })).sort((a, b) => b.value - a.value);
    } 
    
    if (viewMode === 'segments') {
        const grouped: Record<string, number> = {};
        assets.forEach(a => {
            grouped[a.segment] = (grouped[a.segment] || 0) + a.totalValue;
        });
        return Object.keys(grouped).map((key, idx) => ({
            id: key,
            name: key,
            value: grouped[key],
            percentage: parseFloat(((grouped[key] / totalValue) * 100).toFixed(1)),
            color: COLORS.segments[idx % COLORS.segments.length]
        })).sort((a, b) => b.value - a.value);
    }

    if (viewMode === 'allocation') {
        const grouped: Record<string, number> = {};
        assets.forEach(a => {
            grouped[a.allocationType] = (grouped[a.allocationType] || 0) + a.totalValue;
        });
        return Object.keys(grouped).map((key, idx) => ({
            id: key,
            name: key,
            value: grouped[key],
            percentage: parseFloat(((grouped[key] / totalValue) * 100).toFixed(1)),
            color: COLORS.allocation[idx % COLORS.allocation.length]
        })).sort((a, b) => b.value - a.value);
    }
    
    return [];
  }, [viewMode, assets, totalValue]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
             <h1 className="text-lg font-bold text-gray-900 dark:text-white">Estrutura da Carteira</h1>
             <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wide">Alocação e Risco</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-6 py-8 w-full h-full flex flex-col lg:flex-row gap-8">
                
                {/* Left Column: Controls & Chart */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                    {/* View Switcher */}
                    <div className="flex p-1.5 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-200 dark:border-white/5 shadow-md">
                        {[
                            { id: 'assets', label: 'Por Ativo', icon: Ticket },
                            { id: 'segments', label: 'Por Segmento', icon: LayoutGrid },
                            { id: 'allocation', label: 'Classe de Ativo', icon: Building2 }
                        ].map((tab) => (
                            <button 
                                key={tab.id}
                                onClick={() => setViewMode(tab.id as ViewMode)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-xl transition-all duration-300 uppercase ${
                                    viewMode === tab.id 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                                }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Chart Card */}
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-8 border border-gray-200 dark:border-white/5 relative overflow-hidden shadow-xl flex-1 min-h-[500px] flex flex-col justify-center items-center">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50/50 dark:from-white/[0.02] to-transparent pointer-events-none"></div>
                        
                        <div className="w-full h-full relative z-10 flex-1 min-h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}
                                outerRadius={140}
                                paddingAngle={4}
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                                onClick={onPieEnter}
                                animationDuration={800}
                                stroke="none"
                                >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                                </Pie>
                            </PieChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2 text-gray-400 bg-gray-50 dark:bg-[#2c2c2e] px-4 py-2 rounded-full border border-gray-200 dark:border-white/5">
                            <Info size={14} /> 
                            <span className="text-xs font-medium">Passe o mouse ou toque para detalhes</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: List & Stats */}
                <div className="lg:w-1/2 flex flex-col gap-6">
                    {/* Score Card */}
                    <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <PieChartIcon className="text-blue-500" /> Índice de Diversificação
                            </h3>
                            <span className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">Excelente (92/100)</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-[#2c2c2e] rounded-full h-4 overflow-hidden flex gap-1">
                            <div className="bg-blue-500 h-full w-[40%]"></div>
                            <div className="bg-emerald-500 h-full w-[30%]"></div>
                            <div className="bg-amber-500 h-full w-[20%]"></div>
                            <div className="bg-indigo-500 h-full w-[10%]"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            Sua carteira está bem distribuída entre diferentes classes, reduzindo riscos específicos.
                        </p>
                    </div>

                    {/* Breakdown List */}
                    <div className="flex-1 bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-6 border border-gray-200 dark:border-white/5 shadow-xl flex flex-col overflow-hidden h-[500px] lg:h-auto">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6 px-2">
                            Detalhamento por {viewMode === 'assets' ? 'Ativo' : viewMode === 'segments' ? 'Segmento' : 'Classe'}
                        </h3>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                            {chartData.map((item, index) => (
                                <div 
                                    key={item.id} 
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`p-5 rounded-2xl border flex justify-between items-center transition-all cursor-pointer hover:scale-[1.01] ${
                                        activeIndex === index 
                                        ? 'bg-blue-50/80 dark:bg-[#2c2c2e] border-blue-500/30 ring-1 ring-blue-500/20 shadow-md' 
                                        : 'bg-gray-50 dark:bg-[#2c2c2e]/40 border-gray-100 dark:border-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: item.color }}>
                                            <Layers size={20} />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-900 dark:text-white font-bold text-base">{item.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="h-2 w-24 bg-gray-200 dark:bg-[#0d0d0d] rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%`, backgroundColor: item.color }}></div>
                                                </div>
                                                <span className="text-gray-500 text-xs font-bold">{item.percentage}%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-gray-900 dark:text-white font-bold text-base">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <div className="flex items-center justify-end gap-1 text-emerald-500 mt-1">
                                            <CheckCircle2 size={12} />
                                            <span className="text-[10px] font-bold uppercase">Balanceado</span>
                                        </div>
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
  );
};
