import psycopg2

conn = psycopg2.connect(
    host='db.rptkhrboejbwexseikuo.supabase.co',
    port=5432,
    database='postgres',
    user='postgres',
    password='Yannis784512@'
)
conn.autocommit = True
cursor = conn.cursor()

print("=" * 70)
print("💰 CRIANDO SISTEMA FINANCEIRO COMPLETO")
print("=" * 70)
print()

# Ler e executar SQL
with open('SUPABASE-SISTEMA-FINANCEIRO.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    cursor.execute(sql)
    print("✅ SQL executado com sucesso!")
except Exception as e:
    print(f"❌ Erro: {e}")

# Verificar tabelas criadas
print()
print("🔍 Verificando tabelas financeiras...")
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'wallet_withdrawals',
        'wallet_payouts',
        'wallet_transfers',
        'payment_transactions',
        'shared_orders',
        'shared_order_participants',
        'shared_order_payments',
        'payment_logs'
    )
    ORDER BY table_name
""")

tabelas = cursor.fetchall()
print(f"✅ Tabelas criadas: {len(tabelas)}/8")
for (tabela,) in tabelas:
    print(f"   ✅ {tabela}")

# Verificar funções
print()
print("🔍 Verificando funções...")
cursor.execute("""
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('request_withdrawal', 'transfer_between_users')
    ORDER BY routine_name
""")

funcoes = cursor.fetchall()
print(f"✅ Funções criadas: {len(funcoes)}/2")
for (funcao,) in funcoes:
    print(f"   ✅ {funcao}()")

# Total final
cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
total = cursor.fetchone()[0]

print()
print("=" * 70)
print("🎉 SISTEMA FINANCEIRO CRIADO!")
print("=" * 70)
print(f"✅ Total de tabelas no banco: {total}")
print("✅ Configurações criadas:")
print("   - payments.json")
print("   - transfers.json")
print("   - multimodal.json")
print("   - sharedOrders.json")
print("✅ Funcionalidades:")
print("   - Saques (janela 1-5, pagamento 10-15)")
print("   - Transferências entre usuários")
print("   - Pagamentos multimodais")
print("   - Pedidos compartilhados")
print("=" * 70)

cursor.close()
conn.close()
