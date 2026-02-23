import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile } from '../types';
import { Shield, Lock, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';

interface AdminLoginProps {
    onBack: () => void;
    onSuccess: (user: UserProfile) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAdminLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        console.log("[AdminLogin] Início de login para:", email);
        if (typeof window !== 'undefined') {
            console.log("[AdminLogin] Chamando signInWithPassword...");
        }

        try {
            // 1. Auth with Supabase
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim()
            });

            if (authError) throw authError;

            if (user) {
                console.log("[AdminLogin] Login Supabase OK! Redirecionando...");

                const adminUser: UserProfile = {
                    id: user.id,
                    name: user.user_metadata.full_name || 'Administrador Master',
                    email: user.email || '',
                    plan: 'admin_master',
                    referralCode: 'MASTER'
                };

                // Fallback: Chamamos onSuccess diretamente para forçar a renderização imediata do App
                onSuccess(adminUser);
            } else {
                throw new Error("Usuário não encontrado após login.");
            }
        } catch (err: any) {
            console.error("[AdminLogin] Erro:", err);
            setError(err.message || 'Falha na autenticação administrativa.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-900 shadow-lg shadow-red-500/50"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

            <div className="w-full max-w-md bg-zinc-900/80 border border-red-900/50 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative z-10 animate-fade-in">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-4 border border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                        <Shield size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-wider uppercase">Painel Master</h1>
                    <p className="text-red-400 text-xs font-mono mt-1 tracking-widest">Acesso Restrito</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-200 text-sm">
                        <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Login Administrativo</label>
                        <div className="relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-black/50 border border-zinc-700 rounded-lg p-4 pl-12 text-white outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all font-mono"
                                placeholder="rsprolipsioficial@gmail.com"
                                required
                            />
                            <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Chave de Segurança</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-black/50 border border-zinc-700 rounded-lg p-4 pl-12 text-white outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-all font-mono"
                                placeholder="••••••••••••"
                                required
                            />
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                            <>
                                ACESSAR SISTEMA <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={onBack}
                        className="text-zinc-500 hover:text-white text-xs transition-colors underline decoration-zinc-700 hover:decoration-white"
                    >
                        Voltar para Login Padrão
                    </button>
                </div>
            </div>

            <div className="absolute bottom-4 text-[10px] text-zinc-700 font-mono">
                RS SYSTEM v2.0.0 • UNAUTHORIZED ACCESS IS PROHIBITED
            </div>
        </div>
    );
};
