
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem } from "../types";

export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[]
): Promise<string> => {
  try {
    // Check for API key presence to avoid internal ReferenceErrors
    const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
    
    if (!apiKey) {
      console.warn("[Gemini Advisor] API_KEY não configurada.");
      return "O serviço de IA não está configurado. Por favor, adicione sua API_KEY às variáveis de ambiente.";
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `
      Você é um consultor financeiro sênior especializado no mercado brasileiro (B3).
      Sua missão é educar e orientar estrategicamente, sem prometer ganhos fáceis.
      
      Contexto Atual do Usuário:
      - Patrimônio: R$ ${summary.totalBalance.toLocaleString('pt-BR')}
      - Investido: R$ ${summary.totalInvested.toLocaleString('pt-BR')}
      - DY: ${summary.yieldOnCost.toFixed(2)}%
      - Composição: ${portfolio.map(p => `${p.name} (${p.percentage}%)`).join(', ')}
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
    return "Ocorreu um erro ao conectar com o serviço de IA. Verifique sua conexão ou se a API_KEY é válida.";
  }
};
