
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem } from "../types";

/**
 * Serviço de Consultoria Financeira via Gemini AI
 * Analisa a carteira do usuário e fornece insights estratégicos.
 */
export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[]
): Promise<string> => {
  try {
    // Inicialização segura usando a chave de ambiente
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // Instrução de sistema rica em contexto para o consultor financeiro
    const systemInstruction = `
      Você é um consultor financeiro sênior especializado no mercado brasileiro (B3).
      Sua missão é educar o investidor sobre ativos como Ações, FIIs e Fiagros.
      
      Regras:
      1. Use o contexto da carteira do usuário abaixo para responder.
      2. Seja direto, técnico e profissional.
      3. Nunca prometa lucros ou ganhos fáceis.
      
      Contexto da Carteira Atual:
      - Patrimônio Total: R$ ${summary.totalBalance.toLocaleString('pt-BR')}
      - Total Investido: R$ ${summary.totalInvested.toLocaleString('pt-BR')}
      - Lucro/Prejuízo: R$ ${summary.capitalGain.toLocaleString('pt-BR')}
      - Yield on Cost: ${summary.yieldOnCost.toFixed(2)}%
      - Distribuição: ${portfolio.map(p => `${p.name} (${p.percentage}%)`).join(', ')}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Modelo para raciocínio complexo
      contents: [{ parts: [{ text: query }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    // Acesso direto à propriedade .text conforme diretriz do SDK
    return response.text || "Desculpe, não consegui processar essa análise agora.";
  } catch (error: any) {
    console.error("[Gemini Service] Erro na requisição:", error);
    
    if (error.message?.includes("API_KEY")) {
      return "Configuração Necessária: A chave de API (Gemini) não foi encontrada nas variáveis de ambiente.";
    }
    
    return "Ocorreu um erro ao consultar o assistente de IA. Tente novamente em instantes.";
  }
};
