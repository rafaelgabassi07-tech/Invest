
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem, Asset } from "../types";

export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[],
  assets: Asset[]
): Promise<string> => {
  try {
    // Check for API key presence to avoid internal ReferenceErrors
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    
    if (!apiKey) {
      console.warn("[Gemini Advisor] API_KEY não configurada.");
      return "O serviço de IA não está configurado. Por favor, adicione sua API_KEY às variáveis de ambiente para receber análises.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Preparar um resumo detalhado dos ativos para a IA (contexto rico, única requisição)
    const assetDetails = assets.map(a => 
      `- ${a.ticker} (${a.assetType}): ${a.quantity} cotas. PM: R$${a.averagePrice.toFixed(2)}. Atual: R$${a.currentPrice.toFixed(2)}. Total: R$${a.totalValue.toFixed(2)}. Rentab: ${((a.totalValue - a.totalCost)/a.totalCost * 100).toFixed(1)}%`
    ).join('\n');

    const systemInstruction = `
      Você é um consultor financeiro sênior especializado no mercado brasileiro (B3) e em análise de carteiras.
      
      DADOS FINANCEIROS ATUAIS DO USUÁRIO:
      - Patrimônio Total: R$ ${summary.totalBalance.toLocaleString('pt-BR')}
      - Total Investido: R$ ${summary.totalInvested.toLocaleString('pt-BR')}
      - Lucro/Prejuízo: R$ ${summary.capitalGain.toLocaleString('pt-BR')}
      - Dividend Yield (on Cost): ${summary.yieldOnCost.toFixed(2)}%
      
      COMPOSIÇÃO DA CARTEIRA:
      ${assetDetails}
      
      ALOCAÇÃO POR SETOR/TIPO:
      ${portfolio.map(p => `- ${p.name}: ${p.percentage}%`).join('\n')}

      DIRETRIZES:
      1. Use esses dados para responder. Não pergunte informações que já estão listadas acima.
      2. Seja direto, educado e estratégico.
      3. Se o usuário perguntar "como está minha carteira?", faça uma análise baseada na diversificação e rentabilidade apresentada.
      4. Responda sempre em Português do Brasil.
      5. Se houver ativos com grande prejuízo ou concentração excessiva, aponte os riscos sutilmente.
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
    console.error("[Gemini Advisor] Erro de conexão:", error);
    return "Ocorreu um erro ao conectar com o serviço de IA. Verifique sua conexão ou a validade da API Key.";
  }
};
