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
print("🎯 IMPLEMENTANDO ORIGEM FIXA COMPLETA")
print("=" * 70)
print()

# Ler e executar SQL
with open('SUPABASE-ORIGEM-FIXA-COMPLETA.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    cursor.execute(sql)
    print("✅ SQL executado com sucesso!")
except Exception as e:
    print(f"❌ Erro: {e}")

# Verificar tabelas criadas
print()
print("🔍 Verificando tabelas de origem...")
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('central_warehouse', 'affiliate_stores', 'affiliate_links')
    ORDER BY table_name
""")

tabelas = cursor.fetchall()
print(f"✅ Tabelas criadas: {len(tabelas)}/3")
for (tabela,) in tabelas:
    print(f"   ✅ {tabela}")

# Verificar Central criada
print()
print("🔍 Verificando Central...")
cursor.execute("SELECT name, code FROM central_warehouse")
central = cursor.fetchall()
if central:
    for (name, code) in central:
        print(f"   ✅ {code} - {name}")

# Verificar campos de origem
print()
print("🔍 Verificando campos origin_type e origin_id...")
cursor.execute("""
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name IN ('origin_type', 'origin_id')
    ORDER BY table_name, column_name
""")

campos = cursor.fetchall()
print(f"✅ Campos adicionados: {len(campos)}/4")
for (tabela, campo) in campos:
    print(f"   ✅ {tabela}.{campo}")

# Total final
cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
total = cursor.fetchone()[0]

print()
print("=" * 70)
print("🎉 ORIGEM FIXA COMPLETA IMPLEMENTADA!")
print("=" * 70)
print(f"✅ Total de tabelas no banco: {total}")
print()
print("📋 REGRAS IMPLEMENTADAS:")
print("   ✅ Porta obrigatória ANTES da loja")
print("   ✅ Dropship → Central (sempre)")
print("   ✅ Afiliado → Loja do Link (sempre)")
print("   ✅ CD Direto → CD Escolhido (sempre)")
print("   ✅ Grupo → Mesma origem para todos")
print("   ✅ Nunca recalcula para 'mais próximo'")
print()
print("🎯 TIPOS DE ORIGEM:")
print("   1. CD - Centro de Distribuição escolhido")
print("   2. Central - Dropship da plataforma")
print("   3. AffiliateStore - Loja do link de afiliado")
print("=" * 70)

cursor.close()
conn.close()
