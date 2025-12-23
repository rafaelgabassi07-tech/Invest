
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */

// Helper to safely get environment variables without crashing in browser
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
                    ''; 

const BRAPI_BASE_URL = 'https://brapi.dev/api';

export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length) return [];
  
  if (!BRAPI_TOKEN) {
    console.warn("[BRAPI] Alerta: Token ausente. Dados reais não serão carregados. Configure BRAPI_TOKEN no Vercel.");
    return [];
  }
  
  console.log(`[BRAPI] Solicitando cotações: ${tickers.join(', ')}`);
  
  try {
    const list = tickers.join(',');
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${list}?token=${BRAPI_TOKEN}`);
    
    if (response.status === 401) {
        console.error("[BRAPI] Erro 401: Token inválido ou expirado. Verifique sua chave em brapi.dev.");
        return [];
    }
    
    if (!response.ok) {
        throw new Error(`BRAPI API Response Error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("[BRAPI] Dados de mercado atualizados com sucesso.");
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
