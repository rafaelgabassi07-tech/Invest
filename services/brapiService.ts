
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */
import { logApiRequest } from './telemetryService.ts';

const BRAPI_BASE_URL = 'https://brapi.dev/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de cache

// Cache em memória
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

// --- MOCK DATA GENERATORS (Fallback para UI funcionar sem API) ---
const generateMockHistory = (ticker: string) => {
    const data = [];
    let price = 30 + Math.random() * 70; // Preço base aleatório entre 30 e 100
    const now = new Date();
    // Gera 6 meses de histórico
    for (let i = 0; i < 180; i+=5) { 
        const date = new Date(now);
        date.setDate(date.getDate() - (180 - i));
        // Random walk
        const change = (Math.random() - 0.5) * 2; 
        price = price + change;
        if(price < 1) price = 1;

        data.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            price: parseFloat(price.toFixed(2)),
            timestamp: date.getTime() / 1000
        });
    }
    return data;
};

const generateMockQuote = (ticker: string) => {
    const isFII = ticker.endsWith('11');
    const price = 80 + Math.random() * 40;
    const change = (Math.random() * 4) - 2; // -2% a +2%
    
    return {
        symbol: ticker,
        shortName: ticker,
        longName: isFII ? `${ticker} Fundo Imobiliário` : `${ticker} S.A.`,
        regularMarketPrice: price,
        regularMarketChangePercent: change,
        regularMarketVolume: 1000000 + Math.random() * 5000000,
        priceToBook: 0.85 + Math.random() * 0.4, // PVP 0.85 a 1.25
        dividendYield: isFII ? 8 + Math.random() * 6 : 2 + Math.random() * 8,
        priceEarnings: isFII ? 0 : 5 + Math.random() * 15,
        sector: isFII ? 'Financeiro' : 'Consumo Cíclico',
        logourl: `https://ui-avatars.com/api/?name=${ticker}&background=0D8ABC&color=fff&size=128&font-size=0.33`
    };
};

// Busca Histórico (Individual)
export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo') => {
  const cacheKey = `${ticker}_history_${range}`;
  const now = Date.now();
  const cached = tickerCache.get(cacheKey);

  if (cached && (now - cached.timestamp < CACHE_DURATION)) return cached.data;

  // Se não tiver token, usa Mock direto
  if (!BRAPI_TOKEN) {
      console.log(`[BRAPI] Modo Demo: Gerando histórico para ${ticker}`);
      const mockData = generateMockHistory(ticker);
      tickerCache.set(cacheKey, { timestamp: now, data: mockData });
      return mockData;
  }

  try {
    logApiRequest('brapi');
    const ts = new Date().getTime();
    // Nota: interval e range ajustados para otimizar chamada gratuita
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=1d&token=${BRAPI_TOKEN}&fundamental=false&ts=${ts}`);
    
    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    if (data.results?.[0]?.historicalDataPrice) {
      const formatted = data.results[0].historicalDataPrice.map((item: any) => ({
        date: new Date(item.date * 1000).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        price: item.close,
        timestamp: item.date
      }));
      tickerCache.set(cacheKey, { timestamp: now, data: formatted });
      return formatted;
    }
    throw new Error('No historical data');
  } catch (error) {
    console.warn(`[BRAPI] Erro/Fallback histórico ${ticker}:`, error);
    // Fallback para mock em caso de erro da API também
    return generateMockHistory(ticker);
  }
};

/**
 * Busca Cotações (Individual por Ativo)
 * Realiza 1 requisição para CADA ativo, em paralelo.
 */
export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length) return [];
  const uniqueTickers = [...new Set(tickers)].filter(t => !!t);

  const now = Date.now();
  const resultData: any[] = [];
  const tickersToFetch: string[] = [];

  // 1. Verifica Cache primeiro
  uniqueTickers.forEach(t => {
      const cached = tickerCache.get(t);
      if (cached && (now - cached.timestamp < CACHE_DURATION)) {
          resultData.push(cached.data);
      } else {
          tickersToFetch.push(t);
      }
  });

  // Se tudo estava em cache, retorna
  if (tickersToFetch.length === 0) return resultData;

  // Se não tiver token, retorna Mock para os faltantes
  if (!BRAPI_TOKEN) {
      const mocks = tickersToFetch.map(t => generateMockQuote(t));
      // Salva no cache
      mocks.forEach(m => {
          tickerCache.set(m.symbol, { timestamp: now, data: m });
          resultData.push(m);
      });
      return resultData;
  }

  // 2. Busca Individual (1 Requisição por Ativo)
  try {
      console.log(`[BRAPI] Iniciando busca individual para ${tickersToFetch.length} ativos.`);
      
      const requests = tickersToFetch.map(async (ticker) => {
        try {
            logApiRequest('brapi');
            const ts = new Date().getTime();
            // REQUISIÇÃO INDIVIDUAL
            const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_TOKEN}&fundamental=true&ts=${ts}`);
            
            if (!response.ok) throw new Error(`Status ${response.status}`);
            
            const json = await response.json();
            const result = json.results?.[0];

            if (result) {
                tickerCache.set(result.symbol, { timestamp: now, data: result });
                return result;
            }
        } catch (err) {
            console.warn(`[BRAPI] Falha ao buscar ${ticker}:`, err);
            return generateMockQuote(ticker); // Fallback individual
        }
      });

      const freshData = await Promise.all(requests);
      
      freshData.forEach(item => {
          if(item) resultData.push(item);
      });

  } catch (error) {
      console.error("[BRAPI] Erro geral na busca:", error);
      // Fallback geral
      tickersToFetch.forEach(t => resultData.push(generateMockQuote(t)));
  }

  return resultData;
};
