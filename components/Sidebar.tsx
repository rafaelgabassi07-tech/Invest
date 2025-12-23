
import React from 'react';
import { LayoutGrid, Wallet, ScrollText, Settings, TrendingUp, LogOut } from 'lucide-react';
import { AppTheme } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTheme?: AppTheme;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentTheme }) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Visão Geral' },
    { id: 'wallet', icon: Wallet, label: 'Carteira' },
    { id: 'transactions', icon: ScrollText, label: 'Extrato' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen sticky top-0 bg-white/50 dark:bg-[#0c0c0e]/50 backdrop-blur-3xl border-r border-gray-200 dark:border-white/5 pt-8 pb-6 px-5 transition-colors z-50">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <TrendingUp size={24} />
        </div>
        <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">Invest</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Dashboard Pro</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                        isActive 
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    <item.icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="font-bold text-sm tracking-wide">{item.label}</span>
                    {isActive && <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>}
                </button>
            );
        })}
      </nav>

      <div className="mt-auto">
        <div className="p-5 rounded-[1.5rem] bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden shadow-2xl border border-white/10 group cursor-pointer hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-500/30 transition-colors"></div>
            
            <div className="relative z-10 flex items-center justify-between mb-3">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               </div>
               <span className="text-[9px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Online</span>
            </div>

            <div className="relative z-10">
                <p className="text-xs font-bold text-gray-300">Patrimônio Atual</p>
                <div className="h-1 w-12 bg-brand-500 rounded-full my-2"></div>
                <p className="text-[10px] text-gray-500 leading-tight">Sincronização automática ativa</p>
            </div>
        </div>
      </div>
    </aside>
  );
};
