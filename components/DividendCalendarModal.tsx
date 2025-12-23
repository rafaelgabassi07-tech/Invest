
import React, { useState, useMemo } from 'react';
import { Asset } from '../types';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, DollarSign, TrendingUp, Filter } from 'lucide-react';

interface DividendCalendarModalProps {
  assets: Asset[];
  onClose: () => void;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const DividendCalendarModal: React.FC<DividendCalendarModalProps> = ({ assets, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const parseAssetDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

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

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const totalMonth = events.reduce((acc, curr) => acc + curr.amount, 0);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="fixed inset-0 left-0 md:left-72 z-[100] flex items-center justify-center pointer-events-auto bg-gray-50 dark:bg-[#0d0d0d]">
      <div className="w-full h-full flex flex-col relative z-10 animate-fade-in overflow-hidden">
        
        {/* Header */}
        <div className="px-4 md:px-6 py-4 flex justify-between items-center bg-white/80 dark:bg-[#0d0d0d]/85 backdrop-blur-xl border-b border-gray-200 dark:border-white/5 sticky top-0 z-20">
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-90">
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">Agenda de Proventos</h1>
            <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wide">Previsão de Recebimentos</span>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full h-full flex flex-col lg:flex-row gap-6 md:gap-8 pb-20">
                
                {/* Left: Interactive Calendar */}
                <div className="flex-1 flex flex-col">
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-8 border border-gray-200 dark:border-white/5 shadow-xl relative overflow-hidden mb-6 flex-1">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <span className="capitalize">{MONTHS[currentDate.getMonth()]}</span>
                                <span className="text-gray-300 dark:text-gray-600 font-medium">{currentDate.getFullYear()}</span>
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={nextMonth} className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 mb-2 md:mb-4">
                            {WEEKDAYS.map(day => (
                                <div key={day} className="text-center text-[10px] md:text-xs font-bold text-gray-400 uppercase py-2 tracking-wider">
                                    {window.innerWidth < 768 ? day.substring(0, 1) : day.substring(0, 3)}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 md:gap-2 lg:gap-4 auto-rows-fr">
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-14 md:h-24 lg:h-32 xl:h-40 bg-transparent"></div>
                            ))}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const dayEvents = events.filter(e => e.day === day);
                                const hasEvent = dayEvents.length > 0;
                                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

                                return (
                                    <div key={day} className={`h-14 md:h-24 lg:h-32 xl:h-40 rounded-xl md:rounded-2xl border p-1 md:p-2 lg:p-3 flex flex-col justify-between transition-all hover:shadow-md ${isToday ? 'bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500/30' : 'bg-gray-50/50 dark:bg-[#2c2c2e]/50 border-gray-100 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'}`}>
                                        <div className="flex justify-between items-start">
                                            <span className={`text-[10px] md:text-sm font-bold w-5 h-5 md:w-7 md:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500 text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {day}
                                            </span>
                                            {hasEvent && (
                                                 <span className="text-[8px] md:text-[9px] font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                                                     {dayEvents.length}
                                                 </span>
                                            )}
                                        </div>
                                        <div className="space-y-0.5 md:space-y-1 overflow-hidden">
                                            {dayEvents.slice(0, window.innerWidth < 768 ? 1 : 3).map((ev, idx) => (
                                                <div key={idx} className="flex items-center gap-1.5 px-1.5 py-0.5 md:px-2 md:py-1 bg-white dark:bg-[#1c1c1e] rounded md:rounded-lg shadow-sm border border-gray-100 dark:border-white/5">
                                                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-indigo-500 shrink-0"></div>
                                                    <span className="text-[8px] md:text-[9px] font-bold text-gray-900 dark:text-white truncate">{ev.asset.ticker}</span>
                                                </div>
                                            ))}
                                            {dayEvents.length > (window.innerWidth < 768 ? 1 : 3) && (
                                                <div className="text-[8px] md:text-[9px] text-center text-gray-400 font-bold hidden md:block">+{dayEvents.length - 3} mais</div>
                                            )}
                                            {dayEvents.length > 1 && (
                                                 <div className="w-1 h-1 bg-gray-400 rounded-full mx-auto md:hidden"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right: Summary & List */}
                <div className="w-full lg:w-96 flex flex-col gap-6">
                    <div className="bg-indigo-600 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/20 group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-white/20 transition-colors"></div>
                        <div className="relative z-10">
                            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Total Estimado no Mês</p>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                                R$ {totalMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h2>
                            <p className="text-indigo-200 text-sm font-medium">Referente a {events.length} pagamentos</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1c1c1e] rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 border border-gray-200 dark:border-white/5 shadow-xl flex-1 flex flex-col overflow-hidden max-h-[500px] lg:max-h-full min-h-[300px]">
                         <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-6 flex items-center gap-2 px-2">
                            <CalendarIcon size={20} className="text-gray-400" />
                            Próximos Pagamentos
                         </h3>
                         
                         <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-3">
                            {events.length > 0 ? events.map((ev, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-gray-50 dark:bg-[#2c2c2e]/50 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-[#2c2c2e] hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white dark:bg-[#1c1c1e] flex flex-col items-center justify-center border border-gray-200 dark:border-white/5 shadow-sm">
                                            <span className="text-[9px] md:text-[10px] font-bold text-indigo-500 uppercase">{MONTHS[currentDate.getMonth()].substring(0,3)}</span>
                                            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-none">{ev.day}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{ev.asset.ticker}</h4>
                                            <p className="text-xs text-gray-500 truncate max-w-[100px] md:max-w-none">{ev.asset.shortName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 dark:text-emerald-500 text-sm md:text-base">+ R$ {ev.amount.toFixed(2)}</p>
                                        <span className="text-[10px] text-gray-400 font-medium">Provento</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-gray-500 text-sm font-medium">Nenhum pagamento previsto.</p>
                                </div>
                            )}
                         </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
