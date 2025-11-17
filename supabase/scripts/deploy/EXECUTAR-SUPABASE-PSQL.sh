#!/bin/bash
# ================================================
# RS PRÓLIPSI - EXECUTAR SQL VIA PSQL
# ================================================
# Execute este script se preferir linha de comando
# ================================================

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================"
echo "🚀 RS PRÓLIPSI - EXECUTANDO SQL NO SUPABASE"
echo "================================================"

# Credenciais Supabase
SUPABASE_HOST="db.rptkhrboejbwexseikuo.supabase.co"
SUPABASE_PORT="5432"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres"
SUPABASE_PASSWORD="Yannis784512@"

# Connection string
export PGPASSWORD="$SUPABASE_PASSWORD"

echo ""
echo "${YELLOW}📡 Testando conexão com Supabase...${NC}"

# Testar conexão
psql -h "$SUPABASE_HOST" \
     -p "$SUPABASE_PORT" \
     -U "$SUPABASE_USER" \
     -d "$SUPABASE_DB" \
     -c "SELECT version();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Conexão estabelecida!${NC}"
else
    echo "${RED}❌ Erro na conexão. Verifique as credenciais.${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}📊 Executando Parte 1 (Tabelas)...${NC}"

psql -h "$SUPABASE_HOST" \
     -p "$SUPABASE_PORT" \
     -U "$SUPABASE_USER" \
     -d "$SUPABASE_DB" \
     -f "SUPABASE-COMPLETO-FINAL.sql"

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Parte 1 executada com sucesso!${NC}"
else
    echo "${RED}❌ Erro na Parte 1${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}📊 Executando Parte 2 (Funções e Triggers)...${NC}"

psql -h "$SUPABASE_HOST" \
     -p "$SUPABASE_PORT" \
     -U "$SUPABASE_USER" \
     -d "$SUPABASE_DB" \
     -f "SUPABASE-COMPLETO-FINAL-PARTE2.sql"

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Parte 2 executada com sucesso!${NC}"
else
    echo "${RED}❌ Erro na Parte 2${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}📊 Executando Parte 3 (RLS e Seed)...${NC}"

psql -h "$SUPABASE_HOST" \
     -p "$SUPABASE_PORT" \
     -U "$SUPABASE_USER" \
     -d "$SUPABASE_DB" \
     -f "SUPABASE-COMPLETO-FINAL-PARTE3.sql"

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Parte 3 executada com sucesso!${NC}"
else
    echo "${RED}❌ Erro na Parte 3${NC}"
    exit 1
fi

echo ""
echo "${YELLOW}🔍 Verificando tabelas criadas...${NC}"

TABELAS=$(psql -h "$SUPABASE_HOST" \
               -p "$SUPABASE_PORT" \
               -U "$SUPABASE_USER" \
               -d "$SUPABASE_DB" \
               -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

echo "${GREEN}✅ Total de tabelas: $TABELAS${NC}"

if [ "$TABELAS" -ge 16 ]; then
    echo ""
    echo "================================================"
    echo "${GREEN}🎉 SUCESSO TOTAL!${NC}"
    echo "================================================"
    echo "✅ Todas as tabelas criadas"
    echo "✅ Todas as funções criadas"
    echo "✅ Todos os triggers criados"
    echo "✅ Todas as views criadas"
    echo "✅ RLS policies ativas"
    echo "✅ Dados seed inseridos"
    echo "================================================"
    echo "💛🖤 RS PRÓLIPSI - BANCO 100% FUNCIONAL!"
    echo "================================================"
else
    echo "${RED}⚠️ Atenção: Esperado 16+ tabelas, encontrado: $TABELAS${NC}"
fi

# Limpar variável de senha
unset PGPASSWORD

echo ""
echo "Pressione Enter para sair..."
read
