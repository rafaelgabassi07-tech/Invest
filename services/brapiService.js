
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */

// Helper to safely get environment variables without crashing in browser
const getSafeEnv = (key) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    return '';
  } catch {
    return '';
  }
};

// Token configurado com fallback para a chave fornecida
const BRAPI_TOKEN = getSafeEnv('VITE_BRAPI_TOKEN') || 
                    getSafeEnv('BRAPI_TOKEN_API') || 
                    getSafeEnv('BRAPI_TOKEN') || 
                    'qQubkDBNuT4NmqDc8MP7Hx'; 

const BRAPI_BASE_URL = 'https://brapi.dev/api';

// --- CACHE SYSTEM CONFIGURATION ---
const CACHE_PREFIX = 'invest_brapi_cache_';
const QUOTE_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const HISTORY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const getFromCache = (key, ttl) => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const stored = localStorage.getItem(cacheKey);
    if (!stored) return null;

    const item = JSON.parse(stored);
    const now = Date.now();

    if (now - item.timestamp > ttl) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log(`[BRAPI Cache] Hit para: ${key}`);
    return item.data;
  } catch (err) {
    console.warn("[BRAPI Cache] Erro ao ler cache:", err);
    return null;
  }
};

const saveToCache = (key, data) => {
  try {
    const cacheKey = CACHE_PREFIX + key;
    const item = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(item));
  } catch (err) {
    console.warn("[BRAPI Cache] Erro ao salvar (possível cota excedida):", err);
  }
};

// --- API FUNCTIONS ---

export const fetchTickersData = async (tickers, forceRefresh = false) => {
  if (!tickers.length) return [];
  
  // Create a unique key based on sorted tickers to ensure consistency
  const cacheKey = `quotes_${tickers.slice().sort().join('_')}`;

  // Check cache first if not forced
  if (!forceRefresh) {
    const cached = getFromCache(cacheKey, QUOTE_CACHE_TTL);
    if (cached) return cached;
  }
  
  if (!BRAPI_TOKEN) {
    console.warn("[BRAPI] Alerta: Token ausente. Dados reais não serão carregados.");
    return [];
  }
  
  console.log(`[BRAPI] Solicitando cotações (Rede): ${tickers.join(', ')}`);
  
  try {
    const list = tickers.join(',');
    // 'fundamental=false' para reduzir tamanho da resposta
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${list}?token=${BRAPI_TOKEN}&fundamental=false`);
    
    if (response.status === 401) {
        console.error("[BRAPI] Erro 401: Token inválido ou expirado.");
        return [];
    }
    
    if (response.status === 429) {
        console.error("[BRAPI] Erro 429: Rate limit excedido. Usando cache se disponível.");
        const stale = localStorage.getItem(CACHE_PREFIX + cacheKey);
        if (stale) return JSON.parse(stale).data;
        return [];
    }
    
    if (!response.ok) {
        throw new Error(`BRAPI API Response Error: ${response.status}`);
    }
    
    const data = await response.json();
    const results = data.results || [];

    if (results.length > 0) {
      saveToCache(cacheKey, results);
    }
    
    return results;
  } catch (error) {
    console.error("[BRAPI] Falha crítica na busca de dados:", error);
    // Fallback to cache on error
    const stale = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (stale) return JSON.parse(stale).data;
    return [];
  }
};

export const fetchHistoricalData = async (ticker, range = '1y', interval = '1mo', forceRefresh = false) => {
  if (!BRAPI_TOKEN) return [];

  const cacheKey = `history_${ticker}_${range}_${interval}`;

  if (!forceRefresh) {
    const cached = getFromCache(cacheKey, HISTORY_CACHE_TTL);
    if (cached) return cached;
  }

  try {
    console.log(`[BRAPI] Solicitando histórico (Rede): ${ticker}`);
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}&fundamental=false`);
    
    if (!response.ok) return [];

    const data = await response.json();
    if (data.results && data.results[0] && data.results[0].historicalDataPrice) {
      const formattedHistory = data.results[0].historicalDataPrice.map((item) => ({
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
