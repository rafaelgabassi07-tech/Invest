
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
  // New Fields for Structure Analysis
  segment: string;       // e.g., "Logística", "Papel", "Fiagro", "Bancário"
  allocationType: string; // e.g., "Imóveis Físicos", "Certificados (CRI)", "CRA", "Ações"
  
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
  
  // Detail View Fields
  pvp: number;
  vp: number;
  liquidity: string;
  netWorth: string;
  
  // Expanded Data
  min52w?: number;
  max52w?: number;
  volatility?: number;
  cnpj?: string;
  administrator?: string; // Gestora ou Admin

  // FII Specific (Optional)
  vacancy?: number; // Vacância Física
  financialVacancy?: number; 
  assetsCount?: number; // Quantidade de imóveis ou ativos
  adminFee?: string;

  // Stock Specific (Optional)
  pl?: number;    // Preço / Lucro
  roe?: number;   // Return on Equity
  netMargin?: number; // Margem Líquida
  debtEbitda?: number; // Dívida Líquida / EBITDA
  lpa?: number; // Lucro por Ação
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
    primary: string;   // Main Brand Color
    secondary: string; // Darker/Richer Shade
    accent: string;    // Contrast/Pop Color
    highlight: string; // Lighter Tint for backgrounds
    muted: string;     // Subtle/Border color
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
  onAction?: () => void; // Função de callback
}
