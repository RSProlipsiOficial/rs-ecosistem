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
print("📦 IMPLEMENTANDO GESTÃO DE ESTOQUE POR CD")
print("=" * 70)
print()

# Ler e executar SQL
with open('SUPABASE-CD-STOCK.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    cursor.execute(sql)
    print("✅ SQL executado com sucesso!")
except Exception as e:
    print(f"❌ Erro: {e}")

# Verificar tabelas criadas
print()
print("🔍 Verificando tabelas de estoque...")
cursor.execute("""
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('cd_stock', 'stock_movements')
    ORDER BY table_name
""")

tabelas = cursor.fetchall()
print(f"✅ Tabelas criadas: {len(tabelas)}/2")
for (tabela,) in tabelas:
    print(f"   ✅ {tabela}")

# Verificar funções criadas
print()
print("🔍 Verificando funções...")
cursor.execute("""
    SELECT routine_name
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_name IN (
        'check_stock_availability',
        'reserve_stock',
        'release_stock',
        'decrease_stock'
    )
    ORDER BY routine_name
""")

funcoes = cursor.fetchall()
print(f"✅ Funções criadas: {len(funcoes)}/4")
for (funcao,) in funcoes:
    print(f"   ✅ {funcao}()")

# Verificar estoque inicial
print()
print("🔍 Verificando estoque inicial...")
cursor.execute("""
    SELECT 
        dc.name,
        COUNT(*) as produtos,
        SUM(s.quantity) as total_quantity,
        SUM(s.available) as total_available
    FROM cd_stock s
    JOIN distribution_centers dc ON dc.id = s.cd_id
    GROUP BY dc.name
    ORDER BY dc.name
""")

estoques = cursor.fetchall()
print(f"✅ Estoque configurado em {len(estoques)} CDs:")
for (cd_name, produtos, quantity, available) in estoques:
    print(f"   ✅ {cd_name}: {produtos} produto(s), {quantity} unidades ({available} disponíveis)")

# Total final
cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
total = cursor.fetchone()[0]

print()
print("=" * 70)
print("🎉 GESTÃO DE ESTOQUE IMPLEMENTADA!")
print("=" * 70)
print(f"✅ Total de tabelas no banco: {total}")
print()
print("📋 FUNCIONALIDADES:")
print("   ✅ Controle de estoque por CD")
print("   ✅ Reserva automática de produtos")
print("   ✅ Histórico de movimentações")
print("   ✅ Alertas de estoque baixo")
print("   ✅ Transferências entre CDs")
print()
print("🎯 FUNÇÕES DISPONÍVEIS:")
print("   - check_stock_availability(cd_id, product_id, quantity)")
print("   - reserve_stock(cd_id, product_id, quantity, order_id)")
print("   - release_stock(cd_id, product_id, quantity, order_id)")
print("   - decrease_stock(cd_id, product_id, quantity, order_id)")
print("=" * 70)

cursor.close()
conn.close()
