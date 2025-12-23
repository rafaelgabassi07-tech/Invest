
import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { SummaryCard } from './components/SummaryCard.tsx';
import { PortfolioChart } from './components/PortfolioChart.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { WalletView } from './components/WalletView.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { InflationAnalysisCard } from './components/InflationAnalysisCard.tsx';
import { DividendCalendarCard } from './components/DividendCalendarCard.tsx';
import { IncomeReportCard } from './components/IncomeReportCard.tsx';
import { EvolutionCard } from './components/EvolutionCard.tsx'; 
import { TransactionsView } from './components/TransactionsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { NotificationsView } from './components/NotificationsView.tsx';
import { AIAdvisor } from './components/AIAdvisor.tsx';
import { AddTransactionModal } from './components/AddTransactionModal.tsx';
import { Asset, Transaction, AppTheme, AppNotification } from './types.ts';
import { fetchTickersData } from './services/brapiService.ts';
import { AVAILABLE_THEMES } from './services/themeService.ts';

const AssetDetailModal = lazy(() => import('./components/AssetDetailModal.tsx').then(m => ({ default: m.AssetDetailModal })));
const DividendCalendarModal = lazy(() => import('./components/DividendCalendarModal.tsx').then(m => ({ default: m.DividendCalendarModal })));
const IncomeReportModal = lazy(() => import('./components/IncomeReportModal.tsx').then(m => ({ default: m.IncomeReportModal })));
const RealPowerModal = lazy(() => import('./components/RealPowerModal.tsx').then(m => ({ default: m.RealPowerModal })));
const EvolutionModal = lazy(() => import('./components/EvolutionModal.tsx').then(m => ({ default: m.EvolutionModal })));
const PortfolioModal = lazy(() => import('./components/PortfolioModal.tsx').then(m => ({ default: m.PortfolioModal })));

const INITIAL_ASSETS: Asset[] = [];

// Paleta de cores para o gráfico da dashboard
const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard'); 
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  
  // Notification State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem('invest_assets');
      if (!saved) return INITIAL_ASSETS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as Asset[]) : INITIAL_ASSETS;
    } catch (e) { return INITIAL_ASSETS; }
  });

  const assetsRef = useRef<Asset[]>(assets);
  const isRefreshingRef = useRef(false);

  // Mantém ref atualizada para uso dentro do refreshMarketData
  useEffect(() => { assetsRef.current = assets; }, [assets]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('invest_transactions');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as Transaction[]) : [];
    } catch (e) { return []; }
  });

  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('invest_theme');
      if (!saved) return AVAILABLE_THEMES[0];
      return JSON.parse(saved) as AppTheme;
    } catch (e) { return AVAILABLE_THEMES[0]; }
  });

  // SISTEMA DE ATUALIZAÇÃO: Escuta evento do Service Worker
  useEffect(() => {
    const handleUpdateAvailable = () => {
        setNotifications(prev => {
            if (prev.some(n => n.type === 'system')) return prev; 
            
            const newNotif: AppNotification = {
                id: 999999, 
                title: "Atualização Disponível",
                message: "Uma nova versão do app está pronta. Toque para instalar.",
                time: "Agora",
                type: "system",
                read: false,
                group: "Hoje",
                actionLabel: "Instalar Agora 🚀",
                onAction: () => {
                    if (window.updateApp) window.updateApp();
                }
            };
            return [newNotif, ...prev];
        });
    };

    window.addEventListener('invest-update-available', handleUpdateAvailable);
    return () => window.removeEventListener('invest-update-available', handleUpdateAvailable);
  }, []);

  useEffect(() => {
    localStorage.setItem('invest_assets', JSON.stringify(assets));
    localStorage.setItem('invest_transactions', JSON.stringify(transactions));
    localStorage.setItem('invest_theme', JSON.stringify(currentTheme));
  }, [assets, transactions, currentTheme]);

  const handleSplashComplete = useCallback(() => setIsAppLoading(false), []);

  const refreshMarketData = useCallback(async (force = false) => {
    const currentAssets = assetsRef.current;
    if (currentAssets.length === 0) {
      setIsRefreshing(false);
      return;
    }
    
    if (isRefreshingRef.current && !force) return;
    
    isRefreshingRef.current = true;
    setIsRefreshing(true);

    try {
        const tickers: string[] = Array.from(new Set(currentAssets.map(a => a.ticker))); // Unique tickers
        console.log(`[App] Atualizando ${tickers.length} ativos...`);
        
        const liveData = await fetchTickersData(tickers);
        
        if (liveData && liveData.length > 0) {
          setAssets(prev => prev.map(asset => {
              const live = liveData.find((l: any) => l.symbol === asset.ticker);
              if (!live) return asset;

              let lastDiv = asset.lastDividend;
              let lastDivDate = asset.lastDividendDate;
              
              // Atualiza dividendos se disponíveis na API
              // A BRAPI com fundamental=true pode retornar dividendsData
              if (live.dividendsData?.cashDividends?.length > 0) {
                  const sortedDivs = [...live.dividendsData.cashDividends].sort((a: any, b: any) => 
                      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
                  );
                  const latest = sortedDivs[0];
                  if (latest) {
                    lastDiv = latest.rate;
                    lastDivDate = new Date(latest.paymentDate).toLocaleDateString('pt-BR');
                  }
              }

              return {
                ...asset,
                currentPrice: live.regularMarketPrice || asset.currentPrice,
                totalValue: (live.regularMarketPrice || asset.currentPrice) * asset.quantity,
                dailyChange: live.regularMarketChangePercent || 0,
                companyName: live.longName || asset.companyName,
                image: live.logourl || asset.image, // Captura o Logo
                pvp: live.priceToBook || asset.pvp || 1,
                pl: live.priceEarnings || asset.pl || 0,
                lastDividend: lastDiv,
                lastDividendDate: lastDivDate,
                dy12m: live.dividendYield || asset.dy12m || 0,
                liquidity: live.regularMarketVolume ? live.regularMarketVolume.toLocaleString('pt-BR') : asset.liquidity,
                // Mapeia o setor vindo da API para o segmento, fallback para o que já existia
                segment: live.sector || asset.segment 
              };
          }));
        }
    } catch (err) {
        console.error("[App] Erro de mercado:", err);
    } finally {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
    }
  }, []); 

  const handleImportData = useCallback((newData: { assets: Asset[], transactions: Transaction[] }) => {
    if (newData.assets) setAssets(newData.assets);
    if (newData.transactions) setTransactions(newData.transactions);
    // Força atualização após importação
    setTimeout(() => refreshMarketData(true), 500);
  }, [refreshMarketData]);

  const recalculateAssetFromHistory = (ticker: string, allTransactions: Transaction[], currentAssets: Asset[]) => {
    const assetTransactions = allTransactions.filter(t => t.ticker === ticker);
    // Ordenar transações por data
    assetTransactions.sort((a, b) => {
        const parseDate = (d: string) => {
            const months: {[k:string]:number} = {'Jan':0,'Fev':1,'Mar':2,'Abr':3,'Mai':4,'Jun':5,'Jul':6,'Ago':7,'Set':8,'Out':9,'Nov':10,'Dez':11};
            const p = d.split(' ');
            if (p.length < 3) return 0;
            return new Date(parseInt(p[2]), months[p[1]] || 0, parseInt(p[0])).getTime();
        };
        return parseDate(a.date) - parseDate(b.date);
    });

    let quantity = 0;
    let totalCost = 0;
    
    for (const t of assetTransactions) {
        if (t.type === 'Compra') { 
            quantity += t.quantity; 
            totalCost += t.total; 
        } else if (t.type === 'Venda') {
            const currentAvgPrice = quantity > 0 ? totalCost / quantity : 0;
            const qtySold = Math.min(quantity, t.quantity);
            quantity -= qtySold;
            // Reduz custo proporcionalmente
            totalCost -= (qtySold * currentAvgPrice);
        }
    }

    const existingAsset = currentAssets.find(a => a.ticker === ticker);
    // Se vendeu tudo, remove
    if (quantity <= 0.0001) return currentAssets.filter(a => a.ticker !== ticker);
    
    const avgPrice = quantity > 0 ? totalCost / quantity : 0;
    // Usa preço atual se existir, senão usa o da última transação como placeholder
    const currentPrice = existingAsset ? existingAsset.currentPrice : (assetTransactions.length > 0 ? assetTransactions[assetTransactions.length - 1].price : 0);
    
    const updatedAsset: Asset = {
        ...(existingAsset || {
            id: ticker, ticker: ticker, shortName: ticker.substring(0, 4), companyName: ticker,
            assetType: ticker.endsWith('11') || ticker.endsWith('34') || ticker.endsWith('39') ? 'FII' : 'Ação',
            dailyChange: 0, lastDividend: 0, lastDividendDate: '', dy12m: 0, color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
            pvp: 1, vp: 0, liquidity: 'N/A', netWorth: 'N/A', segment: 'Outros', allocationType: 'Outros'
        }),
        quantity: Number(quantity.toFixed(8)), 
        totalCost, 
        averagePrice: avgPrice, 
        currentPrice, 
        totalValue: quantity * currentPrice
    };

    return existingAsset ? currentAssets.map(a => a.ticker === ticker ? updatedAsset : a) : [updatedAsset, ...currentAssets];
  };

  const handleSaveTransaction = useCallback((newTransaction: Transaction) => {
    let updated: Transaction[] = [];
    setTransactions(prev => {
        updated = prev.some(t => t.id === newTransaction.id) ? prev.map(t => t.id === newTransaction.id ? newTransaction : t) : [newTransaction, ...prev];
        return updated;
    });
    setAssets(prev => recalculateAssetFromHistory(newTransaction.ticker, updated, prev));
    // Força atualização de preços após salvar
    setTimeout(() => refreshMarketData(true), 1000);
  }, [refreshMarketData]);

  const handleDeleteTransaction = useCallback((id: string) => {
    const t = transactions.find(x => x.id === id);
    if (!t) return;
    
    // Precisamos filtrar primeiro para recalcular corretamente
    const remainingTransactions = transactions.filter(x => x.id !== id);
    setTransactions(remainingTransactions);
    
    setAssets(prev => recalculateAssetFromHistory(t.ticker, remainingTransactions, prev));
  }, [transactions]);

  // Efeito inicial para carregar dados assim que o app não estiver mais carregando (Splash)
  useEffect(() => {
    if (!isAppLoading) { 
        // Pequeno delay para garantir que a UI renderizou antes do fetch pesado
        setTimeout(() => refreshMarketData(true), 500); 
    }
  }, [isAppLoading, refreshMarketData]);

  useEffect(() => {
    const root = document.documentElement;
    currentTheme.type === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    Object.entries(currentTheme.colors).forEach(([k, v]) => root.style.setProperty(`--brand-${k}`, v as string));
  }, [currentTheme]);

  const summaryData = useMemo(() => {
    let balance = 0, cost = 0, projected = 0, weightedChange = 0;
    assets.forEach(a => {
        const val = Number(a.totalValue || 0);
        const cst = Number(a.totalCost || 0);
        const div = Number(a.lastDividend || 0);
        const qty = Number(a.quantity || 0);
        const chg = Number(a.dailyChange || 0);

        balance += val; 
        cost += cst;
        projected += (div * qty * 12);
        weightedChange += (chg * val);
    });
    const weightedAvgChange = balance > 0 ? weightedChange / balance : 0;
    return {
      totalBalance: balance, totalInvested: cost, yieldOnCost: cost > 0 ? (projected / cost) * 100 : 0,
      projectedAnnualIncome: projected, capitalGain: balance - cost, dailyChange: weightedAvgChange,
      dailyChangeValue: balance * (weightedAvgChange / 100)
    };
  }, [assets]);

  const portfolioData = useMemo(() => {
    const total = summaryData.totalBalance;
    if (total === 0) return [];
    
    // Agrupa por Tipo de Ativo
    const groups: Record<string, number> = {};
    assets.forEach(a => { 
        const type = a.assetType || 'Outros';
        groups[type] = (groups[type] || 0) + a.totalValue; 
    });
    
    return Object.entries(groups).map(([name, value], index) => ({
        id: name, 
        name, 
        percentage: parseFloat(((value / total) * 100).toFixed(1)),
        // Usa a paleta de cores global rotativa
        color: CHART_COLORS[index % CHART_COLORS.length]
    })).sort((a, b) => b.percentage - a.percentage); // Ordena do maior para o menor
  }, [assets, summaryData.totalBalance]);

  if (isAppLoading) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <div 
        className="min-h-screen flex text-gray-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-700 bg-brand-muted"
        style={{ background: `radial-gradient(circle at 50% -20%, var(--brand-highlight), var(--brand-muted) ${currentTheme.type === 'dark' ? '60%' : '80%'})` }}
    >
      <div className="bg-noise opacity-[0.02] absolute inset-0 pointer-events-none"></div>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentTheme={currentTheme} />
      <div className="flex-1 flex flex-col h-screen relative z-10 w-full overflow-hidden">
        <Header 
          title={showNotifications ? "Notificações" : activeTab === 'dashboard' ? "Invest" : activeTab === 'wallet' ? "Carteira" : activeTab === 'transactions' ? "Extrato" : "Ajustes"} 
          subtitle={isRefreshing ? "Atualizando..." : (activeTab === 'dashboard' ? "Visão Geral" : "Detalhes")}
          showBackButton={(['settings'].includes(activeTab) || showNotifications) && window.innerWidth < 768} 
          showAddButton={!showNotifications && ['dashboard', 'wallet', 'transactions'].includes(activeTab)}
          hasUnreadNotifications={notifications.some(n => !n.read)}
          onAddClick={() => { setTransactionToEdit(null); setIsAddModalOpen(true); }}
          onBackClick={() => {
              if (showNotifications) {
                  setShowNotifications(false);
              } else {
                  setActiveTab(previousTab);
              }
          }}
          onSettingsClick={() => { 
              setShowNotifications(false);
              setPreviousTab(activeTab); 
              setActiveTab('settings'); 
          }}
          onNotificationsClick={() => setShowNotifications(true)}
          onRefreshClick={() => refreshMarketData(true)}
        />
        <main className="flex-1 overflow-y-auto custom-scrollbar animate-fade-in pb-32 md:pb-6 overscroll-contain">
          <div className="w-full px-4 md:px-6 md:max-w-7xl md:mx-auto pt-4">
            
            {showNotifications ? (
                <div className="max-w-3xl mx-auto">
                    <NotificationsView 
                        notifications={notifications} 
                        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                        onNotificationClick={(id) => setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n))}
                    />
                </div>
            ) : (
                <>
                {activeTab === 'dashboard' && (
                <div className="space-y-4 pb-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
                    <div className="md:col-span-8"><SummaryCard data={summaryData} /></div>
                    <div className="md:col-span-4"><PortfolioChart items={portfolioData} onClick={() => setModalOpen('portfolio')} /></div>
                    <div className="md:col-span-6 lg:col-span-3"><EvolutionCard onClick={() => setModalOpen('evolution')} /></div>
                    <div className="md:col-span-6 lg:col-span-3"><DividendCalendarCard assets={assets} onClick={() => setModalOpen('dividendCalendar')} /></div>
                    <div className="md:col-span-6 lg:col-span-3"><IncomeReportCard assets={assets} onClick={() => setModalOpen('incomeReport')} /></div>
                    <div className="md:col-span-6 lg:col-span-3"><InflationAnalysisCard onClick={() => setModalOpen('realPower')} /></div>
                    </div>
                </div>
                )}
                {activeTab === 'wallet' && <div className="max-w-5xl mx-auto"><WalletView assets={assets} onAssetClick={setSelectedAsset} /></div>}
                {activeTab === 'transactions' && <div className="max-w-5xl mx-auto"><TransactionsView transactions={transactions} onEditTransaction={(t) => { setTransactionToEdit(t); setIsAddModalOpen(true); }} /></div>}
                {activeTab === 'settings' && (
                <div className="max-w-4xl mx-auto">
                    <SettingsView currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} availableThemes={AVAILABLE_THEMES} assets={assets} transactions={transactions} onImport={handleImportData} />
                </div>
                )}
                </>
            )}
            
          </div>
        </main>
        {!showNotifications && <div className="md:hidden"><BottomNav activeTab={activeTab} setActiveTab={setActiveTab} /></div>}
        <AIAdvisor summary={summaryData} portfolio={portfolioData} assets={assets} />
        {isAddModalOpen && <AddTransactionModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveTransaction} onDelete={handleDeleteTransaction} initialTransaction={transactionToEdit} />}
        <Suspense fallback={null}>
            {selectedAsset && <AssetDetailModal asset={selectedAsset} transactions={transactions} onClose={() => setSelectedAsset(null)} />}
            {modalOpen === 'realPower' && <RealPowerModal onClose={() => setModalOpen(null)} />}
            {modalOpen === 'dividendCalendar' && <DividendCalendarModal assets={assets} onClose={() => setModalOpen(null)} />}
            {modalOpen === 'incomeReport' && <IncomeReportModal assets={assets} onClose={() => setModalOpen(null)} />}
            {modalOpen === 'evolution' && <EvolutionModal onClose={() => setModalOpen(null)} totalValue={summaryData.totalBalance} transactions={transactions} />}
            {modalOpen === 'portfolio' && <PortfolioModal assets={assets} totalValue={summaryData.totalBalance} onClose={() => setModalOpen(null)} />}
        </Suspense>
      </div>
    </div>
  );
};

export default App;
