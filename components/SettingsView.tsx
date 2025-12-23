
import React, { useState, useRef, useMemo } from 'react';
import { 
  User, Shield, Calculator, Book, LogOut, ChevronRight, ChevronLeft,
  Check, Store, Globe, Trash2, HelpCircle, Database, 
  CloudDownload, CloudUpload, AlertCircle, Activity, Server, Cpu,
  RefreshCcw, Eye, Key, Sparkles, Code2, Heart, ExternalLink, Mail, EyeOff, ShieldCheck
} from 'lucide-react';
import { AppTheme, Asset, Transaction } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getBrapiToken } from '../services/brapiService.ts';
import { getApiLogs, clearApiLogs } from '../services/telemetryService.ts';

interface SettingsViewProps {
  currentTheme: AppTheme;
  setCurrentTheme: (theme: AppTheme) => void;
  availableThemes: AppTheme[];
  assets: Asset[];
  transactions: Transaction[];
  onImport: (data: { assets: Asset[], transactions: Transaction[] }) => void;
}

interface SettingsItemProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  onClick: () => void;
  hasBorder?: boolean;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ icon: Icon, title, subtitle, onClick, hasBorder = true, rightElement, destructive }) => (
  <div 
    onClick={onClick}
    className={`p-4 flex items-center justify-between cursor-pointer active:bg-white/20 dark:active:bg-[#2c2c2e] transition-colors group ${hasBorder ? 'border-b border-white/40 dark:border-white/5' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shadow-sm backdrop-blur-sm ${destructive ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-brand-highlight/50 dark:bg-[#262018]/50 border-brand-500/10 dark:border-brand-500/20 text-brand-600 dark:text-brand-500 group-hover:bg-brand-500 group-hover:text-white dark:group-hover:text-black'}`}>
        <Icon size={20} />
      </div>
      <div>
        <h3 className={`text-sm font-bold ${destructive ? 'text-rose-500' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
        <p className="text-gray-500 text-[10px] font-medium mt-0.5">{subtitle}</p>
      </div>
    </div>
    {rightElement || (
        <ChevronRight size={16} className="text-gray-400 dark:text-gray-600 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
    )}
  </div>
);

const SubPageHeader: React.FC<{ title: string; onBack: () => void; action?: React.ReactNode }> = ({ title, onBack, action }) => (
  <div className="flex items-center justify-between sticky top-0 z-40 px-4 py-3 bg-white/60 dark:bg-[#050505]/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 transition-all animate-slide-in-right">
    <div className="flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors active:scale-90">
            <ChevronLeft size={22} />
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight leading-none">{title}</h2>
    </div>
    <div className="flex items-center gap-3">{action}</div>
  </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (val: boolean) => void }> = ({ checked, onChange }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative ${checked ? 'bg-brand-500' : 'bg-gray-300/50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10'}`}
    >
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
);

export const SettingsView: React.FC<SettingsViewProps> = ({ currentTheme, setCurrentTheme, availableThemes, assets, transactions, onImport }) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [calcInitial, setCalcInitial] = useState(1000);
  const [calcMonthly, setCalcMonthly] = useState(500);
  const [calcRate, setCalcRate] = useState(10);
  const [calcYears, setCalcYears] = useState(10);
  const [hideValues, setHideValues] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiTelemetry = useMemo(() => {
    const logs = getApiLogs();
    const grouped: Record<string, { date: string, total: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      grouped[key] = { date: key, total: 0 };
    }
    logs.forEach((log) => {
      const key = new Date(log.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (grouped[key]) grouped[key].total++;
    });

    return {
      chartData: Object.values(grouped),
      totalBrapi: logs.filter(l => l.service === 'brapi').length,
      totalGemini: logs.filter(l => l.service === 'gemini').length,
      total: logs.length,
      last24h: logs.filter(l => l.timestamp > Date.now() - 24 * 60 * 60 * 1000).length,
      tokens: {
          brapi: getBrapiToken(),
          gemini: process.env.API_KEY || 'N/A'
      }
    };
  }, [activeSection]);

  const calculateCompoundInterest = () => {
    const r = calcRate / 100 / 12;
    const n = calcYears * 12;
    if (r === 0) return { total: calcInitial + (calcMonthly * n) };
    const futureValue = (calcInitial * Math.pow(1 + r, n)) + (calcMonthly * ((Math.pow(1 + r, n) - 1) / r));
    return { total: futureValue };
  };

  const glossaryTerms = [
    { term: 'Dividend Yield (DY)', def: 'Indicador que mede o rendimento de um ativo em relação ao seu preço de mercado.' },
    { term: 'P/VP', def: 'Preço sobre Valor Patrimonial. Abaixo de 1.00 pode indicar que o ativo está descontado.' },
    { term: 'Preço Médio', def: 'A média ponderada do valor pago por cada cota de um ativo na sua carteira.' },
    { term: 'Vacância Física', def: 'Percentual de área de um imóvel que não está locada em um FII de tijolo.' },
    { term: 'Yield on Cost', def: 'O rendimento de dividendos calculado sobre o preço médio pago pelo investidor.' }
  ];

  const maskToken = (token: string) => {
      if (!token || token === 'N/A') return 'Indisponível';
      if (!showTokens) return token.substring(0, 3) + '••••••••' + token.substring(token.length - 3);
      return token;
  };

  const handleExportBackup = () => {
    setIsExporting(true);
    const data = { version: "2.9.0", timestamp: new Date().toISOString(), assets, transactions };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invest_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    setTimeout(() => setIsExporting(false), 1000);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="animate-slide-up pb-10">
            <SubPageHeader title="Meu Perfil" onBack={() => setActiveSection(null)} />
            <div className="px-4 mt-6">
                <div className="relative mb-16">
                    <div className="h-32 w-full rounded-[2rem] bg-gradient-to-r from-brand-500 to-brand-secondary relative overflow-hidden shadow-lg"></div>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full bg-brand-muted p-1.5 shadow-xl ring-4 ring-black/10">
                            <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-white text-2xl font-bold">JD</div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-brand-highlight/20 rounded-2xl border border-white/10">
                    <label className="text-[10px] font-bold uppercase text-gray-500">Perfil de Investidor</label>
                    <p className="text-sm font-bold">Estrategista Pro</p>
                </div>
            </div>
          </div>
        );
      case 'security':
        return (
            <div className="animate-slide-up pb-10">
                <SubPageHeader title="Segurança" onBack={() => setActiveSection(null)} />
                <div className="px-4 mt-6 space-y-4">
                    <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 shadow-lg">
                        <div className="p-5 flex justify-between items-center border-b border-white/5">
                            <div><span className="text-sm font-bold block">Biometria</span><p className="text-[10px] text-gray-500">Solicitar ao abrir o app</p></div>
                            <ToggleSwitch checked={biometrics} onChange={setBiometrics} />
                        </div>
                        <div className="p-5 flex justify-between items-center">
                            <div><span className="text-sm font-bold block">Modo Privacidade</span><p className="text-[10px] text-gray-500">Ocultar valores por padrão</p></div>
                            <ToggleSwitch checked={hideValues} onChange={setHideValues} />
                        </div>
                    </div>
                </div>
            </div>
        );
      case 'api_connections':
        return (
          <div className="animate-slide-up pb-10">
            <SubPageHeader title="Conexões API" onBack={() => setActiveSection(null)} action={
                <button onClick={() => { clearApiLogs(); setActiveSection(null); setTimeout(() => setActiveSection('api_connections'), 10); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <RefreshCcw size={18} className="text-brand-500" />
                </button>
            } />
            <div className="px-4 mt-6 space-y-6">
              <div className="bg-white/60 dark:bg-[#1c1c1e]/60 p-6 rounded-[2rem] border border-white/5 shadow-xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2"><Key size={18} className="text-brand-500" /> Identificadores</h3>
                    <button onClick={() => setShowTokens(!showTokens)} className="flex items-center gap-1.5 text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-1 rounded-lg">
                        {showTokens ? <EyeOff size={12} /> : <Eye size={12} />} {showTokens ? 'Esconder' : 'Ver'}
                    </button>
                 </div>
                 <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">Token BRAPI</span>
                        <div className="p-3 bg-black/10 dark:bg-white/5 rounded-xl border border-white/5 font-mono text-xs break-all">{maskToken(apiTelemetry.tokens.brapi)}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-gray-500 uppercase">API Key Gemini</span>
                        <div className="p-3 bg-black/10 dark:bg-white/5 rounded-xl border border-white/5 font-mono text-xs break-all">{maskToken(apiTelemetry.tokens.gemini)}</div>
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white/60 dark:bg-[#1c1c1e]/60 p-5 rounded-3xl border border-white/5 shadow-md flex flex-col gap-3">
                    <div className="flex justify-between items-center"><Server size={20} className="text-blue-500" /><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span></div>
                    <div><h4 className="text-[10px] font-bold text-gray-400 uppercase">BRAPI ({apiTelemetry.totalBrapi})</h4><p className="text-sm font-black">Ativo</p></div>
                 </div>
                 <div className="bg-white/60 dark:bg-[#1c1c1e]/60 p-5 rounded-3xl border border-white/5 shadow-md flex flex-col gap-3">
                    <div className="flex justify-between items-center"><Cpu size={20} className="text-brand-500" /><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span></div>
                    <div><h4 className="text-[10px] font-bold text-gray-400 uppercase">GEMINI ({apiTelemetry.totalGemini})</h4><p className="text-sm font-black">Ativo</p></div>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'backup':
        return (
            <div className="animate-slide-up pb-10">
                <SubPageHeader title="Backup & Dados" onBack={() => setActiveSection(null)} />
                <div className="px-4 mt-6 space-y-6">
                    <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Seus dados são locais. Exporte backup regularmente para evitar perdas.</p>
                    </div>
                    <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 shadow-lg">
                        <SettingsItem icon={CloudDownload} title="Exportar Backup" subtitle="Salvar dados localmente" onClick={handleExportBackup} rightElement={isExporting ? <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/> : null} />
                        <SettingsItem icon={CloudUpload} title="Importar Backup" subtitle="Restaurar de arquivo JSON" onClick={() => fileInputRef.current?.click()} />
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                             const file = e.target.files?.[0];
                             if(!file) return;
                             const reader = new FileReader();
                             reader.onload = (ev) => {
                                 try {
                                     const json = JSON.parse(ev.target?.result as string);
                                     onImport({ assets: json.assets, transactions: json.transactions || [] });
                                     alert("Dados importados!");
                                     setActiveSection(null);
                                 } catch(e) { alert("Erro ao importar."); }
                             };
                             reader.readAsText(file);
                        }} accept=".json" className="hidden" />
                        <SettingsItem icon={Trash2} title="Limpar Tudo" subtitle="Apagar permanentemente" onClick={() => {
                            if(window.confirm("Isso apagará TUDO. Continuar?")) { localStorage.clear(); window.location.reload(); }
                        }} destructive hasBorder={false} />
                    </div>
                </div>
            </div>
        );
      case 'theme_store':
        return (
           <div className="animate-slide-up pb-10">
            <SubPageHeader title="Loja de Temas" onBack={() => setActiveSection(null)} />
            <div className="px-4 mt-6">
                <div className="grid grid-cols-2 gap-5 pb-20">
                {availableThemes.map((theme) => {
                    const isActive = currentTheme.id === theme.id;
                    return (
                        <div key={theme.id} onClick={() => setCurrentTheme(theme)} className={`relative overflow-hidden rounded-[2.5rem] border-2 transition-all cursor-pointer hover:scale-[1.03] ${isActive ? 'border-brand-500 shadow-xl' : 'border-transparent bg-white/60 dark:bg-[#1c1c1e]/60'}`}>
                            <div className="h-44 w-full p-4 flex justify-center items-center" style={{ background: theme.preview }}>
                                <div className="w-24 h-36 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20"></div>
                            </div>
                            <div className="p-4 bg-white/90 dark:bg-black/40 border-t border-white/10 flex justify-between items-center">
                                <h4 className="text-[11px] font-bold truncate">{theme.name}</h4>
                                {isActive && <Check size={12} className="text-brand-500" />}
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
           </div>
        );
      case 'calculators':
        return (
           <div className="animate-slide-up pb-10">
              <SubPageHeader title="Calculadoras" onBack={() => setActiveSection(null)} />
              <div className="px-4 mt-6">
                <div className="bg-brand-muted p-8 rounded-[2.5rem] border border-brand-500/20 mb-8 text-center shadow-xl">
                    <p className="text-gray-400 text-[10px] font-bold uppercase mb-2">Montante Estimado</p>
                    <h2 className="text-4xl font-bold text-white">R$ {calculateCompoundInterest().total.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</h2>
                </div>
                <div className="space-y-6 px-2">
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-2"><span>Valor Inicial</span><span>R$ {calcInitial}</span></div>
                        <input type="range" min="0" max="50000" step="500" value={calcInitial} onChange={e => setCalcInitial(Number(e.target.value))} className="w-full accent-brand-500" />
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-2"><span>Aporte Mensal</span><span>R$ {calcMonthly}</span></div>
                        <input type="range" min="0" max="10000" step="100" value={calcMonthly} onChange={e => setCalcMonthly(Number(e.target.value))} className="w-full accent-brand-500" />
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-2"><span>Tempo</span><span>{calcYears} Anos</span></div>
                        <input type="range" min="1" max="50" step="1" value={calcYears} onChange={e => setCalcYears(Number(e.target.value))} className="w-full accent-brand-500" />
                    </div>
                </div>
              </div>
           </div>
        );
      case 'glossary':
         return (
            <div className="animate-slide-up pb-10">
               <SubPageHeader title="Glossário" onBack={() => setActiveSection(null)} />
               <div className="px-4 space-y-3 mt-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    {glossaryTerms.map((item, idx) => (
                        <div key={idx} className="bg-white/60 dark:bg-[#1c1c1e]/60 p-5 rounded-[1.5rem] border border-white/5">
                            <h4 className="text-brand-500 font-bold text-sm mb-1.5">{item.term}</h4>
                            <p className="text-gray-500 text-xs font-medium">{item.def}</p>
                        </div>
                    ))}
               </div>
            </div>
         );
      case 'about':
        return (
          <div className="animate-slide-up pb-10">
            <SubPageHeader title="Sobre o Invest" onBack={() => setActiveSection(null)} />
            <div className="px-4 mt-8 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-brand-500/20 blur-[30px] rounded-full animate-pulse"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-secondary rounded-[2rem] flex items-center justify-center shadow-xl relative z-10">
                  <Activity size={48} className="text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-black tracking-tighter">Invest Dashboard</h3>
              <p className="text-brand-500 font-bold text-xs uppercase tracking-widest mb-8">Versão 2.9.0</p>
              <div className="w-full space-y-6">
                <div className="bg-white/60 dark:bg-[#1c1c1e]/60 p-6 rounded-[2rem] border border-white/5 shadow-lg">
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Sparkles size={16} className="text-brand-500" /> Nossa Missão</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">O Invest proporciona soberania financeira através de uma interface de alta fidelidade e análise inteligente, mantendo 100% da privacidade dos dados locais.</p>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Stack Tecnológica</h4>
                  <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/5">
                    <div className="p-4 flex items-center gap-4 border-b border-white/5"><div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><Code2 size={20}/></div><div><p className="text-xs font-bold">React 19 & Tailwind</p><p className="text-[9px] text-gray-500 font-bold uppercase">Interface UI/UX</p></div></div>
                    <div className="p-4 flex items-center gap-4 border-b border-white/5"><div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500"><Sparkles size={20}/></div><div><p className="text-xs font-bold">Gemini 3 AI</p><p className="text-[9px] text-gray-500 font-bold uppercase">Consultoria Financeira</p></div></div>
                    <div className="p-4 flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Globe size={20}/></div><div><p className="text-xs font-bold">BRAPI Service</p><p className="text-[9px] text-gray-500 font-bold uppercase">Cotações B3</p></div></div>
                  </div>
                </div>
                <div className="bg-brand-500/5 border border-brand-500/10 p-6 rounded-[2rem] flex gap-4">
                   <ShieldCheck size={20} className="text-brand-500 shrink-0" />
                   <div><h5 className="text-xs font-bold text-brand-500 mb-1">Privacidade Local-First</h5><p className="text-[10px] text-gray-500 font-medium">Seus dados nunca saem deste dispositivo. Não possuímos banco de dados centralizado.</p></div>
                </div>
                <div className="flex gap-4">
                  <button className="flex-1 py-4 bg-white/60 dark:bg-[#2c2c2e]/60 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-white/5"><Mail size={16}/> Suporte</button>
                  <button className="flex-1 py-4 bg-white/60 dark:bg-[#2c2c2e]/60 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 border border-white/5"><ExternalLink size={16}/> Doc. API</button>
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  if (activeSection) return <div className="pb-32 min-h-screen bg-transparent">{renderContent()}</div>;

  return (
    <div className="px-4 pb-32 animate-fade-in">
      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-2 mt-4 ml-1">Conta & Dados</h3>
      <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 mb-8 shadow-lg">
        <SettingsItem icon={User} title="Meu Perfil" subtitle="Investidor Pro" onClick={() => setActiveSection('profile')} />
        <SettingsItem icon={Shield} title="Segurança" subtitle="Proteção e Privacidade" onClick={() => setActiveSection('security')} />
        <SettingsItem icon={Globe} title="Conexões API" subtitle="Telemetria e Status" onClick={() => setActiveSection('api_connections')} />
        <SettingsItem icon={Database} title="Backup & Dados" subtitle="Importar e Exportar" onClick={() => setActiveSection('backup')} hasBorder={false} />
      </div>

      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-2 ml-1">Experiência</h3>
      <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 mb-8 shadow-lg">
        <SettingsItem icon={Store} title="Loja de Temas" subtitle={`Ativo: ${currentTheme.name}`} onClick={() => setActiveSection('theme_store')} />
        <SettingsItem icon={Calculator} title="Calculadoras" subtitle="Simular Juros Compostos" onClick={() => setActiveSection('calculators')} hasBorder={false} />
      </div>

      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-2 ml-1">Suporte</h3>
      <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 mb-10 shadow-lg">
        <SettingsItem icon={Book} title="Glossário" subtitle="Termos do Mercado" onClick={() => setActiveSection('glossary')} />
        <SettingsItem icon={HelpCircle} title="Sobre o App" subtitle="Versão 2.9.0" onClick={() => setActiveSection('about')} hasBorder={false} />
      </div>

      <button onClick={() => window.location.reload()} className="w-full py-4 flex items-center justify-center gap-2 text-rose-500 opacity-80 hover:opacity-100 transition-all">
        <LogOut size={18} />
        <span className="text-sm font-bold uppercase tracking-wider">Sair da Sessão</span>
      </button>
    </div>
  );
};
