import React, { useState } from 'react';

interface LojistaLoginProps {
    onLoginSuccess: (lojistaData: any) => void;
}

const LojistaLogin: React.FC<LojistaLoginProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Simular login (depois conectar com API)
            setTimeout(() => {
                if (email && password) {
                    onLoginSuccess({
                        id: 'lojista-001',
                        nome: 'Loja Exemplo',
                        email: email
                    });
                } else {
                    setError('Email e senha são obrigatórios');
                }
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError('Erro ao fazer login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo e Título */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-2">
                        RS Prólipsi
                    </h1>
                    <h2 className="text-2xl font-semibold text-white mb-2">
                        Painel do Lojista
                    </h2>
                    <p className="text-gray-400">
                        Gerencie sua loja com facilidade
                    </p>
                </div>

                {/* Card de Login */}
                <div className="bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl p-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email ou ID do Lojista
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu.email@exemplo.com"
                                required
                                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Lembrar-me e Esqueci senha */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 bg-dark-900 border-dark-700 rounded text-gold-500 focus:ring-yellow-500"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                                    Lembrar-me
                                </label>
                            </div>
                            <a href="#" className="text-sm text-gold-500 hover:text-gold-400 transition-colors">
                                Esqueceu a senha?
                            </a>
                        </div>

                        {/* Botão de Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-lg hover:from-yellow-600 hover:to-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Entrando...
                                </span>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Divisor */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dark-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-dark-800 text-gray-400">ou</span>
                        </div>
                    </div>

                    {/* Link para cadastro */}
                    <div className="text-center">
                        <p className="text-sm text-gray-400">
                            Ainda não tem uma loja?{' '}
                            <a href="#" className="font-medium text-gold-500 hover:text-gold-400 transition-colors">
                                Cadastre-se agora
                            </a>
                        </p>
                    </div>
                </div>

                {/* Link para voltar */}
                <div className="text-center">
                    <a href="/" className="text-sm text-gray-400 hover:text-gold-500 transition-colors">
                        ← Voltar para a loja
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LojistaLogin;
