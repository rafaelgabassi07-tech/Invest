
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */
import { logApiRequest } from './telemetryService.ts';

const BRAPI_BASE_URL = 'https://brapi.dev/api';
// Cache de curta duração para evitar spam na API
const CACHE_DURATION = 2 * 60 * 1000; 

// Cache Granular
const tickerCache = new Map<string, { timestamp: number; data: any }>();

export const getBrapiToken = (): string => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BRAPI_TOKEN) {
    // @ts-ignore
    return import.meta.env.VITE_BRAPI_TOKEN;
  }
  return '';
};

const BRAPI_TOKEN = getBrapiToken();

// --- MOCK DATA GENERATORS (Para funcionar sem API Key) ---
const generateMockHistory = (ticker: string) => {
    const data = [];
    let price = 100;
    const now = new Date();
    for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (30 - i));
        price = price * (1 + (Math.random() * 0.04 - 0.02)); // +/- 2%
        data.push({
            date: date.toLocaleDateString('pt-BR', { month: 'short' }),
            price: price,
            timestamp: date.getTime() / 1000
        });
    }
    return data;
};

const generateMockQuote = (ticker: string) => {
    const price = 50 + Math.random() * 50;
    const change = (Math.random() * 4) - 2;
    return {
        symbol: ticker,
        shortName: ticker,
        longName: `${ticker} Simulated S.A.`,
        regularMarketPrice: price,
        regularMarketChangePercent: change,
        regularMarketVolume: 1000000 + Math.random() * 5000000,
        priceToBook: 0.8 + Math.random() * 1.5,
        dividendYield: Math.random() * 15,
        sector: 'Financeiro',
        logourl: `https://ui-avatars.com/api/?name=${ticker}&background=random&color=fff&size=128`
    };
};

// Função para buscar dados históricos
export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo') => {
  // Fallback para Mock se não tiver token
  if (!BRAPI_TOKEN) {
      console.warn(`[BRAPI] Sem token. Usando dados simulados para histórico de ${ticker}.`);
      return generateMockHistory(ticker);
  }

  const cacheKey = `${ticker}_history_${range}_${interval}`;
  const now = Date.now();
  const cached = tickerCache.get(cacheKey);

  if (cached && (now - cached.timestamp < CACHE_DURATION)) return cached.data;

  try {
    logApiRequest('brapi');
    const ts = new Date().getTime();
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}&fundamental=true&ts=${ts}`, {
        cache: 'no-store'
    });
    
    if (!response.ok) throw new Error('API Error');
    
    const data = await response.json();
    if (data.results?.[0]?.historicalDataPrice) {
      const formatted = data.results[0].historicalDataPrice.map((item: any) => ({
        date: new Date(item.date * 1000).toLocaleDateString('pt-BR', { month: 'short' }),
        price: item.close,
        timestamp: item.date
      }));
      tickerCache.set(cacheKey, { timestamp: now, data: formatted });
      return formatted;
    }
    return [];
  } catch (error) {
    console.warn("[BRAPI] Erro ao buscar histórico, usando fallback.", error);
    return generateMockHistory(ticker);
  }
};

// Implementação de Requisições Individuais (One-by-One em Paralelo)
export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length) return [];
  
  // Limpa duplicatas
  const uniqueTickers = [...new Set(tickers)].filter(t => t && t.length > 0);
  if (uniqueTickers.length === 0) return [];

  // Fallback Mock imediato
  if (!BRAPI_TOKEN) {
      console.warn(`[BRAPI] Sem token. Usando dados simulados para cotações.`);
      return uniqueTickers.map(t => generateMockQuote(t));
  }

  const ts = new Date().getTime();

  try {
    const requests = uniqueTickers.map(async (ticker) => {
        const now = Date.now();
        const cached = tickerCache.get(ticker);
        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
            return cached.data;
        }

        try {
            logApiRequest('brapi');
            const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&ts=${ts}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                console.warn(`[BRAPI] Falha ao buscar ${ticker}: ${response.status}`);
                return generateMockQuote(ticker); // Fallback individual
            }

            const json = await response.json();
            const result = json.results?.[0]; 

            if (result) {
                tickerCache.set(result.symbol, { timestamp: now, data: result });
                return result;
            }
            return generateMockQuote(ticker);
        } catch (err) {
            console.error(`[BRAPI] Erro de rede ao buscar ${ticker}`, err);
            return generateMockQuote(ticker);
        }
    });

    const results = await Promise.all(requests);
    return results.filter(item => item !== null);

  } catch (error) {
    console.error("[BRAPI] Erro geral na busca de ativos:", error);
    return uniqueTickers.map(t => generateMockQuote(t));
  }
};
