
/**
 * BRAPI Service for Brazilian Market Data
 */

const getSafeEnv = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    return '';
  } catch {
    return '';
  }
};

const BRAPI_TOKEN = getSafeEnv('VITE_BRAPI_TOKEN') || 
                    getSafeEnv('BRAPI_TOKEN_API') || 
                    getSafeEnv('BRAPI_TOKEN') || 
                    'qQubkDBNuT4NmqDc8MP7Hx'; 

const BRAPI_BASE_URL = 'https://brapi.dev/api';

const CACHE_PREFIX = 'invest_brapi_cache_';
const QUOTE_CACHE_TTL = 15 * 60 * 1000;
const HISTORY_CACHE_TTL = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const getFromCache = <T>(key: string, ttl: number): T | null => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const stored = localStorage.getItem(cacheKey);
    if (!stored) return null;

    const item: CacheItem<T> = JSON.parse(stored);
    const now = Date.now();

    if (now - item.timestamp > ttl) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return item.data;
  } catch (err) {
    console.warn("[BRAPI Cache] Erro ao ler cache:", err);
    return null;
  }
};

const saveToCache = <T>(key: string, data: T) => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(item));
  } catch (err) {
    console.warn("[BRAPI Cache] Erro ao salvar:", err);
  }
};

export const fetchTickersData = async (tickers: string[], forceRefresh = false): Promise<any[]> => {
  if (!tickers.length) return [];
  
  const cacheKey = `quotes_${tickers.slice().sort().join('_')}`;

  if (!forceRefresh) {
    const cached = getFromCache<any[]>(cacheKey, QUOTE_CACHE_TTL);
    if (cached) return cached;
  }
  
  if (!BRAPI_TOKEN) {
    console.warn("[BRAPI] Alerta: Token ausente.");
    return [];
  }
  
  console.log(`[BRAPI] Solicitando cotações: ${tickers.join(', ')}`);
  
  try {
    const list = tickers.join(',');
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${list}?token=${BRAPI_TOKEN}&fundamental=false`);
    
    if (!response.ok) {
       // Fallback cache silently if network fails
       const stale = localStorage.getItem(CACHE_PREFIX + cacheKey);
       if (stale) return JSON.parse(stale).data;
       return [];
    }
    
    const data = await response.json();
    const results = data.results || [];

    if (results.length > 0) {
      saveToCache(cacheKey, results);
    }
    
    return results;
  } catch (error) {
    console.error("[BRAPI] Falha crítica:", error);
    const stale = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (stale) return JSON.parse(stale).data;
    return [];
  }
};

export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo', forceRefresh = false): Promise<any[]> => {
  if (!BRAPI_TOKEN) return [];

  const cacheKey = `history_${ticker}_${range}_${interval}`;

  if (!forceRefresh) {
    const cached = getFromCache<any[]>(cacheKey, HISTORY_CACHE_TTL);
    if (cached) return cached;
  }

  try {
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}&fundamental=false`);
    
    if (!response.ok) return [];

    const data = await response.json();
    if (data.results && data.results[0] && data.results[0].historicalDataPrice) {
      const formattedHistory = data.results[0].historicalDataPrice.map((item: any) => ({
        date: new Date(item.date * 1000).toLocaleDateString('pt-BR', { month: 'short' }),
        price: item.close,
        timestamp: item.date
      }));

      saveToCache(cacheKey, formattedHistory);
      return formattedHistory;
    }
    return [];
  } catch (error) {
    console.error(`[BRAPI] Erro no histórico (${ticker}):`, error);
    return [];
  }
};
