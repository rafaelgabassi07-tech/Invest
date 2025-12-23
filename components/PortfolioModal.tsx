
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Share2, Layers, Info, CheckCircle2, Ticket, LayoutGrid, Building2 } from 'lucide-react';
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
      <text x={cx} y={cy - 8} dy={8} textAnchor="middle" fill={fill} className="text-2xl font-bold drop-shadow-sm">
        {payload.percentage}%
      </text>
      <text x={cx} y={cy + 16} dy={8} textAnchor="middle" fill="#9ca3af" className="text-[10px] font-bold uppercase tracking-widest">
        {payload.name.length > 10 ? payload.name.substring(0, 8) + '..' : payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
        stroke="none"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={innerRadius - 10}
        outerRadius={innerRadius - 6}
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" onClick={onClose} />
      
      <div className="w-full h-full md:w-full md:max-w-md md:h-[85vh] flex flex-col bg-gray-50 dark:bg-[#0d0d0d] relative z-10 md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up transition-colors md:border border-gray-200 dark:border-white/5">
        
        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Estrutura</h1>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-50 dark:hover:bg-white/5 transition-all active:scale-90">
            <Share2 size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 mb-4 mt-6">
            <div className="flex p-1 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-200 dark:border-white/5 shadow-sm">
                {[
                    { id: 'assets', label: 'Ativos', icon: Ticket },
                    { id: 'segments', label: 'Segmentos', icon: LayoutGrid },
                    { id: 'allocation', label: 'Alocação', icon: Building2 }
                ].map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setViewMode(tab.id as ViewMode)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[10px] font-bold rounded-xl transition-all duration-300 uppercase ${
                            viewMode === tab.id 
                            ? 'bg-gray-100 dark:bg-[#2c2c2e] text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-white/5' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        <tab.icon size={12} />
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pt-2 pb-8 overflow-y-auto custom-scrollbar">
          
          {/* Main Chart Card */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[2.5rem] p-6 mb-6 border border-gray-200 dark:border-white/5 relative overflow-hidden shadow-2xl animate-pop-in group">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50/50 dark:from-white/[0.02] to-transparent pointer-events-none"></div>
             
             <div className="h-64 w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={75}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                      onClick={onPieEnter}
                      animationDuration={800}
                      stroke="none"
                      activeDot={false}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke="none"
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
             </div>
             
             <div className="flex justify-center mt-2">
                <p className="text-gray-500 text-[10px] flex items-center gap-1.5 bg-gray-100 dark:bg-[#2c2c2e] px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/5">
                   <Info size={12} /> Toque no gráfico para detalhes
                </p>
             </div>
          </div>

          {/* Diversification Score */}
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
             <div className="flex justify-between items-end mb-2 px-2">
                <h3 className="text-gray-900 dark:text-white font-bold text-sm">Diversificação</h3>
                <span className="text-emerald-500 font-bold text-sm bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">Excelente (92/100)</span>
             </div>
             <div className="bg-white dark:bg-[#1c1c1e] p-1.5 rounded-full flex gap-1 border border-gray-200 dark:border-white/5 shadow-inner">
                <div className="h-2.5 flex-1 rounded-l-full bg-emerald-500 animate-pulse-fast"></div>
                <div className="h-2.5 flex-1 bg-emerald-500 animate-pulse-fast" style={{ animationDelay: '0.1s' }}></div>
                <div className="h-2.5 flex-1 bg-emerald-500 animate-pulse-fast" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2.5 flex-1 rounded-r-full bg-gray-200 dark:bg-[#2c2c2e]"></div>
             </div>
          </div>

          {/* Breakdown List */}
          <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 px-2">
                {viewMode === 'assets' ? 'Meus Ativos' : viewMode === 'segments' ? 'Por Segmento' : 'Alocação de Capital'}
            </h3>
            
            <div className="space-y-3">
                {chartData.map((item, index) => {
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => setActiveIndex(index)}
                            style={{ animationDelay: `${index * 80}ms` }}
                            className={`p-4 rounded-[1.5rem] border flex justify-between items-center transition-all cursor-pointer animate-entry opacity-0 fill-mode-forwards active:scale-[0.98] ${
                                activeIndex === index 
                                ? 'bg-gray-100 dark:bg-[#2c2c2e] border-brand-500/30 ring-1 ring-brand-500/20' 
                                : 'bg-white dark:bg-[#1c1c1e] border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-[#262629]'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md" style={{ backgroundColor: item.color }}>
                                    <Layers size={18} />
                                </div>
                                <div>
                                    <h4 className="text-gray-900 dark:text-white font-bold text-sm">{item.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="h-1.5 w-16 bg-gray-200 dark:bg-[#0d0d0d] rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.percentage}%`, backgroundColor: item.color }}></div>
                                        </div>
                                        <span className="text-gray-500 text-[10px] font-bold">{item.percentage}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-gray-900 dark:text-white font-bold text-sm">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                <div className="flex items-center justify-end gap-1 text-emerald-500 mt-0.5">
                                    <CheckCircle2 size={10} />
                                    <span className="text-[9px] font-bold">OK</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
