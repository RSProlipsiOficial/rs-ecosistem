-- ==========================================================
-- SCRIPT DE LIMPEZA: CONTAS TEMPORÁRIAS DE MIGRAÇÃO
-- Este script remove 5,427 contas de teste com @prolipsi.temp
-- Execute APENAS se você deseja REMOVER esses usuários permanentemente.
-- ==========================================================

-- ⚠️ AVISO: Esta operação é IRREVERSÍVEL.
-- Crie um backup antes de executar.

-- Deletar contas temporárias de auth.users
DELETE FROM auth.users
WHERE email LIKE '%@prolipsi.temp';

-- Verificar contagem após limpeza
SELECT COUNT(*) as total_users_after_cleanup FROM auth.users;

-- ==========================================================
-- RESULTADO ESPERADO: Aproximadamente 379 usuários reais.
-- ==========================================================
