
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem, Asset } from "../types";
import { logApiRequest } from './telemetryService.ts';

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === 'undefined' || key.trim() === '') return null;
  return key;
};

const MODEL_NAME = 'gemini-2.5-flash';

export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[],
  assets: Asset[] = []
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        return "⚠️ A chave de API do Gemini não foi detectada. Verifique suas variáveis de ambiente (API_KEY).";
    }

    logApiRequest('gemini');
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const assetsContext = assets.map(a => {
      const profit = a.totalValue - a.totalCost;
      const profitPerc = a.totalCost > 0 ? (profit / a.totalCost) * 100 : 0;
      return `- ${a.ticker} (${a.assetType}): ${a.quantity} cotas. PM: R$${a.averagePrice.toFixed(2)} | Atual: R$${a.currentPrice.toFixed(2)}. Rentab: ${profitPerc.toFixed(1)}%. Setor: ${a.segment}. DY: ${a.dy12m}%. P/VP: ${a.pvp}`;
    }).join('\n');

    const portfolioContext = portfolio.map(p => `${p.name}: ${p.percentage}%`).join(', ');

    const systemInstruction = `
      Você é o "Invest AI", um consultor financeiro sênior pessoal e extremamente inteligente, especializado no mercado brasileiro (B3).
      
      DADOS DO USUÁRIO AGORA (${new Date().toLocaleDateString('pt-BR')}):
      - Patrimônio Total: R$ ${summary.totalBalance.toLocaleString('pt-BR')}
      - Total Investido: R$ ${summary.totalInvested.toLocaleString('pt-BR')}
      - Lucro/Prejuízo: R$ ${summary.capitalGain.toLocaleString('pt-BR')}
      - Alocação Atual: ${portfolioContext}
      
      DETALHE DOS ATIVOS:
      ${assetsContext}

      DIRETRIZES:
      1. Seja objetivo, técnico e direto.
      2. Use Markdown (negrito) para destacar números e tickers.
      3. NÃO forneça links, URLs ou citações de fontes externas.
      4. Foque na análise dos dados fornecidos e fatos concretos de mercado.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }] // Mantido para precisão de dados, mas links ocultos no output
      }
    });

    return response.text || "Não consegui gerar uma resposta.";

  } catch (error) {
    console.error("[Gemini Advisor] Erro:", error);
    return "Ocorreu um erro ao conectar com a Inteligência Artificial.";
  }
};

export const analyzeAsset = async (asset: Asset): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Configure a API_KEY para receber análises de IA sobre este ativo.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        // Prompt ajustado para remover pedido de notícias e focar em valuation/técnica
        const prompt = `Faça uma análise técnica concisa sobre o ativo ${asset.ticker} (${asset.companyName}).
        
        Meus dados: Tenho ${asset.quantity} cotas, Preço Médio R$${asset.averagePrice.toFixed(2)}, Preço Atual R$${asset.currentPrice.toFixed(2)}.
        O DY é ${asset.dy12m}% e P/VP é ${asset.pvp}.
        
        Diga se:
        1. O ativo está descontado (valuation baseada em P/VP e pares).
        2. Se a rentabilidade da minha posição é saudável.
        3. Uma opinião técnica sobre o setor (${asset.segment}).
        
        Não inclua links ou notícias. Seja analítico e sucinto (max 100 palavras).`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Sem análise disponível.";

    } catch (error) {
        return "Erro ao analisar ativo via Gemini.";
    }
};

export const analyzePortfolioStruct = async (portfolio: PortfolioItem[], totalValue: number): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Configure a API_KEY para receber insights de alocação.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Analise a diversificação técnica desta carteira de R$ ${totalValue.toLocaleString('pt-BR')}:
        ${portfolio.map(p => `${p.name}: ${p.percentage}%`).join(', ')}.
        
        Aponte riscos de concentração matemática e sugestão de rebalanceamento técnico.
        Não cite fontes externas ou links. Seja direto.`;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        return response.text || "Sem análise disponível.";

    } catch (error) {
        return "Erro ao analisar carteira.";
    }
};

export const getInflationAnalysis = async (userYield: number): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Sem chave API.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `
        1. Obtenha o valor exato do IPCA acumulado 12 meses e o CDI atual.
        2. Compare matematicamente com minha rentabilidade de ${userYield.toFixed(2)}%.
        3. Conclua se houve ganho real (acima da inflação) ou perda de poder de compra.
        Retorne apenas os números e a conclusão técnica. Sem links.
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

        const payersStr = topPayers.map(p => p.ticker).join(', ');
        
        const prompt = `
        Analise a sustentabilidade do Payout e fluxo de caixa destes ativos: ${payersStr}.
        Baseado nos últimos balanços, há risco operacional para os proventos?
        Resuma em 1 parágrafo técnico. Sem notícias ou links.
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

        const tickerStr = tickers.slice(0, 10).join(', ');
        
        // Foca apenas em extrair dados (Data Com, Valor, Pagamento) sem texto jornalístico
        const prompt = `
        Verifique base de dados oficial para "dividendos anunciados e não pagos" destes ativos: ${tickerStr}.
        Liste estritamente: Ticker | Valor | Data Pagamento.
        Se não houver anúncios pendentes, diga "Sem proventos futuros anunciados".
        Não inclua links.
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
        Compare tecnicamente a rentabilidade de ${userPerformance.toFixed(2)}% com o acumulado 12 meses do Ibovespa e CDI.
        Apenas mostre os valores comparativos e se a performance é Alpha positivo ou negativo. Sem links.
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
