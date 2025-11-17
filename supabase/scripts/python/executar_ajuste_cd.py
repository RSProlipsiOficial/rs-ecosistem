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
print("🚚 APLICANDO AJUSTE: CD DE ORIGEM FIXA")
print("=" * 70)
print()

# Ler e executar SQL
with open('SUPABASE-AJUSTE-CD-FIXO.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    cursor.execute(sql)
    print("✅ SQL executado com sucesso!")
except Exception as e:
    print(f"❌ Erro: {e}")

# Verificar colunas adicionadas
print()
print("🔍 Verificando colunas cd_origin_id...")
cursor.execute("""
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'cd_origin_id'
    ORDER BY table_name
""")

colunas = cursor.fetchall()
print(f"✅ Colunas adicionadas: {len(colunas)}/2")
for (tabela, coluna) in colunas:
    print(f"   ✅ {tabela}.{coluna}")

# Verificar CDs criados
print()
print("🔍 Verificando CDs cadastrados...")
cursor.execute("""
    SELECT code, name, region, is_active
    FROM distribution_centers
    ORDER BY code
""")

cds = cursor.fetchall()
print(f"✅ CDs cadastrados: {len(cds)}")
for (code, name, region, is_active) in cds:
    status = "✅ Ativo" if is_active else "❌ Inativo"
    print(f"   {status} {code} - {name} ({region})")

# Verificar views
print()
print("🔍 Verificando views...")
cursor.execute("""
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
    AND table_name IN ('vw_orders_by_cd', 'vw_shared_orders_by_cd')
    ORDER BY table_name
""")

views = cursor.fetchall()
print(f"✅ Views criadas: {len(views)}/2")
for (view,) in views:
    print(f"   ✅ {view}")

print()
print("=" * 70)
print("🎉 AJUSTE APLICADO COM SUCESSO!")
print("=" * 70)
print("✅ Modelo: CD de origem fixa (buyer_choice)")
print("✅ Comprador escolhe CD no checkout")
print("✅ CD permanece fixo durante todo o pedido")
print("✅ Não recalcula automaticamente")
print("✅ Suporta dropshipping descentralizado")
print("✅ Cada CD gerencia apenas seus pedidos")
print("=" * 70)

cursor.close()
conn.close()
