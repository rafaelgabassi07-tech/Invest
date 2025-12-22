
/**
 * BRAPI Service for Brazilian Market Data
 * Documentation: https://brapi.dev/docs
 */

// Vite/Vercel exposure: Variables prefixed with VITE_ are accessible via process.env in this context
const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_TOKEN = process.env.VITE_BRAPI_TOKEN || ''; 

export const fetchTickersData = async (tickers: string[]) => {
  if (!tickers.length) return [];
  
  // Pre-check to avoid 401 if token is missing
  if (!BRAPI_TOKEN) {
    console.warn("BRAPI Token (VITE_BRAPI_TOKEN) não configurado. As cotações em tempo real não serão carregadas.");
    return [];
  }
  
  try {
    const list = tickers.join(',');
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${list}?token=${BRAPI_TOKEN}`);
    
    if (response.status === 401) {
        console.error("BRAPI Error: Token inválido ou expirado (401). Verifique a variável VITE_BRAPI_TOKEN.");
        return [];
    }
    
    if (!response.ok) {
        throw new Error(`BRAPI API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("BRAPI Fetch Error:", error);
    return [];
  }
};

export const fetchHistoricalData = async (ticker: string, range: string = '1y', interval: string = '1mo') => {
  if (!BRAPI_TOKEN) {
    console.warn("BRAPI Token ausente. Não é possível buscar dados históricos.");
    return [];
  }

  try {
    const response = await fetch(`${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=${interval}&token=${BRAPI_TOKEN}`);
    
    if (response.status === 401) {
        console.error("BRAPI Error: Token inválido (401) ao buscar histórico.");
        return [];
    }

    if (!response.ok) {
        throw new Error(`BRAPI API Error: ${response.status}`);
    }

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
    console.error(`BRAPI Historical Error for ${ticker}:`, error);
    return [];
  }
};
