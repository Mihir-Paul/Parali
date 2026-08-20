import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught component error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-white border border-red-200 rounded-3xl shadow-lg text-center space-y-4 font-sans">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {this.props.fallbackTitle || 'Section Unavailable'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {this.state.error?.message || 'An unexpected error occurred while loading this view.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 mx-auto transition-all shadow"
          >
            <RefreshCw className="h-4 w-4" /> Reload View
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
