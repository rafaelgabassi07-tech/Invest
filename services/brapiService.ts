
/**
 * BRAPI Service for Brazilian Market Data (B3)
 * Documentação: https://brapi.dev/docs
 */

const getSafeEnv = (key: string): string => {
  try {
    // @ts-ignore
    return (process.env && process.env[key]) || '';
  } catch {
    return '';
  }
};

// Tenta obter o token de diferentes possíveis nomes de variáveis no ambiente
const BRAPI_TOKEN = getSafeEnv('BRAPI_TOKEN') || 
                    getSafeEnv('VITE_BRAPI_TOKEN') || 
                    ''; 

const BRAPI_BASE_URL = 'https://brapi.dev/api';

/**
 * Busca cotações atuais de uma lista de tickers
 */
export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length) return [];
  
  if (!BRAPI_TOKEN) {
    console.warn("[BRAPI] Aviso: Token da API não configurado. Para dados reais, adicione BRAPI_TOKEN ao ambiente.");
    return [];
  }
  
  try {
    const list = tickers.join(',');
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${list}?token=${BRAPI_TOKEN}`);
    
    if (!response.ok) {
        if (response.status === 401) console.error("[BRAPI] Erro: Token inválido.");
        return [];
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("[BRAPI] Falha de rede ou API:", error);
    return [];
  }
};

/**
 * Busca dados históricos para os gráficos de detalhes
 */
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
    console.error(`[BRAPI] Erro histórico (${ticker}):`, error);
    return [];
  }
};
