
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
import { SystemUpdateOverlay } from './components/SystemUpdateOverlay.tsx'; 
import { Asset, Transaction, AppTheme, AppNotification } from './types.ts';
import { fetchTickersData } from './services/brapiService.ts';
import { AVAILABLE_THEMES } from './services/themeService.ts';

const AssetDetailModal = lazy(() => import('./components/AssetDetailModal.tsx').then(m => ({ default: m.AssetDetailModal })));
const DividendCalendarModal = lazy(() => import('./components/DividendCalendarModal.tsx').then(m => ({ default: m.DividendCalendarModal })));
const IncomeReportModal = lazy(() => import('./components/IncomeReportModal.tsx').then(m => ({ default: m.IncomeReportModal })));
const RealPowerModal = lazy(() => import('./components/RealPowerModal.tsx').then(m => ({ default: m.RealPowerModal })));
const EvolutionModal = lazy(() => import('./components/EvolutionModal.tsx').then(m => ({ default: m.EvolutionModal })));
const PortfolioModal = lazy(() => import('./components/PortfolioModal.tsx').then(m => ({ default: m.PortfolioModal })));

// Dados iniciais com datas atualizadas para 2025 para a Agenda funcionar
const INITIAL_ASSETS: Asset[] = [
    {
        id: 'PETR4', ticker: 'PETR4', shortName: 'Petrobras', companyName: 'Petroleo Brasileiro S.A. Petrobras',
        assetType: 'Ação', segment: 'Petróleo e Gás', allocationType: 'Brasil',
        quantity: 100, currentPrice: 38.50, totalValue: 3850, dailyChange: 1.5,
        averagePrice: 32.00, totalCost: 3200, lastDividend: 1.20, lastDividendDate: '20/03/2025',
        dy12m: 18.5, color: '#f59e0b', pvp: 0.95, vp: 40.00, liquidity: 'High', netWorth: '500B'
    },
    {
        id: 'VALE3', ticker: 'VALE3', shortName: 'Vale', companyName: 'Vale S.A.',
        assetType: 'Ação', segment: 'Mineração', allocationType: 'Brasil',
        quantity: 50, currentPrice: 62.10, totalValue: 3105, dailyChange: -0.8,
        averagePrice: 65.00, totalCost: 3250, lastDividend: 2.10, lastDividendDate: '01/04/2025',
        dy12m: 8.2, color: '#10b981', pvp: 1.2, vp: 50.00, liquidity: 'High', netWorth: '300B'
    },
    {
        id: 'MXRF11', ticker: 'MXRF11', shortName: 'Maxi Renda', companyName: 'Maxi Renda FII',
        assetType: 'FII', segment: 'Papel', allocationType: 'FII',
        quantity: 200, currentPrice: 10.50, totalValue: 2100, dailyChange: 0.2,
        averagePrice: 10.10, totalCost: 2020, lastDividend: 0.11, lastDividendDate: '15/02/2025',
        dy12m: 12.5, color: '#3b82f6', pvp: 1.01, vp: 10.40, liquidity: 'High', netWorth: '2.5B'
    }
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e'];

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [refreshStatus, setRefreshStatus] = useState<string>(''); 
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard'); 
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem('invest_assets');
      if (!saved) return INITIAL_ASSETS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Asset[]) : INITIAL_ASSETS;
    } catch (e) { return INITIAL_ASSETS; }
  });

  const assetsRef = useRef<Asset[]>(assets);
  const isRefreshingRef = useRef(false);

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

  useEffect(() => {
    const handleUpdateAvailable = () => {
        setUpdateAvailable(true);
    };
    window.addEventListener('invest-update-available', handleUpdateAvailable);
    return () => window.removeEventListener('invest-update-available', handleUpdateAvailable);
  }, []);

  const handleInstallUpdate = () => {
     if (window.updateApp) {
         window.updateApp();
     } else {
         window.location.reload();
     }
  };

  useEffect(() => {
    localStorage.setItem('invest_assets', JSON.stringify(assets));
    localStorage.setItem('invest_transactions', JSON.stringify(transactions));
    localStorage.setItem('invest_theme', JSON.stringify(currentTheme));
  }, [assets, transactions, currentTheme]);

  const handleSplashComplete = useCallback(() => setIsAppLoading(false), []);

  const refreshMarketData = useCallback(async (force = false) => {
    const currentAssets = assetsRef.current;
    if (currentAssets.length === 0) {
      setRefreshStatus('');
      return;
    }
    if (isRefreshingRef.current && !force) return;
    
    isRefreshingRef.current = true;
    
    const steps = [
        { msg: 'Conectando à B3...', delay: 0 },
        { msg: 'Atualizando Cotações...', delay: 800 },
        { msg: 'Calculando Patrimônio...', delay: 1600 }
    ];

    let currentStepIndex = 0;
    setRefreshStatus(steps[0].msg);

    const interval = setInterval(() => {
        currentStepIndex++;
        if (currentStepIndex < steps.length) {
            setRefreshStatus(steps[currentStepIndex].msg);
        }
    }, 800);

    try {
        const tickers: string[] = Array.from(new Set(currentAssets.map(a => a.ticker))); 
        const liveData = await fetchTickersData(tickers);
        
        clearInterval(interval); 
        setRefreshStatus('Finalizando...');

        if (liveData && liveData.length > 0) {
          setAssets(prev => prev.map(asset => {
              const live = liveData.find((l: any) => l.symbol === asset.ticker);
              if (!live) return asset;

              let lastDiv = asset.lastDividend;
              let lastDivDate = asset.lastDividendDate;
              
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
                image: live.logourl || asset.image,
                pvp: live.priceToBook || asset.pvp || 1,
                pl: live.priceEarnings || asset.pl || 0,
                lastDividend: lastDiv,
                lastDividendDate: lastDivDate,
                dy12m: live.dividendYield || asset.dy12m || 0,
                liquidity: live.regularMarketVolume ? live.regularMarketVolume.toLocaleString('pt-BR') : asset.liquidity,
                segment: live.sector || asset.segment 
              };
          }));
        }
        
        setRefreshStatus('Tudo Atualizado!');
        setTimeout(() => setRefreshStatus(''), 1500);

    } catch (err) {
        console.error("[App] Erro de mercado:", err);
        setRefreshStatus('Erro ao atualizar');
        setTimeout(() => setRefreshStatus(''), 2000);
    } finally {
        isRefreshingRef.current = false;
        clearInterval(interval);
    }
  }, []); 

  const handleImportData = useCallback((newData: { assets: Asset[], transactions: Transaction[] }) => {
    if (newData.assets) setAssets(newData.assets);
    if (newData.transactions) setTransactions(newData.transactions);
    setTimeout(() => refreshMarketData(true), 500);
  }, [refreshMarketData]);

  const recalculateAssetFromHistory = (ticker: string, allTransactions: Transaction[], currentAssets: Asset[]) => {
    const assetTransactions = allTransactions.filter(t => t.ticker === ticker);
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
            totalCost -= (qtySold * currentAvgPrice);
        }
    }

    const existingAsset = currentAssets.find(a => a.ticker === ticker);
    if (quantity <= 0.0001) return currentAssets.filter(a => a.ticker !== ticker);
    
    const avgPrice = quantity > 0 ? totalCost / quantity : 0;
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
    setTimeout(() => refreshMarketData(true), 1000);
  }, [refreshMarketData]);

  const handleDeleteTransaction = useCallback((id: string) => {
    const t = transactions.find(x => x.id === id);
    if (!t) return;
    const remainingTransactions = transactions.filter(x => x.id !== id);
    setTransactions(remainingTransactions);
    setAssets(prev => recalculateAssetFromHistory(t.ticker, remainingTransactions, prev));
  }, [transactions]);

  useEffect(() => {
    if (!isAppLoading) { 
        setTimeout(() => refreshMarketData(true), 1000); 
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
      dailyChangeValue: balance * (weightedAvgChange / 100),
      isSyncing: !!refreshStatus && refreshStatus !== 'Tudo Atualizado!'
    };
  }, [assets, refreshStatus]);

  // Cálculo da Evolução Real (Baseado em Transações)
  const evolutionData = useMemo(() => {
    // Se não houver transações, retorna zerado para evitar crash
    if (transactions.length === 0) return { history: [{value: 0}], profit: 0, profitPercent: 0 };
    
    // Lucro Total Atual
    const profit = summaryData.capitalGain;
    const profitPercent = summaryData.totalInvested > 0 ? (profit / summaryData.totalInvested) * 100 : 0;

    // Gerar pontos do gráfico com base nos últimos 6 meses de transações reais
    const points: { value: number }[] = [];
    const now = new Date();
    
    // Função helper para parsear datas das transações ("DD MMM YYYY")
    const parseDate = (d: string) => {
        const ms: {[k:string]:number} = {'Jan':0,'Fev':1,'Mar':2,'Abr':3,'Mai':4,'Jun':5,'Jul':6,'Ago':7,'Set':8,'Out':9,'Nov':10,'Dez':11};
        const p = d.split(' ');
        if(p.length < 3) return new Date();
        return new Date(parseInt(p[2]), ms[p[1]] || 0, parseInt(p[0]));
    };

    // Gera 6 pontos (últimos 6 meses)
    for (let i = 5; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        // Filtra transações anteriores a data alvo
        const accumTransactions = transactions.filter(t => parseDate(t.date) <= targetDate);
        
        // Calcula quanto tinha investido até aquele momento
        const investedAtTime = accumTransactions.reduce((acc, t) => {
            return acc + (t.type === 'Compra' ? t.total : -t.total);
        }, 0);

        // Como não temos histórico de preço de mercado para cada dia, 
        // usamos o valor investido como proxy para o passado, 
        // e o valor atual real para o presente.
        points.push({ value: investedAtTime });
    }

    // O último ponto deve refletir o valor de mercado atual para mostrar o salto de valorização (se houver)
    // Se quiser mostrar apenas evolução de aportes, use summaryData.totalInvested. 
    // Se quiser mostrar valor patrimonial, use summaryData.totalBalance.
    // Vamos usar totalInvested no histórico e CurrentBalance no último para dar a ideia de resultado final.
    if (points.length > 0) {
        points[points.length - 1] = { value: summaryData.totalBalance };
    }

    return { history: points, profit, profitPercent };
  }, [transactions, summaryData]);

  const portfolioData = useMemo(() => {
    const total = summaryData.totalBalance;
    if (total === 0) return [];
    
    const groups: Record<string, number> = {};
    assets.forEach(a => { 
        const type = a.assetType || 'Outros';
        groups[type] = (groups[type] || 0) + a.totalValue; 
    });
    
    return Object.entries(groups).map(([name, value], index) => ({
        id: name, 
        name, 
        percentage: parseFloat(((value / total) * 100).toFixed(1)),
        color: CHART_COLORS[index % CHART_COLORS.length]
    })).sort((a, b) => b.percentage - a.percentage);
  }, [assets, summaryData.totalBalance]);

  if (isAppLoading) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <div 
        className="min-h-screen flex text-gray-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-700 bg-brand-muted"
        style={{ background: `radial-gradient(circle at 50% -20%, var(--brand-highlight), var(--brand-muted) ${currentTheme.type === 'dark' ? '60%' : '80%'})` }}
    >
      <SystemUpdateOverlay updateAvailable={updateAvailable} onInstall={handleInstallUpdate} />
      
      <div className="bg-noise opacity-[0.02] absolute inset-0 pointer-events-none"></div>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentTheme={currentTheme} />
      <div className="flex-1 flex flex-col h-screen relative z-10 w-full overflow-hidden">
        
        {refreshStatus && (
            <div className="absolute top-0 left-0 w-full h-1 z-50 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-transparent via-brand-500 to-transparent w-[50%] animate-[shimmer_1.5s_infinite_linear]"></div>
            </div>
        )}

        <Header 
          title={showNotifications ? "Notificações" : activeTab === 'dashboard' ? "Invest" : activeTab === 'wallet' ? "Carteira" : activeTab === 'transactions' ? "Extrato" : "Ajustes"} 
          subtitle={refreshStatus || (activeTab === 'dashboard' ? "Visão Geral" : "Detalhes")}
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
                    
                    {/* Passando dados REAIS calculados para o Card de Evolução */}
                    <div className="md:col-span-6 lg:col-span-3">
                        <EvolutionCard 
                            onClick={() => setModalOpen('evolution')} 
                            data={evolutionData.history}
                            value={evolutionData.profit}
                            percentage={evolutionData.profitPercent}
                        />
                    </div>
                    
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
