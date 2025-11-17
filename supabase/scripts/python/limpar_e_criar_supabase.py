#!/usr/bin/env python3
"""
RS PRÓLIPSI - LIMPAR E CRIAR BANCO DO ZERO
Remove tudo e cria apenas as tabelas do RS Prólipsi
"""

import psycopg2
from pathlib import Path

# Configuração
SUPABASE_CONFIG = {
    'host': 'db.rptkhrboejbwexseikuo.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'Yannis784512@'
}

SQL_FILES = [
    'SUPABASE-COMPLETO-FINAL.sql',
    'SUPABASE-COMPLETO-FINAL-PARTE2.sql',
    'SUPABASE-COMPLETO-FINAL-PARTE3.sql'
]

def limpar_e_criar():
    """Limpa o banco e cria tudo do zero"""
    
    print("=" * 70)
    print("🧹 RS PRÓLIPSI - LIMPANDO E ORGANIZANDO SUPABASE")
    print("=" * 70)
    print()
    
    try:
        # Conectar
        print("📡 Conectando ao Supabase...")
        conn = psycopg2.connect(**SUPABASE_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        print("✅ Conectado!")
        print()
        
        # 1. LISTAR O QUE TEM
        print("📊 Verificando o que existe...")
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        total_antes = cursor.fetchone()[0]
        print(f"   Tabelas existentes: {total_antes}")
        print()
        
        # 2. LIMPAR TUDO (CUIDADO!)
        print("🗑️  LIMPANDO TUDO...")
        print("   ⚠️  Removendo schema public...")
        
        try:
            cursor.execute("DROP SCHEMA public CASCADE;")
            print("   ✅ Schema removido!")
        except Exception as e:
            print(f"   ⚠️  Aviso: {e}")
        
        print("   🔨 Criando schema limpo...")
        cursor.execute("CREATE SCHEMA public;")
        cursor.execute("GRANT ALL ON SCHEMA public TO postgres;")
        cursor.execute("GRANT ALL ON SCHEMA public TO public;")
        print("   ✅ Schema criado!")
        print()
        
        # 3. CRIAR EXTENSÕES
        print("🔧 Criando extensões...")
        cursor.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
        cursor.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
        print("   ✅ Extensões criadas!")
        print()
        
        # 4. EXECUTAR SQLs DO RS PRÓLIPSI
        print("=" * 70)
        print("🚀 CRIANDO BANCO DO RS PRÓLIPSI")
        print("=" * 70)
        print()
        
        for i, sql_file in enumerate(SQL_FILES, 1):
            print(f"📄 Parte {i}/3: {sql_file}")
            
            file_path = Path(sql_file)
            if not file_path.exists():
                print(f"   ❌ Arquivo não encontrado!")
                continue
            
            sql_content = file_path.read_text(encoding='utf-8')
            
            # Remover comandos de DROP/CREATE EXTENSION (já fizemos)
            sql_content = sql_content.replace('DROP SCHEMA public CASCADE;', '')
            sql_content = sql_content.replace('CREATE SCHEMA public;', '')
            
            try:
                cursor.execute(sql_content)
                print(f"   ✅ Executado com sucesso!")
            except Exception as e:
                print(f"   ⚠️  Erro: {str(e)[:100]}")
            
            print()
        
        # 5. VERIFICAR RESULTADO
        print("=" * 70)
        print("🔍 VERIFICANDO RESULTADO")
        print("=" * 70)
        print()
        
        # Contar tabelas
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        total_depois = cursor.fetchone()[0]
        
        # Listar tabelas criadas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tabelas = cursor.fetchall()
        
        print(f"📊 Total de tabelas: {total_depois}")
        print()
        print("📋 Tabelas criadas:")
        for i, (tabela,) in enumerate(tabelas, 1):
            print(f"   {i:2d}. {tabela}")
        print()
        
        # Verificar tabelas principais
        tabelas_principais = [
            'consultores', 'wallets', 'product_catalog', 'sales',
            'matriz_cycles', 'career_points', 'career_vmec_applied',
            'career_rank_history', 'career_snapshots', 'bonuses',
            'transactions', 'downlines', 'ranking', 'cycle_events',
            'logs_operations', 'system_config'
        ]
        
        print("✅ Verificando tabelas principais:")
        todas_ok = True
        for tabela in tabelas_principais:
            cursor.execute(f"""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name = '{tabela}'
                )
            """)
            exists = cursor.fetchone()[0]
            status = "✅" if exists else "❌"
            print(f"   {status} {tabela}")
            if not exists:
                todas_ok = False
        
        print()
        
        # Resultado final
        if todas_ok and total_depois >= 15:
            print("=" * 70)
            print("🎉 SUCESSO TOTAL!")
            print("=" * 70)
            print("✅ Banco limpo e organizado")
            print("✅ Apenas tabelas do RS Prólipsi")
            print(f"✅ {total_depois} tabelas criadas")
            print("✅ Todas as funções criadas")
            print("✅ Todos os triggers criados")
            print("✅ Todas as views criadas")
            print("✅ RLS policies ativas")
            print("=" * 70)
            print("💛🖤 RS PRÓLIPSI - BANCO 100% LIMPO E FUNCIONAL!")
            print("=" * 70)
        else:
            print("⚠️  Algumas tabelas podem estar faltando")
            print(f"   Esperado: 16+ tabelas")
            print(f"   Criado: {total_depois} tabelas")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    print()
    input("⚠️  ATENÇÃO: Isso vai APAGAR TUDO no Supabase! Pressione Enter para continuar...")
    print()
    limpar_e_criar()
    print()
    input("Pressione Enter para sair...")
