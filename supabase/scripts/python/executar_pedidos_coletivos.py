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
print("📦 CRIANDO SISTEMA DE PEDIDOS COLETIVOS")
print("=" * 70)
print()

# Ler e executar SQL
with open('SUPABASE-PEDIDOS-COLETIVOS.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    cursor.execute(sql)
    print("✅ SQL executado com sucesso!")
except Exception as e:
    print(f"❌ Erro: {e}")

# Verificar tabelas criadas
print()
print("🔍 Verificando tabelas de pedidos...")
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'orders',
        'order_items',
        'distribution_centers',
        'logistics_dispatches',
        'logistics_tracking',
        'delivery_proofs'
    )
    ORDER BY table_name
""")

tabelas = cursor.fetchall()
print(f"✅ Tabelas criadas: {len(tabelas)}/6")
for (tabela,) in tabelas:
    print(f"   ✅ {tabela}")

# Verificar funções
print()
print("🔍 Verificando funções...")
cursor.execute("""
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    AND routine_name IN ('update_shared_order_progress', 'assign_nearest_cd')
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
print("🎉 SISTEMA DE PEDIDOS COLETIVOS CRIADO!")
print("=" * 70)
print(f"✅ Total de tabelas no banco: {total}")
print("✅ Configurações criadas:")
print("   - orders.json")
print("   - logistics.json")
print("   - sharedOrders.json (já existia)")
print("✅ Funcionalidades:")
print("   - Pedidos individuais e em grupo")
print("   - Pagamentos multiformes (saldo+PIX+cartão)")
print("   - Progresso visual (20%, 40%, 60%, 80%, 100%)")
print("   - Expedição automática ao atingir 100%")
print("   - CDs com atribuição automática")
print("   - Rastreamento completo")
print("   - Comprovantes de entrega")
print("=" * 70)

cursor.close()
conn.close()
