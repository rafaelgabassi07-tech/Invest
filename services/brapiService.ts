
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */

const BRAPI_BASE_URL = 'https://brapi.dev/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de cache
const THROTTLE_DELAY = 3000; // Mínimo 3 segundos entre chamadas de rede reais

// Cache em memória simples
interface CacheData {
  timestamp: number;
  data: any;
  key: string;
}

let requestCache: CacheData | null = null;
let lastRequestTime = 0;

// Função robusta para pegar o token, priorizando a variável de ambiente do Vite (Vercel)
const getBrapiToken = (): string => {
  // 1. Tenta pegar via Vite (Padrão Vercel/Moderno)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BRAPI_TOKEN) {
    // @ts-ignore
    return import.meta.env.VITE_BRAPI_TOKEN;
  }

  // 2. Tenta pegar via process.env (Legado/Node)
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.VITE_BRAPI_TOKEN) {
    // @ts-ignore
    return process.env.VITE_BRAPI_TOKEN;
  }

  // 3. Fallback: Token hardcoded fornecido pelo usuário
  return 'qQubkDBNuT4NmqDc8MP7Hx';
};

const BRAPI_TOKEN = getBrapiToken();

export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length) return [];
  
  if (!BRAPI_TOKEN) {
    console.warn("[BRAPI] Alerta: Token ausente. Dados reais não serão carregados.");
    return [];
  }

  const now = Date.now();
  const sortedTickers = [...tickers].sort().join(',');

  // 1. Verificar Cache
  if (requestCache && requestCache.key === sortedTickers && (now - requestCache.timestamp < CACHE_DURATION)) {
    console.log("[BRAPI] Cache Hit (Economia de Requisição)");
    return requestCache.data;
  }

  // 2. Verificar Throttle (Impede chamadas muito rápidas)
  if (now - lastRequestTime < THROTTLE_DELAY) {
    console.log("[BRAPI] Throttled (Chamada muito frequente, ignorando)");
    return requestCache ? requestCache.data : [];
  }
  
  console.log(`[BRAPI] Solicitando cotações via token: ${BRAPI_TOKEN.substring(0, 4)}...`);
  lastRequestTime = now;
  
  try {
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${sortedTickers}?token=${BRAPI_TOKEN}`);
    
    if (response.status === 401) {
        console.error("[BRAPI] Erro 401: Token inválido ou expirado. Verifique sua chave.");
        return [];
    }
    
    if (response.status === 429) {
        console.warn("[BRAPI] Rate limit atingido. Usando dados anteriores se disponíveis.");
        return requestCache ? requestCache.data : [];
    }
    
    if (!response.ok) {
        throw new Error(`BRAPI API Response Error: ${response.status}`);
    }
    
    const data = await response.json();
    const results = data.results || [];

    // Salvar no Cache
    requestCache = {
      timestamp: now,
      data: results,
      key: sortedTickers
    };

    return results;
  } catch (error) {
    console.error("[BRAPI] Falha crítica na busca de dados:", error);
    // Retorna cache antigo em caso de erro de rede, se existir
    return requestCache ? requestCache.data : [];
  }
};

export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo') => {
  if (!BRAPI_TOKEN) return [];

  // Throttle simples para histórico também
  const now = Date.now();
  if (now - lastRequestTime < 1000) {
      // 1 segundo de espera mínima para chamadas de histórico
      return []; 
  }
  lastRequestTime = now;

  try {
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}`);
    
    if (!response.ok) return [];

    const data = await response.json();
    if (data.results && data.results[0] && data.results[0].historicalDataPrice) {
      return data.results[0].historicalDataPrice.map((item: any) => ({
        date: new Date(item.date * 1000).toLocaleDateString('pt-BR', { month: 'short' }),
        price: item.close,
        timestamp: item.date
      }));
    }
    return [];
  } catch (error) {
    console.error(`[BRAPI] Erro no histórico (${ticker}):`, error);
    return [];
  }
};
