import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            
            return (
                <div className="min-h-screen bg-[rgb(var(--color-brand-darker))] flex items-center justify-center p-6">
                    <div className="bg-[rgb(var(--color-brand-dark))] border border-red-500/30 rounded-lg p-8 max-w-md w-full text-center">
                        <div className="text-red-500 text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-white mb-4">Ops! Algo deu errado</h2>
                        <p className="text-gray-300 mb-6">
                            Ocorreu um erro ao carregar este componente. Tente recarregar a página.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-[rgb(var(--color-brand-primary))] text-white py-3 px-6 rounded-lg hover:opacity-90 transition-opacity font-semibold"
                            >
                                Recarregar Página
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false })}
                                className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-500 transition-colors font-semibold"
                            >
                                Tentar Novamente
                            </button>
                        </div>
                        {this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300">
                                    Detalhes do erro
                                </summary>
                                <pre className="mt-2 text-xs text-red-400 bg-black/30 p-3 rounded overflow-auto max-h-32">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
