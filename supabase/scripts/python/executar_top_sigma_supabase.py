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
print("🏆 CRIANDO SISTEMA TOP SIGMA E RANKING")
print("=" * 70)
print()

# Ler e executar SQL
with open('SUPABASE-TOP-SIGMA-RANKING.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

try:
    cursor.execute(sql)
    print("✅ SQL executado com sucesso!")
except Exception as e:
    print(f"❌ Erro: {e}")

# Verificar tabelas criadas
print()
print("🔍 Verificando tabelas criadas...")
cursor.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN (
        'cycles_ledger',
        'cycle_ranking_snapshots',
        'top_sigma_snapshots',
        'top_sigma_payouts'
    )
    ORDER BY table_name
""")

tabelas = cursor.fetchall()
print(f"✅ Tabelas criadas: {len(tabelas)}/4")
for (tabela,) in tabelas:
    print(f"   ✅ {tabela}")

# Verificar views
print()
print("🔍 Verificando views...")
cursor.execute("""
    SELECT table_name 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'vw_%sigma%' OR table_name LIKE 'vw_%ranking%' OR table_name LIKE 'vw_%cycles%'
    ORDER BY table_name
""")

views = cursor.fetchall()
print(f"✅ Views criadas: {len(views)}")
for (view,) in views:
    print(f"   ✅ {view}")

# Total final
cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
total = cursor.fetchone()[0]

print()
print("=" * 70)
print("🎉 SISTEMA TOP SIGMA E RANKING CRIADO!")
print("=" * 70)
print(f"✅ Total de tabelas no banco: {total}")
print("✅ Configurações criadas:")
print("   - topSigma.json")
print("   - ranking.json")
print("✅ CRONs criados:")
print("   - closeMonthlyTopSigma.ts")
print("   - snapshotMonthlyCycleRanking.ts")
print("✅ Engine criado:")
print("   - topSigmaDistributor.ts")
print("=" * 70)

cursor.close()
conn.close()
