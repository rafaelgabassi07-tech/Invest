
import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { SummaryCard } from './components/SummaryCard';
import { PortfolioChart } from './components/PortfolioChart';
import { BottomNav } from './components/BottomNav';
import { WalletView } from './components/WalletView';
import { SplashScreen } from './components/SplashScreen';
import { InflationAnalysisCard } from './components/InflationAnalysisCard';
import { DividendCalendarCard } from './components/DividendCalendarCard';
import { IncomeReportCard } from './components/IncomeReportCard';
import { EvolutionCard } from './components/EvolutionCard'; 
import { TransactionsView } from './components/TransactionsView';
import { SettingsView } from './components/SettingsView';
import { AIAdvisor } from './components/AIAdvisor';
import { AddTransactionModal } from './components/AddTransactionModal';
import { Asset, Transaction, AppTheme } from './types';
import { fetchTickersData } from './services/brapiService';
import { AVAILABLE_THEMES } from './services/themeService';

const AssetDetailModal = lazy(() => import('./components/AssetDetailModal').then(m => ({ default: m.AssetDetailModal })));
const DividendCalendarModal = lazy(() => import('./components/DividendCalendarModal').then(m => ({ default: m.DividendCalendarModal })));
const IncomeReportModal = lazy(() => import('./components/IncomeReportModal').then(m => ({ default: m.IncomeReportModal })));
const RealPowerModal = lazy(() => import('./components/RealPowerModal').then(m => ({ default: m.RealPowerModal })));
const EvolutionModal = lazy(() => import('./components/EvolutionModal').then(m => ({ default: m.EvolutionModal })));
const PortfolioModal = lazy(() => import('./components/PortfolioModal').then(m => ({ default: m.PortfolioModal })));

const INITIAL_ASSETS: Asset[] = [];

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard'); 
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const hasLoadedInitialData = useRef(false);

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
      return JSON.parse(saved);
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

  const refreshMarketData = useCallback(async (force = false) => {
    if (isRefreshing || assets.length === 0) return;
    setIsRefreshing(true);
    try {
        const tickers = assets.map(a => a.ticker);
        const liveData = await fetchTickersData(tickers, force);
        
        if (liveData && liveData.length > 0) {
          setAssets(prev => prev.map(asset => {
              const live = liveData.find((l: any) => l.symbol === asset.ticker);
              if (!live) return asset;
              
              const newTotalValue = live.regularMarketPrice * asset.quantity;
              const newDailyChange = live.regularMarketChangePercent || 0;
              
              if (asset.currentPrice === live.regularMarketPrice && asset.dailyChange === newDailyChange) {
                return asset;
              }

              return {
                ...asset,
                currentPrice: live.regularMarketPrice,
                totalValue: newTotalValue,
                dailyChange: newDailyChange,
                companyName: live.longName || asset.companyName,
                shortName: asset.shortName || live.symbol,
              };
          }));
        }
    } catch (err) {
        console.error("[App] Erro de mercado:", err);
    } finally {
        setIsRefreshing(false);
    }
  }, [assets, isRefreshing]);

  const handleImportData = useCallback((newData: { assets: Asset[], transactions: Transaction[] }) => {
    if (newData.assets) setAssets(newData.assets);
    if (newData.transactions) setTransactions(newData.transactions);
    setTimeout(() => refreshMarketData(true), 500);
  }, [refreshMarketData]);

  const handleSaveTransaction = useCallback((newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);

    setAssets(prevAssets => {
      const assetIndex = prevAssets.findIndex(a => a.ticker === newTransaction.ticker);
      
      if (newTransaction.type === 'Compra') {
        if (assetIndex >= 0) {
          const asset = prevAssets[assetIndex];
          const newQty = asset.quantity + newTransaction.quantity;
          const newTotalCost = asset.totalCost + newTransaction.total;
          const newAvgPrice = newTotalCost / newQty;
          
          const updatedAsset = {
            ...asset,
            quantity: newQty,
            totalCost: newTotalCost,
            averagePrice: newAvgPrice,
            totalValue: asset.currentPrice * newQty 
          };
          
          const newList = [...prevAssets];
          newList[assetIndex] = updatedAsset;
          return newList;
        } else {
          const newAsset: Asset = {
            id: newTransaction.ticker,
            ticker: newTransaction.ticker,
            shortName: newTransaction.ticker.substring(0, 4),
            companyName: newTransaction.ticker,
            assetType: newTransaction.ticker.length > 5 || newTransaction.ticker.endsWith('11') ? 'FII' : 'Ação',
            quantity: newTransaction.quantity,
            currentPrice: newTransaction.price,
            totalValue: newTransaction.total,
            dailyChange: 0,
            averagePrice: newTransaction.price,
            totalCost: newTransaction.total,
            lastDividend: 0,
            lastDividendDate: '',
            dy12m: 0,
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            pvp: 1,
            vp: newTransaction.price,
            liquidity: 'N/A',
            netWorth: 'N/A',
            segment: 'Outros',
            allocationType: 'Outros'
          };
          return [...prevAssets, newAsset];
        }
      } else {
         if (assetIndex >= 0) {
           const asset = prevAssets[assetIndex];
           const newQty = Math.max(0, asset.quantity - newTransaction.quantity);
           
           if (newQty === 0) {
             return prevAssets.filter(a => a.ticker !== newTransaction.ticker);
           }
           
           const costRemoved = asset.averagePrice * newTransaction.quantity;
           const newTotalCost = Math.max(0, asset.totalCost - costRemoved);
           
           const updatedAsset = {
             ...asset,
             quantity: newQty,
             totalCost: newTotalCost,
             totalValue: asset.currentPrice * newQty
           };
           const newList = [...prevAssets];
           newList[assetIndex] = updatedAsset;
           return newList;
         }
         return prevAssets;
      }
    });

    setTimeout(() => refreshMarketData(true), 1000);
  }, [refreshMarketData]);

  useEffect(() => {
    if (!isAppLoading && !hasLoadedInitialData.current) {
      refreshMarketData(false);
      hasLoadedInitialData.current = true;
    }
  }, [isAppLoading, refreshMarketData]);

  useEffect(() => {
    const root = document.documentElement;
    currentTheme.type === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
    const styles = {
      '--brand-primary': currentTheme.colors.primary,
      '--brand-secondary': currentTheme.colors.secondary,
      '--brand-accent': currentTheme.colors.accent,
      '--brand-highlight': currentTheme.colors.highlight,
      '--brand-muted': currentTheme.colors.muted
    } as any;
    Object.entries(styles).forEach(([prop, val]) => root.style.setProperty(prop, val as string));
  }, [currentTheme]);

  const summaryData = useMemo(() => {
    let balance = 0, cost = 0, projected = 0, weightedChange = 0;
    assets.forEach(a => {
        balance += (a.totalValue || 0);
        cost += (a.totalCost || 0);
        projected += ((a.lastDividend || 0) * (a.quantity || 0) * 12);
        weightedChange += ((a.dailyChange || 0) * (a.totalValue || 0));
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
    const groups: Record<string, number> = {};
    assets.forEach(a => { groups[a.assetType] = (groups[a.assetType] || 0) + a.totalValue; });
    return Object.entries(groups).map(([name, value], index) => ({
        id: name, name, percentage: parseFloat(((value / total) * 100).toFixed(1)),
        color: index === 0 ? currentTheme.colors.primary : currentTheme.colors.accent
    }));
  }, [assets, summaryData.totalBalance, currentTheme]);

  if (isAppLoading) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <div 
        className="min-h-screen flex justify-center text-gray-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-700"
        style={{ background: `radial-gradient(circle at 50% -20%, var(--brand-highlight), var(--brand-muted) ${currentTheme.type === 'dark' ? '60%' : '80%'})` }}
    >
      <div className="bg-noise opacity-[0.02]"></div>
      <div className="w-full max-w-md relative flex flex-col h-screen bg-transparent z-10">
        <Header 
          title={activeTab === 'dashboard' ? "Invest" : activeTab === 'wallet' ? "Carteira" : activeTab === 'transactions' ? "Extrato" : "Ajustes"} 
          subtitle={isRefreshing ? "Atualizando..." : (activeTab === 'dashboard' ? "Visão Geral" : "Detalhes")}
          showBackButton={['settings'].includes(activeTab)}
          showAddButton={['dashboard', 'wallet', 'transactions'].includes(activeTab)}
          onAddClick={() => setIsAddModalOpen(true)}
          onBackClick={() => setActiveTab(previousTab)}
          onSettingsClick={() => { setPreviousTab(activeTab); setActiveTab('settings'); }}
          onRefreshClick={() => refreshMarketData(true)}
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
        <AIAdvisor summary={summaryData} portfolio={portfolioData} assets={assets} />

        {isAddModalOpen && (
          <AddTransactionModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSave={handleSaveTransaction} 
          />
        )}

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
