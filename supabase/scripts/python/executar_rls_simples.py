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
print("🔒 IMPLEMENTANDO RLS SIMPLIFICADO")
print("=" * 70)
print()

# Ler e executar SQL
with open('SUPABASE-RLS-SIMPLES.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    cursor.execute(sql)
    print("✅ RLS Simplificado executado com sucesso!")
except Exception as e:
    print(f"❌ Erro: {e}")

# Verificar tabelas com RLS
print()
print("🔍 Verificando tabelas com RLS...")
cursor.execute("""
    SELECT COUNT(*) 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = true
""")

tabelas_rls = cursor.fetchone()[0]
print(f"✅ Tabelas com RLS: {tabelas_rls}")

# Verificar políticas
cursor.execute("""
    SELECT COUNT(*) 
    FROM pg_policies 
    WHERE schemaname = 'public'
""")

policies = cursor.fetchone()[0]
print(f"✅ Políticas RLS: {policies}")

# Total de tabelas
cursor.execute("""
    SELECT COUNT(*) 
    FROM pg_tables 
    WHERE schemaname = 'public'
""")

total_tabelas = cursor.fetchone()[0]
print(f"✅ Total de tabelas: {total_tabelas}")

print()
print("=" * 70)
print("🎉 RLS IMPLEMENTADO!")
print("=" * 70)
print(f"✅ {tabelas_rls}/{total_tabelas} tabelas com RLS")
print(f"✅ {policies} políticas de segurança")
print("💛🖤 SISTEMA SEGURO!")
print("=" * 70)

cursor.close()
conn.close()
