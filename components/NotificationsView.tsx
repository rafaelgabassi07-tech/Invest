
import React, { useState } from 'react';
import { Bell, DollarSign, FileText, ShieldAlert, TrendingUp, CheckCircle2, ListFilter, SlidersHorizontal, ArrowDownCircle, Info } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onNotificationClick: (id: number) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ 
  notifications, 
  onMarkAllRead, 
  onNotificationClick 
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const getIcon = (type: string) => {
    switch(type) {
      case 'money': return <DollarSign size={20} className="text-emerald-500" />;
      case 'news': return <FileText size={20} className="text-blue-500" />;
      case 'security': return <ShieldAlert size={20} className="text-rose-500" />;
      case 'success': return <TrendingUp size={20} className="text-amber-500" />;
      case 'system': return <ArrowDownCircle size={20} className="text-brand-500 animate-bounce" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Group notifications
  const groupedNotifications = {
      'Hoje': filteredNotifications.filter(n => n.group === 'Hoje'),
      'Esta Semana': filteredNotifications.filter(n => n.group === 'Esta Semana'),
      'Anteriores': filteredNotifications.filter(n => n.group === 'Anteriores')
  };

  const hasItems = Object.values(groupedNotifications).some(arr => arr.length > 0);

  return (
    <div className="pb-32 animate-fade-in">
      {/* Header Controls */}
      <div className="flex justify-between items-center mb-6 px-6 pt-2">
         <span className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-2">
            {unreadCount > 0 ? `${unreadCount} Novas` : 'Nenhuma nova'}
            {unreadCount > 0 && <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></span>}
         </span>
         <div className="flex gap-3">
            {unreadCount > 0 && (
                <button 
                    onClick={onMarkAllRead}
                    className="text-brand-500 text-[10px] font-bold hover:text-brand-400 flex items-center gap-1 bg-brand-500/10 px-2 py-1 rounded-lg transition-colors backdrop-blur-sm"
                >
                    <CheckCircle2 size={12} /> Ler todas
                </button>
            )}
            <button 
                onClick={() => setFilter(prev => prev === 'all' ? 'unread' : 'all')}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold transition-all backdrop-blur-sm ${
                    filter === 'unread' 
                    ? 'bg-gray-800 text-white dark:bg-white dark:text-black shadow-md' 
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white/60 dark:bg-[#2c2c2e]/60'
                }`}
            >
                <ListFilter size={12} />
                {filter === 'all' ? 'Todas' : 'Não Lidas'}
            </button>
         </div>
      </div>

      <div className="space-y-8 px-4">
        {hasItems ? Object.entries(groupedNotifications).map(([group, items]) => (
            items.length > 0 && (
                <div key={group} className="space-y-3">
                    <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest pl-2 flex items-center gap-2">
                        {group}
                        <div className="h-px bg-gray-200/50 dark:bg-white/5 flex-1"></div>
                    </h3>
                    
                    {items.map((notif, idx) => (
                        <div 
                            key={notif.id}
                            onClick={() => onNotificationClick(notif.id)} 
                            style={{ animationDelay: `${idx * 50}ms` }}
                            className={`p-5 rounded-[1.5rem] border relative overflow-hidden transition-all duration-300 animate-entry opacity-0 fill-mode-forwards active:scale-[0.98] cursor-pointer group backdrop-blur-xl ${
                                notif.type === 'system' 
                                ? 'bg-brand-500/10 border-brand-500/30' 
                                : !notif.read 
                                    ? 'bg-white/70 dark:bg-[#1c1c1e]/70 border-brand-500/30 shadow-lg shadow-brand-500/5' 
                                    : 'bg-white/40 dark:bg-[#1c1c1e]/40 border-white/40 dark:border-white/5 opacity-80'
                            }`}
                        >
                            {!notif.read && notif.type !== 'system' && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-brand-500/20 to-transparent rounded-bl-3xl -mr-4 -mt-4 blur-xl transition-opacity group-hover:opacity-75"></div>
                            )}

                            <div className="flex gap-4 relative z-10">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors backdrop-blur-sm ${
                                    notif.type === 'system' ? 'bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/40' :
                                    !notif.read ? 'bg-gray-50/50 dark:bg-[#2c2c2e]/50 border-gray-100 dark:border-white/10' : 'bg-white/20 dark:bg-[#1c1c1e]/20 border-white/20 dark:border-white/5 grayscale opacity-50'
                                }`}>
                                {getIcon(notif.type)}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1.5">
                                        <h4 className={`text-sm font-bold leading-tight transition-colors ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {notif.title}
                                        </h4>
                                        <span className="text-[10px] text-gray-500 dark:text-gray-600 whitespace-nowrap ml-2 font-medium bg-white/50 dark:bg-[#2c2c2e]/50 px-1.5 py-0.5 rounded backdrop-blur-sm">{notif.time}</span>
                                    </div>
                                    <p className={`text-xs leading-relaxed transition-colors ${!notif.read ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'}`}>
                                        {notif.message}
                                    </p>
                                    
                                    {/* Botão de Ação (Update) */}
                                    {notif.actionLabel && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                notif.onAction && notif.onAction();
                                            }}
                                            className="mt-3 w-full bg-brand-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg shadow-brand-500/20 active:scale-95 transition-all hover:bg-brand-600 flex items-center justify-center gap-2"
                                        >
                                            <ArrowDownCircle size={14} /> {notif.actionLabel}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {!notif.read && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full"></div>
                            )}
                        </div>
                    ))}
                </div>
            )
        )) : (
             <div className="mt-20 flex flex-col items-center justify-center text-center p-8 opacity-50 animate-fade-in">
                <div className="w-20 h-20 bg-white/60 dark:bg-[#1c1c1e]/60 rounded-full flex items-center justify-center mb-6 border border-white/40 dark:border-white/5 shadow-xl backdrop-blur-xl">
                    <Bell size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold">Tudo limpo!</p>
                <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">
                    {filter === 'unread' ? 'Você não tem notificações não lidas.' : 'Você não tem notificações.'}
                </p>
                {filter === 'unread' && (
                    <button 
                        onClick={() => setFilter('all')}
                        className="mt-4 text-brand-500 text-xs font-bold hover:underline"
                    >
                        Ver todas
                    </button>
                )}
            </div>
        )}
      </div>

    </div>
  );
};
