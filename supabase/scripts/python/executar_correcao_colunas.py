#!/usr/bin/env python3
"""
Script para corrigir colunas faltantes no Supabase
Executa o SQL automaticamente
"""

import os
from supabase import create_client, Client

# Credenciais do Supabase
SUPABASE_URL = "https://rptkhrboejbwexseikuo.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdGtocmJvZWpid2V4c2Vpa3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEyNjkyNTIsImV4cCI6MjA0Njg0NTI1Mn0.KxLqKgZ8N5Q6kXhPbKj7gT3dC4mB1wV9zR2eS8fN6jI"

# SQL para corrigir
SQL_FIXES = """
-- Adicionar coluna created_by
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);

-- Adicionar updated_at
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE agenda_items 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE trainings 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE catalogs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE download_materials 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
"""

def main():
    print("🔧 Conectando ao Supabase...")
    
    try:
        # Criar cliente
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("✅ Conectado!")
        
        # Nota: O cliente Python do Supabase não suporta ALTER TABLE diretamente
        # Você precisa executar isso no SQL Editor do Supabase Dashboard
        
        print("\n❌ IMPORTANTE:")
        print("O cliente Python do Supabase não suporta ALTER TABLE.")
        print("Você PRECISA executar o SQL no Supabase Dashboard.\n")
        
        print("📋 PASSO A PASSO:")
        print("1. Acesse: https://supabase.com/dashboard")
        print("2. Faça login (email + senha: Yannis784512@)")
        print("3. Selecione o projeto: rptkhrboejbwexseikuo")
        print("4. Vá em: SQL Editor")
        print("5. Cole o conteúdo do arquivo: rs-core/CORRIGIR-COLUNAS-FALTANTES.sql")
        print("6. Clique em: RUN")
        
        # Teste de conexão
        print("\n🧪 Testando conexão com a tabela...")
        result = supabase.table('announcements').select("*").limit(1).execute()
        print(f"✅ Tabela 'announcements' acessível! Registros: {len(result.data)}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")

if __name__ == "__main__":
    main()
