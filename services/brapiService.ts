
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */
import { logApiRequest } from './telemetryService.ts';

const BRAPI_BASE_URL = 'https://brapi.dev/api';
// Cache de curta duração para evitar spam na API, mas garantir dados frescos
const CACHE_DURATION = 2 * 60 * 1000; 

// Cache Granular
const tickerCache = new Map<string, { timestamp: number; data: any }>();

export const getBrapiToken = (): string => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BRAPI_TOKEN) {
    // @ts-ignore
    return import.meta.env.VITE_BRAPI_TOKEN;
  }
  return 'qQubkDBNuT4NmqDc8MP7Hx';
};

const BRAPI_TOKEN = getBrapiToken();

// Função para buscar dados históricos
export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo') => {
  if (!BRAPI_TOKEN) return [];
  const cacheKey = `${ticker}_history_${range}_${interval}`;
  const now = Date.now();
  const cached = tickerCache.get(cacheKey);

  if (cached && (now - cached.timestamp < CACHE_DURATION)) return cached.data;

  try {
    logApiRequest('brapi');
    const ts = new Date().getTime();
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}&ts=${ts}`, {
        cache: 'no-store'
    });
    
    if (!response.ok) return [];
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
    return [];
  }
};

// Implementação robusta de Batch Request
export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length || !BRAPI_TOKEN) return [];
  
  // Limpa e prepara tickers
  const uniqueTickers = [...new Set(tickers)].filter(t => t && t.length > 0);
  if (uniqueTickers.length === 0) return [];

  const tickersString = uniqueTickers.join(',');
  const ts = new Date().getTime();

  try {
    logApiRequest('brapi');
    
    // Chamada única para múltiplos ativos
    // Importante: encodeURIComponent é usado para garantir segurança da URL
    const url = `${BRAPI_BASE_URL}/quote/${encodeURIComponent(tickersString)}?token=${BRAPI_TOKEN}&ts=${ts}`;
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
      }
    });

    if (!response.ok) {
        console.warn(`[BRAPI] Erro HTTP ${response.status} ao buscar cotações.`);
        return [];
    }

    const json = await response.json();
    const results = json.results || [];
    
    // Atualiza o cache com os dados frescos
    const now = Date.now();
    results.forEach((item: any) => {
        if (item.symbol) {
            tickerCache.set(item.symbol, { timestamp: now, data: item });
        }
    });
    
    return results;
  } catch (error) {
    console.error("[BRAPI] Erro de conexão em lote:", error);
    return [];
  }
};
    