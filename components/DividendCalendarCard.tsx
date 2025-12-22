
import React from 'react';
import { Asset } from '../types';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

export const DividendCalendarCard: React.FC<{ assets: Asset[]; onClick: () => void }> = ({ assets, onClick }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const parseAssetDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const monthlyDividends = assets.filter(asset => {
      const date = parseAssetDate(asset.lastDividendDate);
      return date && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalMonth = monthlyDividends.reduce((acc, curr) => acc + (curr.lastDividend * curr.quantity), 0);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const nextPayment = monthlyDividends
    .map(a => ({...a, dateObj: parseAssetDate(a.lastDividendDate) as Date}))
    .filter(a => a.dateObj >= today)
    .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())[0];

  const monthsBr = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

  return (
    <div 
      onClick={onClick}
      className="mx-4 p-6 rounded-[2.5rem] bg-white/60 dark:bg-[#1c1c1e]/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 relative overflow-hidden shadow-xl shadow-gray-200/40 dark:shadow-black/20 group cursor-pointer active:scale-[0.98] transition-all hover:bg-white/80 dark:hover:bg-[#262629]/80 animate-pop-in"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none transition-transform group-hover:scale-110 duration-700"></div>

      <div className="flex justify-between items-start relative z-10 mb-6">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-indigo-50/50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-100/50 dark:border-white/5 shadow-sm backdrop-blur-sm">
              <Calendar size={20} />
           </div>
           <div>
             <h3 className="text-gray-900 dark:text-white font-bold text-sm leading-none flex items-center gap-2">
                Agenda
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
             </h3>
             <p className="text-gray-500 dark:text-gray-400 text-[10px] font-medium mt-1">
                Previsão Mensal
             </p>
           </div>
        </div>
        
        <div className="w-8 h-8 rounded-full bg-white/50 dark:bg-[#2c2c2e]/50 flex items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors border border-white/40 dark:border-white/5 shadow-sm backdrop-blur-sm">
          <ChevronRight size={16} />
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
          <div>
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total a Receber</p>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  R$ {totalMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
          </div>

          {nextPayment && (
              <div className="bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 rounded-2xl p-2.5 flex items-center gap-3 max-w-[140px] backdrop-blur-sm">
                  <div className="flex flex-col items-center justify-center bg-white/80 dark:bg-[#2c2c2e] w-9 h-9 rounded-xl shadow-sm">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">{nextPayment.dateObj.getDate()}</span>
                      <span className="text-[8px] font-bold text-gray-900 dark:text-white uppercase">
                        {monthsBr[nextPayment.dateObj.getMonth()]}
                      </span>
                  </div>
                  <div className="overflow-hidden">
                      <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide truncate">Próximo</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{nextPayment.ticker}</p>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
