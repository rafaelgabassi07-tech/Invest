
import React from 'react';
import { LayoutGrid, Wallet, ScrollText } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] h-[4.5rem] bg-brand-muted/80 backdrop-blur-2xl rounded-[2.25rem] grid grid-cols-3 items-center px-3 shadow-2xl border border-brand-highlight z-40 transition-all duration-300 group/dock">
      
      {/* Accent Light Beam */}
      <div className="absolute inset-0 rounded-[2.25rem] overflow-hidden pointer-events-none opacity-40">
         <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-24 bg-brand-primary/20 blur-2xl"></div>
      </div>
      
      {['dashboard', 'wallet', 'transactions'].map((tab) => {
        const isActive = activeTab === tab;
        let Icon = LayoutGrid;
        let label = 'Início';
        
        switch(tab) {
            case 'dashboard': Icon = LayoutGrid; label = 'Início'; break;
            case 'wallet': Icon = Wallet; label = 'Carteira'; break;
            case 'transactions': Icon = ScrollText; label = 'Extrato'; break;
        }

        return (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex flex-col items-center justify-center relative h-full w-full tap-active group"
          >
            {/* Top Light Streak */}
            <div className={`absolute -top-[1px] left-1/2 -translate-x-1/2 h-[3px] bg-brand-primary shadow-[0_2px_12px_var(--brand-primary)] rounded-b-full transition-all duration-500 ${isActive ? 'w-10 opacity-100' : 'w-0 opacity-0'}`}></div>

            {/* Icon & Glow */}
            <div className={`relative z-10 transition-all duration-500 transform ${isActive ? 'text-brand-primary -translate-y-1.5' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
               <Icon 
                 size={24} 
                 strokeWidth={isActive ? 2.5 : 2}
                 className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
               />
               {isActive && (
                   <Icon 
                    size={24} 
                    strokeWidth={2.5}
                    className="absolute top-0 left-0 text-brand-primary blur-md opacity-40 scale-125"
                  />
               )}
            </div>
            
            <span className={`absolute bottom-2.5 text-[9px] font-bold tracking-wide transition-all duration-500 ${isActive ? 'text-brand-primary opacity-100 translate-y-0' : 'text-gray-400 dark:text-gray-500 opacity-0 translate-y-3'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
