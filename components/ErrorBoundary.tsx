
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Trash2 } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Invest Error] Falha detectada:', error, errorInfo);
  }

  private handleReset = () => {
    if (window.confirm("Isso apagará seus dados locais para tentar recuperar o app. Tem certeza?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Ops! Algo quebrou.</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs">
            Isso pode ter acontecido por dados corrompidos ou um erro de conexão.
          </p>
          <div className="flex flex-col w-full gap-3 max-w-xs">
            <button 
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-4 rounded-2xl font-bold transition-all active:scale-95"
            >
                <RefreshCcw size={18} />
                Tentar Recarregar
            </button>
            <button 
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-rose-500/10 text-gray-400 hover:text-rose-500 px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 border border-white/5"
            >
                <Trash2 size={18} />
                Limpar e Reiniciar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children || null;
  }
}
