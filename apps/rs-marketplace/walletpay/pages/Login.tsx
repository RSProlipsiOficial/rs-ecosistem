import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../src/services/api';

const InputField: React.FC<{ name: string, label: string, type?: string, placeholder?: string, required?: boolean, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> =
 ({ name, label, type = 'text', placeholder, required = false, value, onChange }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-text-body mb-2">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-3 rounded-lg bg-surface border border-border focus:outline-none focus:ring-2 focus:ring-gold/25 focus:border-transparent transition-all"
        />
    </div>
);

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Tentar login real
            const response = await authAPI.login(email, password);
            
            if (response.data.success) {
                // Salvar token e dados do usuário
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('userName', response.data.user.nome);
                localStorage.setItem('userEmail', response.data.user.email);
                
                // Navegar para dashboard
                navigate('/app/dashboard');
            } else {
                setError(response.data.error || 'Erro ao fazer login');
            }
        } catch (err: any) {
            console.error('Erro no login:', err);
            
            // Se a API não estiver disponível, permitir acesso demo
            if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
                console.log('API não disponível, usando modo demo');
                localStorage.setItem('userId', 'demo-user');
                localStorage.setItem('userName', email.split('@')[0]);
                localStorage.setItem('userEmail', email);
                navigate('/app/dashboard');
            } else {
                setError('Email ou senha incorretos');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-base min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gold">RS WalletPay</h1>
                    <p className="text-text-body mt-2">Acesse sua conta de consultor</p>
                </div>

                <div className="bg-card p-8 rounded-2xl border border-border shadow-custom-lg">
                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <InputField 
                            name="email" 
                            label="ID de Consultor ou Email" 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu.email@exemplo.com" 
                            required 
                        />
                        <InputField 
                            name="password" 
                            label="Senha" 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********" 
                            required 
                        />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-gold bg-surface border-border rounded focus:ring-gold" />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-body">
                                    Lembrar-me
                                </label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-gold hover:text-gold-hover">
                                    Esqueceu a senha?
                                </a>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full text-center py-3 px-6 bg-gold text-lg text-card hover:bg-gold-hover font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>
                    <p className="mt-8 text-center text-sm text-text-body">
                        Ainda não tem uma conta?{' '}
                        <Link to="/register" className="font-medium text-gold hover:text-gold-hover">
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;


