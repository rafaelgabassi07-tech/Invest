
import React, { useState, useMemo } from 'react';
import { Asset } from '../types';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, DollarSign, TrendingUp, Filter } from 'lucide-react';

interface DividendCalendarModalProps {
  assets: Asset[];
  onClose: () => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const DividendCalendarModal: React.FC<DividendCalendarModalProps> = ({ assets, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to parse "dd/mm/yyyy" or return date object
  const parseAssetDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  // 1. Map assets to calendar events based on selected month
  const events = useMemo(() => {
    const evs: { day: number; asset: Asset; amount: number }[] = [];
    
    assets.forEach(asset => {
        const date = parseAssetDate(asset.lastDividendDate);
        if (date && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear()) {
            evs.push({
                day: date.getDate(),
                asset: asset,
                amount: asset.lastDividend * asset.quantity
            });
        }
    });
    return evs.sort((a, b) => a.day - b.day);
  }, [assets, currentDate]);

  // 2. Calendar Grid Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // 3. Stats
  const totalMonth = events.reduce((acc, curr) => acc + curr.amount, 0);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
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
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Agenda de Proventos</h1>
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wide">Previsão de Recebimentos</span>
          </div>
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <Filter size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-20">
            
            {/* Month Navigator & Total */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-6 mb-6 border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden group">
                 {/* Decor */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                 <div className="flex items-center justify-between mb-6 relative z-10">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ChevronLeft size={20} className="text-gray-500" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CalendarIcon size={18} className="text-indigo-500" />
                        {MONTHS[currentDate.getMonth()]} <span className="text-gray-400 font-medium">{currentDate.getFullYear()}</span>
                    </h2>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                        <ChevronRight size={20} className="text-gray-500" />
                    </button>
                 </div>

                 <div className="text-center relative z-10">
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total Estimado</p>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                        R$ {totalMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </h3>
                 </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] p-5 mb-6 border border-gray-200 dark:border-white/5 shadow-lg animate-slide-up">
                <div className="grid grid-cols-7 mb-2">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase py-2">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-y-2">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-10"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dayEvents = events.filter(e => e.day === day);
                        const hasEvent = dayEvents.length > 0;
                        const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

                        return (
                            <div key={day} className="flex flex-col items-center justify-start h-12 relative group">
                                <span className={`text-xs font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all ${isToday ? 'bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30' : 'text-gray-700 dark:text-gray-300'}`}>
                                    {day}
                                </span>
                                {hasEvent && (
                                    <div className="flex gap-0.5 mt-1">
                                        {dayEvents.map((ev, idx) => (
                                            <div key={idx} className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Event List */}
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4 px-2">Pagamentos do Mês</h3>
                <div className="space-y-3">
                    {events.length > 0 ? events.map((ev, idx) => (
                        <div 
                            key={idx} 
                            style={{ animationDelay: `${idx * 50}ms` }}
                            className="bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl border border-gray-200 dark:border-white/5 flex items-center justify-between shadow-sm animate-entry opacity-0 fill-mode-forwards"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 dark:bg-[#2c2c2e] rounded-xl border border-gray-100 dark:border-white/5">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{MONTHS[currentDate.getMonth()].substring(0,3)}</span>
                                    <span className="text-lg font-bold text-gray-900 dark:text-white leading-none">{ev.day}</span>
                                </div>
                                <div>
                                    <h4 className="text-gray-900 dark:text-white font-bold text-sm">{ev.asset.ticker}</h4>
                                    <p className="text-gray-500 text-[10px] font-medium">{ev.asset.shortName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-emerald-600 dark:text-emerald-500 font-bold text-sm">+ R$ {ev.amount.toFixed(2)}</p>
                                <div className="flex items-center justify-end gap-1 text-[9px] text-gray-400 font-bold bg-gray-100 dark:bg-[#2c2c2e] px-1.5 py-0.5 rounded-md mt-1 w-max ml-auto">
                                    <DollarSign size={8} /> PROVENTO
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 opacity-50">
                            <CalendarIcon size={32} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500 text-xs font-medium">Nenhum pagamento previsto para este mês.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
