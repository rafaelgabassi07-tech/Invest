
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem, Asset } from "../types";

export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[],
  assets: Asset[]
): Promise<string> => {
  try {
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    
    if (!apiKey) {
      console.warn("[Gemini Advisor] API_KEY não configurada.");
      return "O serviço de IA não está configurado. Por favor, adicione sua API_KEY às variáveis de ambiente.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const assetDetails = assets.map(a => 
      `- ${a.ticker} (${a.assetType}): ${a.quantity} cotas. PM: R$${a.averagePrice.toFixed(2)}. Atual: R$${a.currentPrice.toFixed(2)}. Total: R$${a.totalValue.toFixed(2)}`
    ).join('\n');

    const systemInstruction = `
      Você é um consultor financeiro sênior especializado no mercado brasileiro (B3).
      
      DADOS:
      - Patrimônio: R$ ${summary.totalBalance.toLocaleString('pt-BR')}
      - Investido: R$ ${summary.totalInvested.toLocaleString('pt-BR')}
      - Lucro: R$ ${summary.capitalGain.toLocaleString('pt-BR')}
      - DY: ${summary.yieldOnCost.toFixed(2)}%
      
      CARTEIRA:
      ${assetDetails}
      
      ALOCAÇÃO:
      ${portfolio.map(p => `- ${p.name}: ${p.percentage}%`).join('\n')}

      Responda de forma estratégica, direta e em Português do Brasil.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "Desculpe, não consegui processar sua análise agora.";
  } catch (error) {
    console.error("[Gemini Advisor] Erro:", error);
    return "Ocorreu um erro ao conectar com o serviço de IA.";
  }
};
