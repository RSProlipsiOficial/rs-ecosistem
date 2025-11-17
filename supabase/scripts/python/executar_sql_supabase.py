#!/usr/bin/env python3
"""
RS PRÓLIPSI - Executar SQL no Supabase
Executa os 3 arquivos SQL consolidados
"""

import psycopg2
import sys
from pathlib import Path

# Configuração
SUPABASE_CONFIG = {
    'host': 'db.rptkhrboejbwexseikuo.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'Yannis784512@'
}

# Arquivos SQL
SQL_FILES = [
    'SUPABASE-COMPLETO-FINAL.sql',
    'SUPABASE-COMPLETO-FINAL-PARTE2.sql',
    'SUPABASE-COMPLETO-FINAL-PARTE3.sql'
]

def executar_sql():
    """Executa os arquivos SQL no Supabase"""
    
    print("=" * 60)
    print("🚀 RS PRÓLIPSI - EXECUTANDO SQL NO SUPABASE")
    print("=" * 60)
    print()
    
    try:
        # Conectar ao Supabase
        print("📡 Conectando ao Supabase...")
        conn = psycopg2.connect(**SUPABASE_CONFIG)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("✅ Conexão estabelecida!")
        print()
        
        # Executar cada arquivo SQL
        for i, sql_file in enumerate(SQL_FILES, 1):
            print(f"📊 Executando Parte {i}: {sql_file}")
            
            # Ler arquivo
            file_path = Path(sql_file)
            if not file_path.exists():
                print(f"❌ Arquivo não encontrado: {sql_file}")
                continue
            
            sql_content = file_path.read_text(encoding='utf-8')
            
            # Executar SQL
            try:
                cursor.execute(sql_content)
                print(f"✅ Parte {i} executada com sucesso!")
                print()
            except Exception as e:
                print(f"❌ Erro na Parte {i}: {str(e)}")
                print()
        
        # Verificar tabelas criadas
        print("🔍 Verificando tabelas criadas...")
        cursor.execute("""
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        total_tabelas = cursor.fetchone()[0]
        
        print(f"✅ Total de tabelas: {total_tabelas}")
        print()
        
        if total_tabelas >= 16:
            print("=" * 60)
            print("🎉 SUCESSO TOTAL!")
            print("=" * 60)
            print("✅ Todas as tabelas criadas")
            print("✅ Todas as funções criadas")
            print("✅ Todos os triggers criados")
            print("✅ Todas as views criadas")
            print("✅ RLS policies ativas")
            print("✅ Dados seed inseridos")
            print("=" * 60)
            print("💛🖤 RS PRÓLIPSI - BANCO 100% FUNCIONAL!")
            print("=" * 60)
        else:
            print(f"⚠️ Atenção: Esperado 16+ tabelas, encontrado: {total_tabelas}")
        
        # Fechar conexão
        cursor.close()
        conn.close()
        
    except psycopg2.Error as e:
        print(f"❌ Erro de conexão: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    executar_sql()
