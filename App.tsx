
import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { SummaryCard } from './components/SummaryCard.tsx';
import { PortfolioChart } from './components/PortfolioChart.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { WalletView } from './components/WalletView.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { InflationAnalysisCard } from './components/InflationAnalysisCard.tsx';
import { DividendCalendarCard } from './components/DividendCalendarCard.tsx';
import { IncomeReportCard } from './components/IncomeReportCard.tsx';
import { EvolutionCard } from './components/EvolutionCard.tsx'; 
import { TransactionsView } from './components/TransactionsView.tsx';
import { SettingsView } from './components/SettingsView.tsx';
import { AIAdvisor } from './components/AIAdvisor.tsx';
import { Asset, Transaction, AppTheme } from './types.ts';
import { fetchTickersData } from './services/brapiService.ts';
import { AVAILABLE_THEMES } from './services/themeService.ts';

const AssetDetailModal = lazy(() => import('./components/AssetDetailModal.tsx').then(m => ({ default: m.AssetDetailModal })));
const DividendCalendarModal = lazy(() => import('./components/DividendCalendarModal.tsx').then(m => ({ default: m.DividendCalendarModal })));
const IncomeReportModal = lazy(() => import('./components/IncomeReportModal.tsx').then(m => ({ default: m.IncomeReportModal })));
const RealPowerModal = lazy(() => import('./components/RealPowerModal.tsx').then(m => ({ default: m.RealPowerModal })));
const EvolutionModal = lazy(() => import('./components/EvolutionModal.tsx').then(m => ({ default: m.EvolutionModal })));
const PortfolioModal = lazy(() => import('./components/PortfolioModal.tsx').then(m => ({ default: m.PortfolioModal })));

const INITIAL_ASSETS: Asset[] = [
  { id: '1', ticker: 'SNAG11', shortName: 'SNAG', companyName: 'Suno Asset', assetType: 'FIAGRO', segment: 'Crédito Agrícola', allocationType: 'CRAs', quantity: 25, currentPrice: 10.86, totalValue: 271.50, dailyChange: 0, averagePrice: 9.69, totalCost: 242.37, lastDividend: 0.13, lastDividendDate: '23/12/2025', dy12m: 12.73, color: '#ea580c', pvp: 1.05, vp: 10.34, liquidity: '4.5M', netWorth: '627.8M', vacancy: 0.0, cnpj: '30.345.123/0001-99', administrator: 'Suno Asset', assetsCount: 34 },
  { id: '2', ticker: 'BTCI11', shortName: 'BTCI', companyName: 'BTG Pactual', assetType: 'FII', segment: 'Papel', allocationType: 'CRIs', quantity: 25, currentPrice: 9.25, totalValue: 231.25, dailyChange: 0, averagePrice: 9.29, totalCost: 232.35, lastDividend: 0.10, lastDividendDate: '12/12/2025', dy12m: 12.50, color: '#f59e0b', pvp: 0.98, vp: 9.45, liquidity: '1.2M', netWorth: '1.1B', vacancy: 0.0, cnpj: '12.456.789/0001-22', administrator: 'BTG Pactual', assetsCount: 45 }
];

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard'); 
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  
  const [assets, setAssets] = useState<Asset[]>(() => {
    try {
      const saved = localStorage.getItem('invest_assets');
      if (!saved) return INITIAL_ASSETS;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_ASSETS;
    } catch (e) {
      return INITIAL_ASSETS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('invest_transactions');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('invest_theme');
      if (!saved) return AVAILABLE_THEMES[0];
      const parsed = JSON.parse(saved);
      return parsed && parsed.id ? parsed : AVAILABLE_THEMES[0];
    } catch (e) {
      return AVAILABLE_THEMES[0];
    }
  });

  useEffect(() => {
    localStorage.setItem('invest_assets', JSON.stringify(assets));
    localStorage.setItem('invest_transactions', JSON.stringify(transactions));
    localStorage.setItem('invest_theme', JSON.stringify(currentTheme));
  }, [assets, transactions, currentTheme]);

  const handleSplashComplete = useCallback(() => setIsAppLoading(false), []);

  const refreshMarketData = useCallback(async () => {
    if (isRefreshing || !assets || assets.length === 0) return;
    setIsRefreshing(true);
    try {
        const tickers = assets.map(a => a.ticker);
        const liveData = await fetchTickersData(tickers);
        
        if (liveData && liveData.length > 0) {
          setAssets(prev => prev.map(asset => {
              const live = liveData.find((l: any) => l.symbol === asset.ticker);
              return live ? {
                ...asset,
                currentPrice: live.regularMarketPrice,
                totalValue: live.regularMarketPrice * asset.quantity,
                dailyChange: live.regularMarketChangePercent || 0,
                companyName: live.longName || asset.companyName
              } : asset;
          }));
        }
    } catch (err) {
        console.error("[App] Erro de mercado:", err);
    } finally {
        setIsRefreshing(false);
    }
  }, [assets, isRefreshing]);

  const handleImportData = useCallback((newData: { assets: Asset[], transactions: Transaction[] }) => {
    if (newData.assets && Array.isArray(newData.assets)) setAssets(newData.assets);
    if (newData.transactions && Array.isArray(newData.transactions)) setTransactions(newData.transactions);
    setTimeout(() => refreshMarketData(), 500);
  }, [refreshMarketData]);

  useEffect(() => {
    if (!isAppLoading) refreshMarketData();
  }, [isAppLoading, refreshMarketData]);

  useEffect(() => {
    const root = document.documentElement;
    if (!currentTheme || !currentTheme.colors) return;
    
    currentTheme.type === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    const styles = {
      '--brand-primary': currentTheme.colors.primary,
      '--brand-secondary': currentTheme.colors.secondary,
      '--brand-accent': currentTheme.colors.accent,
      '--brand-highlight': currentTheme.colors.highlight,
      '--brand-muted': currentTheme.colors.muted
    };
    Object.entries(styles).forEach(([prop, val]) => root.style.setProperty(prop, val));
  }, [currentTheme]);

  const summaryData = useMemo(() => {
    let balance = 0, cost = 0, projected = 0, weightedChange = 0;
    if (Array.isArray(assets)) {
      assets.forEach(a => {
          balance += (a.totalValue || 0);
          cost += (a.totalCost || 0);
          projected += ((a.lastDividend || 0) * (a.quantity || 0) * 12);
          weightedChange += ((a.dailyChange || 0) * (a.totalValue || 0));
      });
    }
    const weightedAvgChange = balance > 0 ? weightedChange / balance : 0;
    return {
      totalBalance: balance, totalInvested: cost, yieldOnCost: cost > 0 ? (projected / cost) * 100 : 0,
      projectedAnnualIncome: projected, capitalGain: balance - cost, dailyChange: weightedAvgChange,
      dailyChangeValue: balance * (weightedAvgChange / 100)
    };
  }, [assets]);

  const portfolioData = useMemo(() => {
    const total = summaryData.totalBalance;
    if (total === 0 || !Array.isArray(assets)) return [];
    const groups: Record<string, number> = {};
    assets.forEach(a => { groups[a.assetType] = (groups[a.assetType] || 0) + a.totalValue; });
    return Object.entries(groups).map(([name, value], index) => ({
        id: name, name, percentage: parseFloat(((value / total) * 100).toFixed(1)),
        color: index === 0 ? currentTheme.colors.primary : currentTheme.colors.accent
    }));
  }, [assets, summaryData.totalBalance, currentTheme]);

  if (isAppLoading) return <SplashScreen onComplete={handleSplashComplete} />;

  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'dashboard': return "Invest";
      case 'wallet': return "Carteira";
      case 'transactions': return "Extrato";
      default: return "Ajustes";
    }
  };

  return (
    <div 
        className="min-h-screen flex justify-center text-gray-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-700"
        style={{ background: `radial-gradient(circle at 50% -20%, var(--brand-highlight), var(--brand-muted) ${currentTheme.type === 'dark' ? '60%' : '80%'})` }}
    >
      <div className="bg-noise opacity-[0.02]"></div>
      <div className="w-full max-w-md relative flex flex-col h-screen bg-transparent z-10">
        <Header 
          title={getHeaderTitle()} 
          subtitle={isRefreshing ? "Atualizando..." : (activeTab === 'dashboard' ? "Visão Geral" : "Detalhes")}
          showBackButton={['settings'].includes(activeTab)}
          onBackClick={() => setActiveTab(previousTab)}
          onSettingsClick={() => { setPreviousTab(activeTab); setActiveTab('settings'); }}
          onRefreshClick={refreshMarketData}
        />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar animate-fade-in pb-32 overscroll-contain">
          {activeTab === 'dashboard' && (
            <div className="space-y-2 pt-2 pb-4">
              <SummaryCard data={summaryData} />
              <div className="grid grid-cols-1 gap-3 px-1">
                <EvolutionCard onClick={() => setModalOpen('evolution')} />
                <DividendCalendarCard assets={assets} onClick={() => setModalOpen('dividendCalendar')} />
                <IncomeReportCard assets={assets} onClick={() => setModalOpen('incomeReport')} />
                <InflationAnalysisCard onClick={() => setModalOpen('realPower')} />
                <PortfolioChart items={portfolioData} onClick={() => setModalOpen('portfolio')} />
              </div>
            </div>
          )}
          {activeTab === 'wallet' && <WalletView assets={assets} onAssetClick={setSelectedAsset} />}
          {activeTab === 'transactions' && <TransactionsView transactions={transactions} />}
          {activeTab === 'settings' && (
            <SettingsView 
              currentTheme={currentTheme} 
              setCurrentTheme={setCurrentTheme} 
              availableThemes={AVAILABLE_THEMES}
              assets={assets}
              transactions={transactions}
              onImport={handleImportData}
            />
          )}
        </main>
        
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <AIAdvisor summary={summaryData} portfolio={portfolioData} />

        <Suspense fallback={null}>
            {selectedAsset && <AssetDetailModal asset={selectedAsset} transactions={transactions} onClose={() => setSelectedAsset(null)} />}
            {modalOpen === 'realPower' && <RealPowerModal onClose={() => setModalOpen(null)} />}
            {modalOpen === 'dividendCalendar' && <DividendCalendarModal assets={assets} onClose={() => setModalOpen(null)} />}
            {modalOpen === 'incomeReport' && <IncomeReportModal assets={assets} onClose={() => setModalOpen(null)} />}
            {modalOpen === 'evolution' && <EvolutionModal onClose={() => setModalOpen(null)} totalValue={summaryData.totalBalance} />}
            {modalOpen === 'portfolio' && <PortfolioModal assets={assets} totalValue={summaryData.totalBalance} onClose={() => setModalOpen(null)} />}
        </Suspense>
      </div>
    </div>
  );
};

export default App;
