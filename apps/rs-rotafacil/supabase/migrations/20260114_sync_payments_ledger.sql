-- Trigger para sincronizar pagamentos_mensais com lancamentos_financeiros
-- Garante que toda mensalidade gerada apareça no Fluxo de Caixa

CREATE OR REPLACE FUNCTION sync_payment_to_ledger()
RETURNS TRIGGER AS $$
DECLARE
    v_nome_aluno TEXT;
    v_van_id UUID;
    v_referencia_id TEXT;
BEGIN
    -- Obter dados extras do aluno
    SELECT nome_completo, van_id INTO v_nome_aluno, v_van_id
    FROM alunos WHERE id = NEW.aluno_id;

    v_referencia_id := 'mensalidade-' || NEW.aluno_id || '-' || NEW.ano || '-' || LPAD(NEW.mes::text, 2, '0');

    -- Upsert no lancamentos_financeiros
    INSERT INTO lancamentos_financeiros (
        user_id,
        tipo,
        origem,
        categoria,
        aluno_id,
        van_id,
        descricao,
        valor,
        competencia,
        data_evento,
        status,
        pagamento_status,
        alocacao,
        referencia_id
    )
    VALUES (
        NEW.user_id,
        'receita',
        'mensalidade',
        'OUTROS',
        NEW.aluno_id,
        v_van_id,
        'Mensalidade - ' || v_nome_aluno,
        NEW.valor,
        NEW.ano || '-' || LPAD(NEW.mes::text, 2, '0'),
        NEW.data_vencimento,
        CASE WHEN NEW.status = 'pago' THEN 'realizado' ELSE 'previsto' END,
        CASE WHEN NEW.status = 'pago' THEN 'pago' ELSE 'pendente' END,
        'empresa',
        v_referencia_id
    )
    ON CONFLICT (referencia_id) DO UPDATE SET
        valor = EXCLUDED.valor,
        data_evento = EXCLUDED.data_evento,
        status = EXCLUDED.status,
        pagamento_status = EXCLUDED.pagamento_status,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sync_payment_to_ledger ON pagamentos_mensais;
CREATE TRIGGER tr_sync_payment_to_ledger
AFTER INSERT OR UPDATE ON pagamentos_mensais
FOR EACH ROW EXECUTE FUNCTION sync_payment_to_ledger();
