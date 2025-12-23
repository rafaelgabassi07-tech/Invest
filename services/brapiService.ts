
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */

const BRAPI_BASE_URL = 'https://brapi.dev/api';

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

  // 3. Fallback: Token hardcoded fornecido
  return 'qQubkDBNuT4NmqDc8MP7Hx';
};

const BRAPI_TOKEN = getBrapiToken();

export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length) return [];
  
  if (!BRAPI_TOKEN) {
    console.warn("[BRAPI] Alerta: Token ausente. Dados reais não serão carregados.");
    return [];
  }
  
  console.log(`[BRAPI] Solicitando cotações via token: ${BRAPI_TOKEN.substring(0, 4)}...`);
  
  try {
    const list = tickers.join(',');
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${list}?token=${BRAPI_TOKEN}`);
    
    if (response.status === 401) {
        console.error("[BRAPI] Erro 401: Token inválido ou expirado. Verifique sua chave.");
        return [];
    }
    
    if (!response.ok) {
        throw new Error(`BRAPI API Response Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("[BRAPI] Falha crítica na busca de dados:", error);
    return [];
  }
};

export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo') => {
  if (!BRAPI_TOKEN) return [];

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
