
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem } from "../types";

export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[]
): Promise<string> => {
  try {
    // Inicialização obrigatória conforme as diretrizes do SDK
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
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
  } catch (error: any) {
    console.error("[Gemini Advisor] Erro:", error);
    if (error.message?.includes("API_KEY")) {
        return "A chave de API não foi configurada. Verifique as variáveis de ambiente.";
    }
    return "Ocorreu um erro ao conectar com o serviço de IA.";
  }
};
