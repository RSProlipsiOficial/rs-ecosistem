const supabase = require('../config/supabase');
const { creditWallet, debitWallet } = require('./wallet.controller');

// Lista de e-mails permitidos como admin (fallback enquanto is_admin não está na tabela)
const ADMIN_EMAILS = [
    'contato@rsprolipsi.com.br',
    'admin@rsprolipsi.com.br',
    'roberto@rsprolipsi.com.br', // Adicionar outros se necessário
    'suporte@rsprolipsi.com.br'
];

async function checkAdmin(userId) {
    // 1. Tentar verificar flag no banco
    const { data: user } = await supabase.from('consultores').select('is_admin, email').eq('user_id', userId).single();

    if (user?.is_admin) return true;

    // 2. Fallback: Verificar email na lista permitida
    // Precisamos pegar o email do user_id se não veio na query acima
    if (user && ADMIN_EMAILS.includes(user.email)) return true;

    // Se não achou consultor (pode ser admin puro na auth), buscar na auth (não acessível direto daqui com cliente anon)
    // Mas assumimos que todo admin tem cadastro de consultor/usuário.

    return false;
}

/**
 * Adicionar Crédito Manual (ADMIN)
 */
exports.adminCredit = async (req, res) => {
    try {
        const { userId, amount, description, type } = req.body;
        const adminId = req.user.id;

        // Verificar permissão
        if (!(await checkAdmin(adminId))) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }

        if (!userId || !amount) {
            return res.status(400).json({ error: 'userId e amount são obrigatórios.' });
        }

        // 1. Get Wallet
        let { data: wallet } = await supabase.from('wallets').select('saldo_disponivel').eq('consultor_id', userId).single();

        // Tentar por user_id se falhar por consultor_id (o front manda qual?)
        if (!wallet) {
            const { data: w2 } = await supabase.from('wallets').select('saldo_disponivel').eq('user_id', userId).single();
            wallet = w2;
        }

        if (!wallet) return res.status(404).json({ error: 'Carteira não encontrada.' });

        const newBalance = (wallet.saldo_disponivel || 0) + Number(amount);

        // 2. Update Wallet (usar user_id ou consultor_id, tentar ambos no where é perigoso, melhor identificar qual é)
        // Assumindo userId recebido é USER_ID (UUID) do supabase auth.
        await supabase.from('wallets').update({
            saldo_disponivel: newBalance,
            saldo_total: newBalance,
            updated_at: new Date()
        }).eq('user_id', userId);

        // 3. Log Transaction
        await supabase.from('wallet_transactions').insert({
            user_id: userId,
            type: type || 'adjustment',
            amount: Number(amount),
            description: description || 'Crédito Admin',
            balance_after: newBalance,
            created_at: new Date(),
            metadata: { admin_id: adminId }
        });

        res.json({ success: true, newBalance, message: 'Crédito realizado com sucesso.' });

    } catch (error) {
        console.error('Erro adminCredit:', error);
        res.status(500).json({ error: 'Erro interno ao creditar saldo.' });
    }
};

/**
 * Remover Saldo Manual (ADMIN)
 */
exports.adminDebit = async (req, res) => {
    try {
        const { userId, amount, description } = req.body;
        const adminId = req.user.id;

        if (!(await checkAdmin(adminId))) {
            return res.status(403).json({ error: 'Acesso negado.' });
        }

        if (!userId || !amount) return res.status(400).json({ error: 'userId e amount são obrigatórios.' });

        // 1. Get Wallet
        let { data: wallet } = await supabase.from('wallets').select('saldo_disponivel').eq('user_id', userId).single();
        if (!wallet) {
            const { data: w2 } = await supabase.from('wallets').select('saldo_disponivel').eq('consultor_id', userId).single();
            wallet = w2;
        }

        if (!wallet) return res.status(404).json({ error: 'Carteira não encontrada.' });

        if (wallet.saldo_disponivel < amount) return res.status(400).json({ error: 'Saldo insuficiente.' });

        const newBalance = wallet.saldo_disponivel - Number(amount);

        // 2. Update Wallet
        await supabase.from('wallets').update({
            saldo_disponivel: newBalance,
            saldo_total: newBalance,
            updated_at: new Date()
        }).eq('user_id', userId); // Assumindo user_id

        // 3. Log Transaction
        await supabase.from('wallet_transactions').insert({
            user_id: userId,
            type: 'debit',
            amount: Number(amount),
            description: description || 'Débito Admin',
            balance_after: newBalance,
            created_at: new Date(),
            metadata: { admin_id: adminId }
        });

        res.json({ success: true, newBalance, message: 'Débito realizado com sucesso.' });

    } catch (error) {
        console.error('Erro adminDebit:', error);
        res.status(500).json({ error: 'Erro interno ao debitar saldo.' });
    }
};

/**
 * Listar Todas as Transações (ADMIN)
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const { limit = 50, offset = 0, search } = req.query;
        const adminId = req.user.id;

        if (!(await checkAdmin(adminId))) {
            return res.status(403).json({ error: 'Acesso negado.' });
        }

        let query = supabase
            .from('wallet_transactions')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (search) {
            query = query.or(`description.ilike.%${search}%,order_id.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Enriquecer com nomes de usuários manualmente (já que join é chato sem FK explícita configurada no client)
        const userIds = [...new Set(data.map(t => t.user_id))];
        const { data: users } = await supabase.from('consultores').select('user_id, nome, email').in('user_id', userIds);

        const enrichedData = data.map(t => {
            const user = users?.find(u => u.user_id === t.user_id);
            return {
                ...t,
                user: user ? { name: user.nome, email: user.email, id: user.user_id } : { name: 'Desconhecido', id: t.user_id }
            };
        });

        res.json({ success: true, transactions: enrichedData });

    } catch (error) {
        console.error('Erro getAllTransactions:', error);
        res.status(500).json({ error: 'Erro ao listar transações.' });
    }
};
