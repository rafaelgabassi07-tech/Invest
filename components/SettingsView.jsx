
import React, { useState, useRef } from 'react';
import { 
  User, Shield, Settings, Bell, 
  Calculator, Book, LogOut, ChevronRight, ChevronLeft,
  Download, Search, Check, Smartphone, Store, Lock, EyeOff, Fingerprint,
  DollarSign, Mail, ShieldCheck, Laptop, Globe,
  Trash2, HelpCircle, AlertTriangle, FileJson, FileSpreadsheet,
  Coins, Database, CloudDownload, CloudUpload, AlertCircle
} from 'lucide-react';

const SettingsItem = ({ icon: Icon, title, subtitle, onClick, hasBorder = true, rightElement, destructive }) => (
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

const SubPageHeader = ({ title, onBack, action }) => (
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

const ToggleSwitch = ({ checked, onChange }) => (
    <button 
        onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
        className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 relative ${checked ? 'bg-brand-500' : 'bg-gray-300/50 dark:bg-[#2c2c2e] border border-gray-200 dark:border-white/10'}`}
    >
        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </button>
);

export const SettingsView = ({ currentTheme, setCurrentTheme, availableThemes, assets, transactions, onImport }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [themeFilter, setThemeFilter] = useState('all');
  const [calcInitial, setCalcInitial] = useState(1000);
  const [calcMonthly, setCalcMonthly] = useState(500);
  const [calcRate, setCalcRate] = useState(10);
  const [calcYears, setCalcYears] = useState(10);
  const [hideValues, setHideValues] = useState(false);
  const [biometrics, setBiometrics] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef(null);

  const filteredThemes = availableThemes.filter(t => themeFilter === 'all' ? true : t.type === themeFilter);

  const calculateCompoundInterest = () => {
    const r = calcRate / 100 / 12;
    const n = calcYears * 12;
    const futureValue = (calcInitial * Math.pow(1 + r, n)) + (calcMonthly * ((Math.pow(1 + r, n) - 1) / r));
    const totalInvested = calcInitial + (calcMonthly * n);
    return { total: futureValue, invested: totalInvested, interest: futureValue - totalInvested };
  };

  const glossaryTerms = [
    { term: 'Amortização', def: 'Devolução de parte do capital investido em um FII.' },
    { term: 'Benchmark', def: 'Índice de referência para comparar a rentabilidade (ex: CDI, IFIX).' },
    { term: 'Dividend Yield (DY)', def: 'Rendimento pago pelo ativo em relação ao seu preço.' },
    { term: 'P/VP', def: 'Preço sobre Valor Patrimonial. Indica se está caro ou barato.' },
    { term: 'Vacância Financeira', def: 'Perda de receita potencial devido a imóveis vagos.' },
  ];

  const handleExportBackup = () => {
    setIsExporting(true);
    const data = {
        version: "2.4.0",
        timestamp: new Date().toISOString(),
        assets,
        transactions
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invest_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result);
            
            // Validação simples de estrutura
            if (!json.assets || !Array.isArray(json.assets)) {
                throw new Error("Arquivo inválido: Lista de ativos não encontrada.");
            }

            if (window.confirm("Atenção: Importar dados substituirá sua carteira atual. Deseja continuar?")) {
                onImport({
                    assets: json.assets,
                    transactions: json.transactions || []
                });
                alert("Dados importados com sucesso!");
                setActiveSection(null);
            }
        } catch (err) {
            alert("Erro ao importar arquivo: " + (err instanceof Error ? err.message : "Formato inválido"));
        }
    };
    reader.readAsText(file);
    // Limpar input para permitir importar o mesmo arquivo se necessário
    e.target.value = '';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="animate-slide-up pb-10">
            <SubPageHeader title="Meu Perfil" onBack={() => setActiveSection(null)} action={<Check className="text-emerald-500" />} />
            <div className="px-4 mt-6">
                <div className="relative mb-16">
                    <div className="h-32 w-full rounded-[2rem] bg-gradient-to-r from-brand-500 to-brand-secondary relative overflow-hidden shadow-lg"></div>
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full bg-brand-muted p-1.5 shadow-xl ring-4 ring-black/10">
                            <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-white text-2xl font-bold">JD</div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-brand-highlight/20 rounded-2xl border border-white/10">
                        <label className="text-[10px] font-bold uppercase text-gray-500">Nome</label>
                        <p className="text-sm font-bold">João da Silva</p>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'security':
        return (
            <div className="animate-slide-up pb-10">
                <SubPageHeader title="Segurança" onBack={() => setActiveSection(null)} />
                <div className="px-4 mt-6">
                    <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 shadow-lg">
                        <div className="p-5 flex justify-between items-center border-b border-white/5">
                            <span className="text-sm font-bold">Biometria</span>
                            <ToggleSwitch checked={biometrics} onChange={setBiometrics} />
                        </div>
                        <div className="p-5 flex justify-between items-center">
                            <span className="text-sm font-bold">Ocultar Valores</span>
                            <ToggleSwitch checked={hideValues} onChange={setHideValues} />
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
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            Seus dados são armazenados apenas localmente neste dispositivo. Recomendamos exportar um backup regularmente para evitar perda de dados.
                        </p>
                    </div>

                    <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 shadow-lg">
                        <SettingsItem 
                            icon={CloudDownload} 
                            title="Exportar Backup" 
                            subtitle="Salvar dados em arquivo JSON" 
                            onClick={handleExportBackup} 
                            rightElement={isExporting ? <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/> : null}
                        />
                        <SettingsItem 
                            icon={CloudUpload} 
                            title="Importar Backup" 
                            subtitle="Restaurar de um arquivo JSON" 
                            onClick={handleImportClick} 
                        />
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                    </div>

                    <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 shadow-lg">
                        <SettingsItem 
                            icon={Trash2} 
                            title="Limpar Tudo" 
                            subtitle="Apagar todos os dados do app" 
                            onClick={() => {
                                if(window.confirm("TEM CERTEZA? Isso apagará todos os seus investimentos permanentemente.")) {
                                    localStorage.clear();
                                    window.location.reload();
                                }
                            }} 
                            destructive 
                            hasBorder={false}
                        />
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
                {filteredThemes.map((theme) => {
                    const isActive = currentTheme.id === theme.id;
                    return (
                        <div key={theme.id} onClick={() => setCurrentTheme(theme)} className={`relative overflow-hidden rounded-[2.5rem] border-2 transition-all cursor-pointer group hover:scale-[1.03] ${isActive ? 'border-brand-500 shadow-2xl shadow-brand-500/20' : 'border-transparent bg-white/60 dark:bg-[#1c1c1e]/60'}`}>
                            <div className="h-44 w-full p-4 flex justify-center items-center" style={{ background: theme.preview }}>
                                <div className="w-24 h-36 rounded-2xl bg-black/20 backdrop-blur-md border border-white/20 shadow-xl"></div>
                            </div>
                            <div className="p-4 bg-white/90 dark:bg-black/40 border-t border-white/10">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-[11px] font-bold truncate">{theme.name}</h4>
                                    {isActive && <Check size={12} className="text-brand-500" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
            </div>
           </div>
        );
      case 'calculators':
        const res = calculateCompoundInterest();
        return (
           <div className="animate-slide-up pb-10">
              <SubPageHeader title="Calculadoras" onBack={() => setActiveSection(null)} />
              <div className="px-4 mt-6">
                <div className="bg-brand-muted p-8 rounded-[2.5rem] border border-brand-500/20 mb-8 text-center shadow-2xl">
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">Montante Final</p>
                    <h2 className="text-4xl font-bold text-white">R$ {res.total.toLocaleString('pt-BR')}</h2>
                </div>
                <div className="space-y-6">
                    <input type="range" min="0" max="50000" step="100" value={calcInitial} onChange={e => setCalcInitial(Number(e.target.value))} className="w-full accent-brand-500" />
                    <p className="text-xs font-bold text-center">Valor Inicial: R$ {calcInitial}</p>
                </div>
              </div>
           </div>
        );
      case 'glossary':
         return (
            <div className="animate-slide-up h-[70vh] flex flex-col">
               <SubPageHeader title="Glossário" onBack={() => setActiveSection(null)} />
               <div className="px-4 flex-1 overflow-y-auto space-y-3 mt-4 custom-scrollbar">
                    {glossaryTerms.map((item, idx) => (
                        <div key={idx} className="bg-white/60 dark:bg-[#1c1c1e]/60 p-5 rounded-[1.5rem] border border-white/5">
                            <h4 className="text-brand-500 font-bold text-sm mb-1.5">{item.term}</h4>
                            <p className="text-gray-500 text-xs font-medium">{item.def}</p>
                        </div>
                    ))}
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
        <SettingsItem icon={Database} title="Backup & Dados" subtitle="Importar e Exportar" onClick={() => setActiveSection('backup')} hasBorder={false} />
      </div>

      <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3 px-2 ml-1">Experiência</h3>
      <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 mb-8 shadow-lg">
        <SettingsItem icon={Store} title="Loja de Temas" subtitle={`Ativo: ${currentTheme.name}`} onClick={() => setActiveSection('theme_store')} />
        <SettingsItem icon={Calculator} title="Calculadoras" subtitle="Simular Juros Compostos" onClick={() => setActiveSection('calculators')} hasBorder={false} />
      </div>

      <div className="bg-white/60 dark:bg-[#1c1c1e]/60 rounded-[2rem] overflow-hidden border border-white/40 dark:border-white/5 mb-10 shadow-lg">
        <SettingsItem icon={Book} title="Glossário" subtitle="Termos do Mercado" onClick={() => setActiveSection('glossary')} />
        <SettingsItem icon={HelpCircle} title="Sobre" subtitle="Versão 2.4.0" onClick={() => setActiveSection('about')} hasBorder={false} />
      </div>

      <button 
        onClick={() => {
            if(window.confirm("Deseja sair da conta? Os dados salvos localmente permanecerão neste dispositivo.")) {
                window.location.reload();
            }
        }}
        className="w-full py-4 flex items-center justify-center gap-2 text-rose-500 opacity-80 hover:opacity-100 transition-all"
      >
        <LogOut size={18} />
        <span className="text-sm font-bold uppercase tracking-wider">Sair da Conta</span>
      </button>
    </div>
  );
};
