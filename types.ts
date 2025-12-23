
export interface PortfolioItem {
  id: string;
  name: string;
  percentage: number;
  color: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalInvested: number;
  yieldOnCost: number;
  projectedAnnualIncome: number;
  capitalGain: number;
  dailyChange: number;
  dailyChangeValue: number;
}

export interface Asset {
  id: string;
  ticker: string;
  shortName: string;
  companyName: string;
  assetType: string;
  segment: string;
  allocationType: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  dailyChange: number;
  averagePrice: number;
  totalCost: number;
  lastDividend: number;
  lastDividendDate: string;
  dy12m: number;
  color: string;
  image?: string; // Novo campo para Logo
  pvp: number;
  vp: number;
  liquidity: string;
  netWorth: string;
  min52w?: number;
  max52w?: number;
  volatility?: number;
  cnpj?: string;
  administrator?: string;
  vacancy?: number;
  financialVacancy?: number; 
  assetsCount?: number;
  adminFee?: string;
  pl?: number;
  roe?: number;
  netMargin?: number;
  debtEbitda?: number;
  lpa?: number;
}

export interface Dividend {
  id: string;
  date: string;
  amount: number;
  type: string;
  datePaid: string;
  recordDate?: string;
  isFuture?: boolean;
}

export interface Transaction {
  id: string;
  ticker: string;
  date: string;
  type: 'Compra' | 'Venda';
  quantity: number;
  price: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AppTheme {
  id: string;
  name: string;
  type: 'dark' | 'light';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
    muted: string;
  };
  preview: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  type: 'money' | 'news' | 'success' | 'security' | 'system';
  read: boolean;
  group: string;
  actionLabel?: string; // Botão de ação
  onAction?: () => void; // Callback do botão
}
