
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
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}&fundamental=true&ts=${ts}`, {
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

// Implementação de Requisições Individuais (One-by-One em Paralelo)
export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length || !BRAPI_TOKEN) return [];
  
  // Limpa duplicatas
  const uniqueTickers = [...new Set(tickers)].filter(t => t && t.length > 0);
  if (uniqueTickers.length === 0) return [];

  const ts = new Date().getTime();

  try {
    // Cria uma array de Promises, uma para cada ticker individualmente
    const requests = uniqueTickers.map(async (ticker) => {
        // Verifica cache individual primeiro
        const now = Date.now();
        const cached = tickerCache.get(ticker);
        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
            return cached.data;
        }

        try {
            logApiRequest('brapi');
            // Busca individual
            const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&ts=${ts}`, {
                cache: 'no-store'
            });

            if (!response.ok) {
                console.warn(`[BRAPI] Falha ao buscar ${ticker}: ${response.status}`);
                return null;
            }

            const json = await response.json();
            const result = json.results?.[0]; // Pega o primeiro (e único) resultado

            if (result) {
                tickerCache.set(result.symbol, { timestamp: now, data: result });
                return result;
            }
            return null;
        } catch (err) {
            console.error(`[BRAPI] Erro de rede ao buscar ${ticker}`, err);
            return null;
        }
    });

    // Aguarda todas as requisições terminarem (Promise.allSettled poderia ser usado, 
    // mas Promise.all com catch interno no map funciona bem para filtrar nulos)
    const results = await Promise.all(requests);

    // Filtra os nulos (falhas) e retorna apenas os dados válidos
    return results.filter(item => item !== null);

  } catch (error) {
    console.error("[BRAPI] Erro geral na busca de ativos:", error);
    return [];
  }
};
