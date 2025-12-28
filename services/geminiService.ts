
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem, Asset } from "../types";
import { logApiRequest } from './telemetryService.ts';

const getApiKey = () => {
  // Tenta obter do process.env injetado pelo Vite
  // @ts-ignore
  const key = process.env.API_KEY;
  if (!key || key === 'undefined' || key.trim() === '') return null;
  return key;
};

// Utilizando a versão Flash estável que suporta tools (Google Search)
const MODEL_NAME = 'gemini-2.0-flash';

export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[],
  assets: Asset[] = []
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        return "⚠️ **Configuração Necessária**: A chave de API do Gemini não foi detectada. Por favor, configure a variável `API_KEY` no seu ambiente para ativar o assistente.";
    }

    logApiRequest('gemini');
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const assetsContext = assets.map(a => {
      const profit = a.totalValue - a.totalCost;
      const profitPerc = a.totalCost > 0 ? (profit / a.totalCost) * 100 : 0;
      return `- **${a.ticker}** (${a.assetType}): ${a.quantity} cotas. PM: R$${a.averagePrice.toFixed(2)} | Atual: R$${a.currentPrice.toFixed(2)}. Rentab: ${profitPerc.toFixed(1)}%. Setor: ${a.segment}. DY: ${a.dy12m}%. P/VP: ${a.pvp}`;
    }).join('\n');

    const portfolioContext = portfolio.map(p => `${p.name}: ${p.percentage}%`).join(', ');

    const systemInstruction = `
      Você é o "Invest AI", um consultor financeiro sênior especializado na B3 (Brasil).
      
      CONTEXTO DO INVESTIDOR:
      - Patrimônio: R$ ${summary.totalBalance.toLocaleString('pt-BR')}
      - Resultado: R$ ${summary.capitalGain.toLocaleString('pt-BR')}
      - Alocação: ${portfolioContext}
      
      CARTEIRA DETALHADA:
      ${assetsContext}

      REGRAS:
      1. Use Markdown.
      2. Se precisar de dados atuais (Selic, IPCA, notícias), use a tool googleSearch.
      3. Seja direto e técnico.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text || "Não consegui formular uma resposta no momento.";

  } catch (error) {
    console.error("[Gemini Advisor] Erro:", error);
    return "Ocorreu um erro ao conectar com a Inteligência Artificial. Verifique sua conexão ou chave de API.";
  }
};

export const analyzeAsset = async (asset: Asset): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Configure a API_KEY para receber análises.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        // Prompt reforçado para garantir análise técnica
        const prompt = `
        Realize uma análise fundamentalista flash sobre o ativo: ${asset.ticker} (${asset.companyName}).
        
        MEUS DADOS:
        - Preço Médio: R$ ${asset.averagePrice.toFixed(2)}
        - Preço Atual: R$ ${asset.currentPrice.toFixed(2)}
        - DY (12m): ${asset.dy12m}%
        - P/VP: ${asset.pvp}
        
        SOLICITAÇÃO:
        1. O P/VP atual indica desconto ou ágio? Compare com a média do setor se possível.
        2. Há riscos relevantes no curto prazo (use o Google Search para notícias recentes)?
        3. Veredito rápido: Manter, Comprar mais ou Atenção? (Baseado em Valuation)
        
        Seja sucinto (máximo 3 parágrafos curtos).
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Sem análise disponível.";

    } catch (error) {
        return "Erro ao analisar ativo. Tente novamente mais tarde.";
    }
};

export const analyzePortfolioStruct = async (portfolio: {name: string, percentage: number}[], totalValue: number): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Configure a API_KEY para insights.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
        Analise a estrutura desta carteira de investimentos de R$ ${totalValue.toLocaleString('pt-BR')}:
        
        ALOCAÇÃO:
        ${portfolio.map(p => `- ${p.name}: ${p.percentage}%`).join('\n')}
        
        Dê um feedback sobre:
        1. Diversificação (está concentrada demais?).
        2. Sugestão genérica de rebalanceamento para um perfil moderado/arrojado.
        
        Resposta curta e direta em tópicos.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Sem análise disponível.";

    } catch (error) {
        return "Erro na análise de portfólio.";
    }
};

export const getInflationAnalysis = async (accumulatedNominal: number): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Sem chave API.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
        Use o Google Search para encontrar o IPCA acumulado dos últimos 12 meses no Brasil.
        
        Minha carteira rendeu nominalmente: ${accumulatedNominal.toFixed(2)}% nos últimos 12 meses.
        
        Calcule o ganho (ou perda) real descontando a inflação encontrada.
        Explique brevemente o impacto disso no poder de compra.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Sem dados de inflação.";
    } catch (error) {
        return "Erro ao buscar dados de inflação.";
    }
};

export const getIncomeAnalysis = async (topPayers: {ticker: string, share: number}[]): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Sem chave API.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        const payersStr = topPayers.map(p => `${p.ticker} (${p.share.toFixed(1)}% da renda)`).join(', ');
        
        const prompt = `
        Analise a sustentabilidade dos dividendos destes ativos que compõem minha renda: ${payersStr}.
        
        Verifique (Google Search) se alguma dessas empresas cortou dividendos recentemente ou tem payout insustentável.
        Resuma em 1 parágrafo de alerta ou confirmação de segurança.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Sem análise de renda.";
    } catch (error) {
        return "Erro ao analisar proventos.";
    }
};

export const getUpcomingDividends = async (tickers: string[]): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Sem chave API.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        const tickerStr = tickers.slice(0, 15).join(', ');
        
        const prompt = `
        Use o Google Search para encontrar "Data Com" e "Data de Pagamento" de dividendos ANUNCIADOS recentemente para: ${tickerStr}.
        
        Liste apenas os que tem pagamento futuro confirmado.
        Formato: [Ticker] - R$ [Valor] (Pagamento: [Data])
        
        Se não encontrar nada relevante, diga "Sem anúncios recentes encontrados na base pública".
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Sem previsões encontradas.";
    } catch (error) {
        return "Erro ao buscar dividendos futuros.";
    }
};

export const getMarketBenchmarks = async (userPerformance: number): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Sem chave API.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
        Busque o rendimento acumulado 12 meses do IBOVESPA e do CDI hoje.
        
        Minha performance: ${userPerformance.toFixed(2)}%.
        
        Crie uma tabela comparativa simples e diga se bati os benchmarks.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Sem dados de mercado.";
    } catch (error) {
        return "Erro ao comparar benchmarks.";
    }
};
