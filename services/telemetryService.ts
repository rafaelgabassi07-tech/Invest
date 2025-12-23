
/**
 * Telemetry Service
 * Tracks API usage locally for performance monitoring and user transparency.
 */

export type ApiService = 'brapi' | 'gemini';

export interface ApiLogEntry {
  service: ApiService;
  timestamp: number;
}

const LOG_KEY = 'invest_api_logs';
const MAX_LOGS = 2000;
const RETENTION_DAYS = 30;

export const logApiRequest = (service: ApiService) => {
  try {
    const logsStr = localStorage.getItem(LOG_KEY);
    const logs: ApiLogEntry[] = logsStr ? JSON.parse(logsStr) : [];
    
    // Adiciona nova entrada
    logs.push({ service, timestamp: Date.now() });
    
    // Filtra logs antigos e limita tamanho
    const retentionLimit = Date.now() - (RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const filtered = logs
      .filter(l => l.timestamp > retentionLimit)
      .slice(-MAX_LOGS);
      
    localStorage.setItem(LOG_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn("[Telemetry] Falha ao registrar log:", e);
  }
};

export const getApiLogs = (): ApiLogEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
  } catch {
    return [];
  }
};

export const clearApiLogs = () => {
  localStorage.removeItem(LOG_KEY);
};
