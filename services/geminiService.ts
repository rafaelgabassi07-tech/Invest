
import { GoogleGenAI } from "@google/genai";
import { FinancialSummary, PortfolioItem, Asset } from "../types";
import { logApiRequest } from './telemetryService.ts';

export const getFinancialAdvice = async (
  query: string, 
  summary: FinancialSummary, 
  portfolio: PortfolioItem[],
  assets: Asset[] = []
): Promise<string> => {
  try {
    // REGISTRA CHAMADA REAL
    logApiRequest('gemini');
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const assetsContext = assets.map(a => 
      `${a.ticker}: Preço R$${a.currentPrice}, Variação Hoje: ${a.dailyChange.toFixed(2)}%, DY: ${a.dy12m}%, P/VP: ${a.pvp}`
    ).join(' | ');

    const systemInstruction = `
      Você é um consultor financeiro sênior especializado no mercado brasileiro (B3).
      Sua missão é educar e orientar estrategicamente, sem prometer ganhos fáceis.
      
      Contexto Geral do Usuário:
      - Patrimônio: R$ ${summary.totalBalance.toLocaleString('pt-BR')}
      - Investido: R$ ${summary.totalInvested.toLocaleString('pt-BR')}
      - DY Médio: ${summary.yieldOnCost.toFixed(2)}%
      - Composição por Classe: ${portfolio.map(p => `${p.name} (${p.percentage}%)`).join(', ')}
      
      Detalhes dos Ativos na Carteira:
      ${assetsContext}

      Regras de Resposta:
      1. Se o usuário perguntar sobre a queda de hoje, verifique os ativos com maior variação negativa no contexto.
      2. Seja conciso e use formatação Markdown (negrito para tickers e valores).
      3. Se o P/VP estiver muito acima de 1.1, mencione cautela com o preço.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
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
