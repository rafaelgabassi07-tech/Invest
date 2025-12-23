
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */
import { logApiRequest } from './telemetryService.ts';

const BRAPI_BASE_URL = 'https://brapi.dev/api';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos de cache

// Cache Granular
const tickerCache = new Map<string, { timestamp: number; data: any }>();

// Map para evitar múltiplas requisições simultâneas para o mesmo ticker
const inflightRequests = new Map<string, Promise<any>>();

export const getBrapiToken = (): string => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BRAPI_TOKEN) {
    // @ts-ignore
    return import.meta.env.VITE_BRAPI_TOKEN;
  }
  return 'qQubkDBNuT4NmqDc8MP7Hx';
};

const BRAPI_TOKEN = getBrapiToken();

const fetchSingleTicker = async (ticker: string): Promise<any | null> => {
  if (!ticker) return null;

  const now = Date.now();
  const cached = tickerCache.get(ticker);

  if (cached && (now - cached.timestamp < CACHE_DURATION)) {
    return cached.data;
  }

  if (inflightRequests.has(ticker)) {
    return inflightRequests.get(ticker);
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_TOKEN}`);

      if (response.status === 429) {
        logApiRequest('brapi', 'error');
        return cached ? cached.data : null;
      }

      if (!response.ok) {
        logApiRequest('brapi', 'error');
        return null;
      }

      const json = await response.json();
      const result = json.results && json.results.length > 0 ? json.results[0] : null;

      if (result) {
        tickerCache.set(ticker, { timestamp: now, data: result });
        logApiRequest('brapi', 'success');
      } else {
        logApiRequest('brapi', 'error');
      }
      return result;
    } catch (error) {
      console.error(`[BRAPI] Erro em ${ticker}:`, error);
      logApiRequest('brapi', 'error');
      return cached ? cached.data : null;
    } finally {
      inflightRequests.delete(ticker);
    }
  })();

  inflightRequests.set(ticker, fetchPromise);
  return fetchPromise;
};

export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length || !BRAPI_TOKEN) return [];
  const promises = tickers.map(ticker => fetchSingleTicker(ticker));
  const results = await Promise.all(promises);
  return results.filter(item => item !== null);
};

export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo') => {
  if (!BRAPI_TOKEN) return [];
  const cacheKey = `${ticker}_history_${range}_${interval}`;
  const now = Date.now();
  const cached = tickerCache.get(cacheKey);

  if (cached && (now - cached.timestamp < CACHE_DURATION)) return cached.data;

  try {
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}`);
    if (!response.ok) {
        logApiRequest('brapi', 'error');
        return [];
    }
    const data = await response.json();
    if (data.results?.[0]?.historicalDataPrice) {
      const formatted = data.results[0].historicalDataPrice.map((item: any) => ({
        date: new Date(item.date * 1000).toLocaleDateString('pt-BR', { month: 'short' }),
        price: item.close,
        timestamp: item.date
      }));
      tickerCache.set(cacheKey, { timestamp: now, data: formatted });
      logApiRequest('brapi', 'success');
      return formatted;
    }
    logApiRequest('brapi', 'error');
    return [];
  } catch (error) {
    logApiRequest('brapi', 'error');
    return [];
  }
};
