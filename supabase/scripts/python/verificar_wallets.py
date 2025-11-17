import psycopg2

conn = psycopg2.connect(
    host='db.rptkhrboejbwexseikuo.supabase.co',
    port=5432,
    database='postgres',
    user='postgres',
    password='Yannis784512@'
)
cursor = conn.cursor()

# Verificar se tabela wallets existe
cursor.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'wallets'
    ORDER BY ordinal_position
""")

cols = cursor.fetchall()
if cols:
    print("✅ Tabela wallets existe com colunas:")
    for col, tipo in cols:
        print(f"   - {col} ({tipo})")
else:
    print("❌ Tabela wallets NÃO existe!")
    print("Criando tabela wallets...")
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS wallets (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE,
          balance DECIMAL(15,2) DEFAULT 0.00,
          blocked_balance DECIMAL(15,2) DEFAULT 0.00,
          available_balance DECIMAL(15,2) GENERATED ALWAYS AS (balance - blocked_balance) STORED,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    """)
    conn.commit()
    print("✅ Tabela wallets criada!")

conn.close()
