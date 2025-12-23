
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */

const BRAPI_BASE_URL = 'https://brapi.dev/api';
const CACHE_DURATION = 10 * 60 * 1000; // Aumentei para 10 minutos para evitar rate limit com múltiplas requisições

// Cache Granular: Armazena o resultado de cada ticker individualmente
// Chave: Ticker (ex: "PETR4"), Valor: { timestamp, data }
const tickerCache = new Map<string, { timestamp: number; data: any }>();

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

  // 3. Fallback: Token hardcoded
  return 'qQubkDBNuT4NmqDc8MP7Hx';
};

const BRAPI_TOKEN = getBrapiToken();

/**
 * Busca dados de um ÚNICO ticker.
 * Verifica o cache individual antes de fazer a requisição de rede.
 */
const fetchSingleTicker = async (ticker: string): Promise<any | null> => {
  if (!ticker) return null;

  const now = Date.now();
  const cached = tickerCache.get(ticker);

  // 1. Verificar Cache Individual
  if (cached && (now - cached.timestamp < CACHE_DURATION)) {
    // console.log(`[BRAPI] Cache Hit: ${ticker}`); // Comentado para limpar console
    return cached.data;
  }

  try {
    // Pequeno delay aleatório para evitar "rajada" simultânea exata se houver muitos ativos
    await new Promise(r => setTimeout(r, Math.random() * 200));

    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?token=${BRAPI_TOKEN}`);

    if (response.status === 429) {
      console.warn(`[BRAPI] Rate Limit em ${ticker}. Usando cache se existir.`);
      return cached ? cached.data : null;
    }

    if (!response.ok) {
        // Se der 404 ou outro erro, retorna null mas não quebra o Promise.all dos outros
        return null;
    }

    const json = await response.json();
    const result = json.results && json.results.length > 0 ? json.results[0] : null;

    if (result) {
      // Atualiza cache individual
      tickerCache.set(ticker, { timestamp: now, data: result });
    }

    return result;

  } catch (error) {
    console.error(`[BRAPI] Erro ao buscar ${ticker}:`, error);
    return cached ? cached.data : null;
  }
};

/**
 * Função principal chamada pelo App.
 * Recebe lista de tickers, mas processa individualmente (1 request por ativo).
 */
export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length) return [];
  
  if (!BRAPI_TOKEN) {
    console.warn("[BRAPI] Alerta: Token ausente.");
    return [];
  }

  console.log(`[BRAPI] Atualizando ${tickers.length} ativos (Modo: Requisição Individual)...`);
  
  // Dispara todas as requisições em paralelo, mas tratadas individualmente
  const promises = tickers.map(ticker => fetchSingleTicker(ticker));
  
  // Aguarda todas terminarem
  const results = await Promise.all(promises);

  // Filtra nulos (erros de rede ou tickers inválidos)
  return results.filter(item => item !== null);
};

export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo') => {
  if (!BRAPI_TOKEN) return [];

  // Implementação simples de cache para histórico também, usando a mesma chave do ticker
  // mas com sufixo para diferenciar do dado live
  const cacheKey = `${ticker}_history_${range}_${interval}`;
  const now = Date.now();
  const cached = tickerCache.get(cacheKey);

  if (cached && (now - cached.timestamp < CACHE_DURATION)) {
      return cached.data;
  }

  try {
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}`);
    
    if (!response.ok) return [];

    const data = await response.json();
    if (data.results && data.results[0] && data.results[0].historicalDataPrice) {
      const formattedData = data.results[0].historicalDataPrice.map((item: any) => ({
        date: new Date(item.date * 1000).toLocaleDateString('pt-BR', { month: 'short' }),
        price: item.close,
        timestamp: item.date
      }));

      tickerCache.set(cacheKey, { timestamp: now, data: formattedData });
      return formattedData;
    }
    return [];
  } catch (error) {
    console.error(`[BRAPI] Erro no histórico (${ticker}):`, error);
    return [];
  }
};
