
import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback } from 'react';
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
import { AIAdvisor } from './components/AIAdvisor.tsx';
import { AddTransactionModal } from './components/AddTransactionModal.tsx';
import { Asset, Transaction, AppTheme } from './types.ts';
import { fetchTickersData } from './services/brapiService.ts';
import { AVAILABLE_THEMES } from './services/themeService.ts';

const AssetDetailModal = lazy(() => import('./components/AssetDetailModal.tsx').then(m => ({ default: m.AssetDetailModal })));
const DividendCalendarModal = lazy(() => import('./components/DividendCalendarModal.tsx').then(m => ({ default: m.DividendCalendarModal })));
const IncomeReportModal = lazy(() => import('./components/IncomeReportModal.tsx').then(m => ({ default: m.IncomeReportModal })));
const RealPowerModal = lazy(() => import('./components/RealPowerModal.tsx').then(m => ({ default: m.RealPowerModal })));
const EvolutionModal = lazy(() => import('./components/EvolutionModal.tsx').then(m => ({ default: m.EvolutionModal })));
const PortfolioModal = lazy(() => import('./components/PortfolioModal.tsx').then(m => ({ default: m.PortfolioModal })));

// Dados iniciais zerados para produção
const INITIAL_ASSETS: Asset[] = [];

const App: React.FC = () => {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previousTab, setPreviousTab] = useState('dashboard'); 
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  
  // State for Add/Edit Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  
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

  const refreshMarketData = useCallback(async () => {
    if (isRefreshing || assets.length === 0) return;
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
    if (newData.assets) setAssets(newData.assets);
    if (newData.transactions) setTransactions(newData.transactions);
    setTimeout(() => refreshMarketData(), 500);
  }, [refreshMarketData]);

  // --- LOGIC CORE: Transaction Management ---
  
  // Função auxiliar para recalcular um ativo específico do zero baseando-se no histórico
  const recalculateAssetFromHistory = (ticker: string, allTransactions: Transaction[], currentAssets: Asset[]) => {
    // 1. Filtrar transações apenas deste ativo
    const assetTransactions = allTransactions.filter(t => t.ticker === ticker);

    // 2. Ordenar cronologicamente (Antigo -> Novo) para o cálculo do PM fazer sentido
    assetTransactions.sort((a, b) => {
        const parseDate = (d: string) => {
            const months: {[k:string]:number} = {'Jan':0,'Fev':1,'Mar':2,'Abr':3,'Mai':4,'Jun':5,'Jul':6,'Ago':7,'Set':8,'Out':9,'Nov':10,'Dez':11};
            const p = d.split(' ');
            if (p.length < 3) return 0;
            return new Date(parseInt(p[2]), months[p[1]] || 0, parseInt(p[0])).getTime();
        };
        return parseDate(a.date) - parseDate(b.date);
    });

    // 3. Replay do histórico
    let quantity = 0;
    let totalCost = 0; // Custo de Aquisição Total

    for (const t of assetTransactions) {
        if (t.type === 'Compra') {
            // Compra aumenta quantidade e custo
            quantity += t.quantity;
            totalCost += t.total; 
        } else if (t.type === 'Venda') {
            // Venda reduz quantidade
            // O custo total reduz PROPORCIONALMENTE ao preço médio atual
            // PM não muda na venda (Regra Contábil)
            const currentAvgPrice = quantity > 0 ? totalCost / quantity : 0;
            const qtySold = Math.min(quantity, t.quantity); // Não vender mais que tem
            
            quantity -= qtySold;
            totalCost -= (qtySold * currentAvgPrice);
        }
    }

    // 4. Atualizar o estado dos Ativos
    const existingAsset = currentAssets.find(a => a.ticker === ticker);
    const lastTransPrice = assetTransactions.length > 0 ? assetTransactions[assetTransactions.length - 1].price : 0;

    // Se a quantidade for zero (ou negativa por erro), removemos o ativo da carteira
    if (quantity <= 0.0001) {
        return currentAssets.filter(a => a.ticker !== ticker);
    }

    const avgPrice = quantity > 0 ? totalCost / quantity : 0;
    const currentPrice = existingAsset ? existingAsset.currentPrice : lastTransPrice;

    const updatedAsset: Asset = {
        ...(existingAsset || {
            id: ticker,
            ticker: ticker,
            shortName: ticker.substring(0, 4),
            companyName: ticker, // Será atualizado pela API depois
            assetType: ticker.endsWith('11') || ticker.endsWith('34') || ticker.endsWith('39') ? 'FII' : 'Ação',
            dailyChange: 0,
            lastDividend: 0,
            lastDividendDate: '',
            dy12m: 0,
            color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
            pvp: 1,
            vp: 0,
            liquidity: 'N/A',
            netWorth: 'N/A',
            segment: 'Outros',
            allocationType: 'Outros'
        }),
        quantity: Number(quantity.toFixed(8)), // Evitar problemas de float precision
        totalCost: totalCost,
        averagePrice: avgPrice,
        currentPrice: currentPrice,
        totalValue: quantity * currentPrice
    };

    if (existingAsset) {
        return currentAssets.map(a => a.ticker === ticker ? updatedAsset : a);
    } else {
        return [updatedAsset, ...currentAssets];
    }
  };

  const handleSaveTransaction = useCallback((newTransaction: Transaction) => {
    // 1. Atualizar lista de Transações
    let updatedTransactions: Transaction[] = [];
    
    setTransactions(prev => {
        const exists = prev.some(t => t.id === newTransaction.id);
        if (exists) {
            // Edição
            updatedTransactions = prev.map(t => t.id === newTransaction.id ? newTransaction : t);
        } else {
            // Novo
            updatedTransactions = [newTransaction, ...prev];
        }
        return updatedTransactions;
    });

    // 2. Recalcular Ativo
    setAssets(prevAssets => recalculateAssetFromHistory(newTransaction.ticker, updatedTransactions, prevAssets));

    // 3. Trigger Refresh
    setTimeout(() => refreshMarketData(), 500);
  }, [refreshMarketData]);

  const handleDeleteTransaction = useCallback((transactionId: string) => {
    // Encontrar a transação antes de deletar para saber qual ticker recalcular
    const transactionToDelete = transactions.find(t => t.id === transactionId);
    if (!transactionToDelete) return;

    // 1. Remover da lista
    const updatedTransactions = transactions.filter(t => t.id !== transactionId);
    setTransactions(updatedTransactions);

    // 2. Recalcular Ativo
    setAssets(prevAssets => recalculateAssetFromHistory(transactionToDelete.ticker, updatedTransactions, prevAssets));
  }, [transactions]);

  // --- End Logic Core ---

  useEffect(() => {
    if (!isAppLoading) refreshMarketData();
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
    };
    Object.entries(styles).forEach(([prop, val]) => root.style.setProperty(prop, val));
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
        className="min-h-screen flex text-gray-900 dark:text-white font-sans overflow-hidden relative transition-colors duration-700 bg-brand-muted"
        style={{ background: `radial-gradient(circle at 50% -20%, var(--brand-highlight), var(--brand-muted) ${currentTheme.type === 'dark' ? '60%' : '80%'})` }}
    >
      <div className="bg-noise opacity-[0.02] absolute inset-0 pointer-events-none"></div>
      
      {/* Desktop Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} currentTheme={currentTheme} />

      <div className="flex-1 flex flex-col h-screen relative z-10 w-full overflow-hidden">
        <Header 
          title={activeTab === 'dashboard' ? "Invest" : activeTab === 'wallet' ? "Carteira" : activeTab === 'transactions' ? "Extrato" : "Ajustes"} 
          subtitle={isRefreshing ? "Atualizando..." : (activeTab === 'dashboard' ? "Visão Geral" : "Detalhes")}
          showBackButton={['settings'].includes(activeTab) && window.innerWidth < 768} 
          showAddButton={['dashboard', 'wallet', 'transactions'].includes(activeTab)}
          onAddClick={() => { setTransactionToEdit(null); setIsAddModalOpen(true); }}
          onBackClick={() => setActiveTab(previousTab)}
          onSettingsClick={() => { setPreviousTab(activeTab); setActiveTab('settings'); }}
          onRefreshClick={refreshMarketData}
        />
        
        <main className="flex-1 overflow-y-auto custom-scrollbar animate-fade-in pb-32 md:pb-6 overscroll-contain">
          <div className="w-full md:px-6 md:max-w-7xl md:mx-auto">
            
            {activeTab === 'dashboard' && (
              <div className="space-y-4 pt-2 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-12 md:gap-6 gap-3 px-1 md:px-0">
                  
                  {/* Row 1 */}
                  <div className="md:col-span-8">
                    <SummaryCard data={summaryData} />
                  </div>
                  <div className="md:col-span-4">
                     <PortfolioChart items={portfolioData} onClick={() => setModalOpen('portfolio')} />
                  </div>

                  {/* Row 2 */}
                  <div className="md:col-span-6 lg:col-span-3">
                    <EvolutionCard onClick={() => setModalOpen('evolution')} />
                  </div>
                  <div className="md:col-span-6 lg:col-span-3">
                    <DividendCalendarCard assets={assets} onClick={() => setModalOpen('dividendCalendar')} />
                  </div>
                  <div className="md:col-span-6 lg:col-span-3">
                    <IncomeReportCard assets={assets} onClick={() => setModalOpen('incomeReport')} />
                  </div>
                  <div className="md:col-span-6 lg:col-span-3">
                    <InflationAnalysisCard onClick={() => setModalOpen('realPower')} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="max-w-5xl mx-auto">
                <WalletView assets={assets} onAssetClick={setSelectedAsset} />
              </div>
            )}
            
            {activeTab === 'transactions' && (
              <div className="max-w-5xl mx-auto">
                <TransactionsView 
                    transactions={transactions} 
                    onEditTransaction={(t) => { 
                        setTransactionToEdit(t); 
                        setIsAddModalOpen(true); 
                    }} 
                />
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto">
                <SettingsView 
                  currentTheme={currentTheme} 
                  setCurrentTheme={setCurrentTheme} 
                  availableThemes={AVAILABLE_THEMES}
                  assets={assets}
                  transactions={transactions}
                  onImport={handleImportData}
                />
              </div>
            )}

          </div>
        </main>
        
        {/* Mobile Bottom Nav */}
        <div className="md:hidden">
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        <AIAdvisor summary={summaryData} portfolio={portfolioData} />

        {isAddModalOpen && (
          <AddTransactionModal 
            onClose={() => setIsAddModalOpen(false)} 
            onSave={handleSaveTransaction} 
            onDelete={handleDeleteTransaction}
            initialTransaction={transactionToEdit}
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
