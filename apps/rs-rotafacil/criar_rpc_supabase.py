import psycopg2
import sys

# Credenciais do Supabase Rota Fácil
DB_HOST = "db.rptkhrboejbwexseikuo.supabase.co"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "Yannis784512@"
DB_PORT = 5432

SQL_CREATE_RPC = """
-- Remover funções duplicadas
DROP FUNCTION IF EXISTS public.get_admin_users_list();
DROP FUNCTION IF EXISTS public.get_admin_users_list(uuid);

-- Criar RPC única
CREATE OR REPLACE FUNCTION public.get_rotafacil_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  user_metadata jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  ultimo_login timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    email,
    raw_user_meta_data as user_metadata,
    created_at::timestamptz,
    updated_at::timestamptz,
    last_sign_in_at::timestamptz as ultimo_login
  FROM auth.users
  WHERE deleted_at IS NULL
  ORDER BY created_at DESC;
$$;

-- Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_rotafacil_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_rotafacil_all_users() TO anon;
"""

def criar_rpc():
    try:
        print("[INFO] Conectando ao Supabase...")
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        
        cursor = conn.cursor()
        
        print("[INFO] Executando SQL para criar RPC...")
        cursor.execute(SQL_CREATE_RPC)
        
        conn.commit()
        
        print("[SUCESSO] RPC get_rotafacil_all_users() criada com sucesso!")
        print("[SUCESSO] Funcoes duplicadas removidas!")
        print("[SUCESSO] Permissoes configuradas!")
        
        # Testar a RPC
        print("\n[INFO] Testando a RPC...")
        cursor.execute("SELECT COUNT(*) FROM get_rotafacil_all_users();")
        count = cursor.fetchone()[0]
        print(f"[SUCESSO] RPC funcional! Total de usuarios: {count}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"[ERRO] Erro: {e}")
        return False

if __name__ == "__main__":
    sucesso = criar_rpc()
    sys.exit(0 if sucesso else 1)
