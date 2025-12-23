
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
    
    // Obtém chave do ambiente (injetada pelo Vite define)
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
        console.warn("[Gemini] API Key não encontrada nas variáveis de ambiente.");
        return "⚠️ Configure a API Key do Google Gemini nas variáveis de ambiente (API_KEY) para usar este recurso.";
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Criação de um contexto rico para a IA
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
      - Renda Mensal Projetada: R$ ${(summary.projectedAnnualIncome / 12).toLocaleString('pt-BR')}
      - Alocação Atual: ${portfolioContext}
      
      DETALHE DOS ATIVOS:
      ${assetsContext}

      SUAS DIRETRIZES:
      1. **Seja Direto:** Responda a pergunta do usuário de forma objetiva.
      2. **Análise de Carteira:** Se perguntado sobre a carteira, critique a diversificação e a exposição ao risco baseada nos setores dos ativos listados.
      3. **Sem Alucinações:** Use APENAS os dados fornecidos acima. Se o usuário perguntar o preço de um ativo que não está na lista, diga que não tem acesso a cotações em tempo real fora da carteira dele.
      4. **Estilo:** Profissional, mas acessível. Use Markdown (negrito) para destacar valores e tickers.
      5. **Contexto de Queda:** Se o usuário perguntar "por que caiu?", analise os ativos com variação negativa no contexto fornecido.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Modelo rápido e eficiente para chat
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "Não consegui gerar uma análise no momento. Tente novamente.";
  } catch (error) {
    console.error("[Gemini Advisor] Erro de conexão:", error);
    return "Ocorreu um erro ao conectar com a Inteligência Artificial. Verifique sua conexão e sua chave API.";
  }
};
