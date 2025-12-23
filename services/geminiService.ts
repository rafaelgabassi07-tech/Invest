
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem } from "../types";

export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[]
): Promise<string> => {
  try {
    /**
     * Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
     * The API key must be obtained exclusively from the environment variable process.env.API_KEY. 
     * Assume this variable is pre-configured, valid, and accessible.
     */
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `
      Você é um consultor financeiro sênior especializado no mercado brasileiro (B3).
      Sua missão é educar e orientar estrategicamente, sem prometer ganhos fáceis.
      
      Contexto Atual do Usuário:
      - Patrimônio: R$ ${summary.totalBalance.toLocaleString('pt-BR')}
      - Investido: R$ ${summary.totalInvested.toLocaleString('pt-BR')}
      - DY: ${summary.yieldOnCost.toFixed(2)}%
      - Composição: ${portfolio.map(p => `${p.name} (${p.percentage}%)`).join(', ')}
    `;

    /**
     * Using 'gemini-3-pro-preview' for complex financial reasoning and portfolio analysis.
     * You must use ai.models.generateContent to query GenAI with both the model name and prompt.
     */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    /**
     * The GenerateContentResponse object features a text property (not a method) 
     * that directly returns the string output.
     */
    return response.text || "Desculpe, não consegui processar sua análise agora.";
  } catch (error) {
    console.error("[Gemini Advisor] Erro de conexão:", error);
    return "Ocorreu um erro ao conectar com o serviço de IA. Verifique sua conexão ou se a API_KEY é válida.";
  }
};
