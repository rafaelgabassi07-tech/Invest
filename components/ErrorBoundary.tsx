
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  // Fix: Making children optional resolves the "Property 'children' is missing" error 
  // at the call site in index.tsx when using JSX children.
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary component that catches rendering errors in its child tree.
 * Fix: Explicitly using Component from react and declaring class properties 
 * to ensure state and props are correctly recognized by the TypeScript compiler.
 */
export class ErrorBoundary extends Component<Props, State> {
  // Fix: Explicitly declare props to ensure it is recognized by the compiler on the class instance.
  public props: Props;

  // Fix: Explicitly declare and initialize state to resolve "Property 'state' does not exist" errors.
  // This ensures the class instance is correctly typed as having a state property.
  public state: State = {
    hasError: false
  };

  constructor(props: Props) {
    super(props);
    // Fix: Initialize props to satisfy strict checks if inheritance isn't correctly resolved.
    this.props = props;
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    // Fix: access state directly as it is now properly recognized by the compiler through class property declaration.
    if (this.state.hasError) {
      // Custom fallback UI for errors
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Ops! Algo deu errado.</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-xs">
            Tivemos um problema técnico no processamento dos dados. Tente recarregar o painel.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            <RefreshCcw size={18} />
            Recarregar App
          </button>
        </div>
      );
    }

    // Fix: access props.children and handle potential undefined values to satisfy the ReactNode return type.
    return this.props.children || null;
  }
}
