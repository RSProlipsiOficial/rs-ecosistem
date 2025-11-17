"""
Script Master - Executa TODOS os SQLs no Supabase
RS Prólipsi - Deploy Completo
"""

import psycopg2
import os
from datetime import datetime

# Configuração
SUPABASE_CONFIG = {
    'host': 'db.rptkhrboejbwexseikuo.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'Yannis784512@'
}

# Lista de SQLs para executar
SQL_FILES = [
    'SUPABASE-CD-STOCK.sql',
    'SUPABASE-RLS-COMPLETO.sql'
]

def executar_sql(cursor, filepath):
    """Executa um arquivo SQL"""
    print(f"\n{'='*70}")
    print(f"📄 Executando: {filepath}")
    print('='*70)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            sql = f.read()
        
        cursor.execute(sql)
        print(f"✅ {filepath} executado com sucesso!")
        return True
    except Exception as e:
        print(f"❌ Erro em {filepath}: {e}")
        return False

def main():
    print("\n" + "="*70)
    print("🚀 DEPLOY COMPLETO - RS PRÓLIPSI")
    print("="*70)
    print(f"⏰ Início: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("="*70)
    
    # Conectar
    conn = psycopg2.connect(**SUPABASE_CONFIG)
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Executar cada SQL
    resultados = {}
    for sql_file in SQL_FILES:
        if os.path.exists(sql_file):
            resultados[sql_file] = executar_sql(cursor, sql_file)
        else:
            print(f"⚠️  Arquivo não encontrado: {sql_file}")
            resultados[sql_file] = False
    
    # Verificar estado final
    print("\n" + "="*70)
    print("📊 VERIFICANDO ESTADO FINAL DO BANCO")
    print("="*70)
    
    # Total de tabelas
    cursor.execute("""
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    total_tabelas = cursor.fetchone()[0]
    print(f"📋 Total de Tabelas: {total_tabelas}")
    
    # Tabelas com RLS
    cursor.execute("""
        SELECT COUNT(*) 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true
    """)
    tabelas_rls = cursor.fetchone()[0]
    print(f"🔒 Tabelas com RLS: {tabelas_rls}")
    
    # Total de funções
    cursor.execute("""
        SELECT COUNT(*) 
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
    """)
    total_funcoes = cursor.fetchone()[0]
    print(f"⚙️  Total de Funções: {total_funcoes}")
    
    # Total de views
    cursor.execute("""
        SELECT COUNT(*) 
        FROM information_schema.views 
        WHERE table_schema = 'public'
    """)
    total_views = cursor.fetchone()[0]
    print(f"👁️  Total de Views: {total_views}")
    
    # Total de políticas RLS
    cursor.execute("""
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE schemaname = 'public'
    """)
    total_policies = cursor.fetchone()[0]
    print(f"🛡️  Total de Políticas RLS: {total_policies}")
    
    # Relatório final
    print("\n" + "="*70)
    print("📊 RELATÓRIO FINAL")
    print("="*70)
    
    sucesso = sum(1 for v in resultados.values() if v)
    total = len(resultados)
    
    print(f"\nArquivos executados: {sucesso}/{total}")
    for arquivo, status in resultados.items():
        icon = "✅" if status else "❌"
        print(f"  {icon} {arquivo}")
    
    print("\n" + "="*70)
    print("🎉 DEPLOY COMPLETO FINALIZADO!")
    print("="*70)
    print(f"⏰ Fim: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print("\n💛🖤 RS PRÓLIPSI - SISTEMA 100% NO AR!")
    print("="*70 + "\n")
    
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
