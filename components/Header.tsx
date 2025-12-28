
import React from 'react';
import { RefreshCcw, Settings, Bell, Plus, ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title?: React.ReactNode;
  subtitle?: string;
  showAddButton?: boolean;
  showBackButton?: boolean;
  hasUnreadNotifications?: boolean;
  onAddClick?: () => void;
  onBackClick?: () => void;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onRefreshClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showAddButton, 
  showBackButton,
  hasUnreadNotifications,
  onAddClick,
  onBackClick,
  onSettingsClick, 
  onNotificationsClick,
  onRefreshClick
}) => {
  
  // Helper for the pulsing dot - shows for main sections
  const showDot = typeof title === 'string' && ['Invest', 'Carteira', 'Extrato'].includes(title);
  const isRefreshing = subtitle && subtitle !== 'Visão Geral' && subtitle !== 'Detalhes' && !subtitle.startsWith('Atualizado');

  return (
    <header className="flex justify-between items-center px-6 py-4 sticky top-0 z-30 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-all duration-300 min-h-[80px]">
      
      {/* Left Section: Back Button or Title */}
      <div className="flex items-center gap-3 animate-slide-in-right">
        {showBackButton && (
            <button 
                onClick={onBackClick}
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-90"
            >
                <ChevronLeft size={24} />
            </button>
        )}

        <div className="flex flex-col justify-center">
            <div className="flex items-center h-7 mb-0.5">
                {typeof title === 'string' ? (
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center leading-none">
                        {title}
                        {showDot && (
                        <span className="flex items-center justify-center ml-1.5 pt-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                            </span>
                        </span>
                        )}
                    </h1>
                ) : (
                    title
                )}
            </div>
            
            {/* Animação suave para troca de texto (key para forçar re-render da animação) */}
            <span 
                key={subtitle} 
                className={`text-[10px] font-bold tracking-widest uppercase block leading-none transition-colors duration-300 animate-fade-in ${isRefreshing ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 opacity-80'}`}
            >
                {subtitle}
            </span>
        </div>
      </div>
      
      {/* Right Section: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onRefreshClick}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-90 duration-500 ${isRefreshing ? 'animate-spin text-brand-500 bg-brand-500/10' : ''}`}
        >
          <RefreshCcw size={18} strokeWidth={2} />
        </button>
        
        <button 
          onClick={onSettingsClick}
          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all active:scale-90"
        >
          <Settings size={18} strokeWidth={2} />
        </button>

        {showAddButton ? (
           <button 
             onClick={onAddClick}
             className="w-10 h-10 rounded-full bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 active:scale-90 ml-1"
           >
             <Plus size={20} strokeWidth={2.5} />
           </button>
        ) : (
            <button 
              onClick={onNotificationsClick}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all relative active:scale-90 ml-1"
            >
              <Bell size={18} strokeWidth={2} />
              {hasUnreadNotifications && (
                <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full ring-2 ring-white dark:ring-[#050505] bg-brand-500 animate-scale-in"></span>
              )}
            </button>
        )}
      </div>
    </header>
  );
};
