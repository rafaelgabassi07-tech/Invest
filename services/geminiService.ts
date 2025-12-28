
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem, Asset } from "../types";
import { logApiRequest } from './telemetryService.ts';

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key || key === 'undefined' || key.trim() === '') return null;
  return key;
};

// Helper para formatar fontes do Grounding (Google Search)
const appendGroundingSources = (text: string, response: any): string => {
    const candidate = response.candidates?.[0];
    const chunks = candidate?.groundingMetadata?.groundingChunks;

    if (!chunks || chunks.length === 0) return text;

    const sources = chunks
        .map((c: any, index: number) => {
            if (c.web?.uri && c.web?.title) {
                return `- [${c.web.title}](${c.web.uri})`;
            }
            return null;
        })
        .filter(Boolean);

    if (sources.length === 0) return text;

    return `${text}\n\n**Fontes Consultadas:**\n${sources.join('\n')}`;
};

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
    
    // Constrói contexto rico para enviar em UMA única requisição
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
      1. Seja objetivo e direto.
      2. Use Markdown (negrito) para destacar números e tickers.
      3. Se a pergunta for sobre um fato relevante ou notícia recente que não está nos dados acima, USE A BUSCA DO GOOGLE (ferramenta ativa) para responder.
    `;

    // Uso explícito do Gemini 2.5 Flash Preview
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }] // Ativa Grounding com Google Search
      }
    });

    const text = response.text || "Não consegui gerar uma resposta.";
    return appendGroundingSources(text, response);

  } catch (error) {
    console.error("[Gemini Advisor] Erro:", error);
    return "Ocorreu um erro ao conectar com a Inteligência Artificial (Gemini 2.5).";
  }
};

// Nova função para analisar um ativo específico no Modal
export const analyzeAsset = async (asset: Asset): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Configure a API_KEY para receber análises de IA sobre este ativo.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        // Prompt enriquecido para incentivar o uso da ferramenta de busca
        const prompt = `Faça uma análise rápida e técnica sobre o ativo ${asset.ticker} (${asset.companyName}).
        Busque notícias recentes ou fatos relevantes na web para complementar.
        
        Meus dados: Tenho ${asset.quantity} cotas, Preço Médio R$${asset.averagePrice.toFixed(2)}, Preço Atual R$${asset.currentPrice.toFixed(2)}.
        O DY é ${asset.dy12m}% e P/VP é ${asset.pvp}.
        
        Diga se:
        1. O ativo está descontado (baseado no P/VP).
        2. Se estou no lucro ou prejuízo.
        3. Uma breve opinião sobre o setor (${asset.segment}) e notícias recentes.
        Seja sucinto (max 100 palavras).`;

        // Uso explícito do Gemini 2.5 Flash Preview
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }] // Ativa Grounding
            }
        });

        const text = response.text || "Sem análise disponível.";
        return appendGroundingSources(text, response);

    } catch (error) {
        return "Erro ao analisar ativo via Gemini.";
    }
};

// Nova função para analisar a estrutura da carteira
export const analyzePortfolioStruct = async (portfolio: PortfolioItem[], totalValue: number): Promise<string> => {
    try {
        const apiKey = getApiKey();
        if (!apiKey) return "⚠️ Configure a API_KEY para receber insights de alocação.";

        logApiRequest('gemini');
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Analise a diversificação desta carteira de R$ ${totalValue.toLocaleString('pt-BR')}:
        ${portfolio.map(p => `${p.name}: ${p.percentage}%`).join(', ')}.
        
        Aponte:
        1. Riscos de concentração.
        2. Sugestão de rebalanceamento rápido considerando o cenário macroeconômico atual (faça uma busca breve se necessário).
        Seja direto.`;

        // Uso explícito do Gemini 2.5 Flash Preview
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }] // Ativa Grounding
            }
        });

        const text = response.text || "Sem análise disponível.";
        return appendGroundingSources(text, response);

    } catch (error) {
        return "Erro ao analisar carteira.";
    }
};
