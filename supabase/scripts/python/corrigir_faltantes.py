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

print("🔧 Criando tabela system_config...")

cursor.execute("""
CREATE TABLE IF NOT EXISTS system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO system_config (key, value, description) VALUES
('sistema.versao', '"1.0.0"', 'Versão atual do sistema'),
('matriz.tamanho', '6', 'Tamanho da matriz SIGMA (1x6)'),
('matriz.valor_ciclo', '360.00', 'Valor de cada ciclo completado'),
('bonus.ciclo_percentual', '30.00', 'Percentual do bônus de ciclo'),
('bonus.profundidade_percentual', '6.81', 'Percentual do bônus de profundidade'),
('bonus.carreira_percentual', '6.39', 'Percentual do bônus de carreira'),
('bonus.fidelidade_percentual', '1.25', 'Percentual do pool de fidelidade'),
('bonus.top_sigma_percentual', '4.50', 'Percentual do pool Top SIGMA')
ON CONFLICT (key) DO NOTHING;
""")

print("✅ Tabela system_config criada!")

# Verificar total
cursor.execute("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'")
total = cursor.fetchone()[0]

print(f"\n📊 Total de tabelas agora: {total}")

cursor.close()
conn.close()

print("\n✅ PRONTO!")
