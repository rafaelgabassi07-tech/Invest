
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
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      logApiRequest('gemini', 'error');
      throw new Error("API_KEY não configurada.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
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

    // Se chegou aqui, sucesso
    logApiRequest('gemini', 'success');
    return response.text || "Desculpe, não consegui processar sua análise agora.";
  } catch (error: any) {
    console.error("[Gemini Advisor] Erro de conexão:", error);
    logApiRequest('gemini', 'error');
    
    if (error.message?.includes('429')) {
      return "⚠️ Limite de requisições atingido. Por favor, aguarde um momento antes de tentar novamente.";
    }
    
    return "Ocorreu um erro ao conectar com o serviço de IA. Verifique sua conexão ou se a API_KEY é válida.";
  }
};
