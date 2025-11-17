#!/usr/bin/env bash
# RS PRÓLIPSI - Scripts auxiliares para VPS

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função: Atualizar todos os repositórios
update_all_repos() {
    echo -e "${BLUE}>>> Atualizando todos os repositórios...${NC}"
    for d in ~/dev/*; do
        if [ -d "$d/.git" ]; then
            echo -e "${YELLOW}Atualizando $(basename $d)...${NC}"
            cd "$d"
            git pull || echo -e "${RED}Erro ao atualizar $(basename $d)${NC}"
        fi
    done
    echo -e "${GREEN}✅ Atualização concluída!${NC}"
}

# Função: Instalar dependências em todos os projetos
install_all_deps() {
    echo -e "${BLUE}>>> Instalando dependências em todos os projetos...${NC}"
    for d in ~/dev/*; do
        if [ -d "$d" ] && [ -f "$d/package.json" ]; then
            echo -e "${YELLOW}Instalando em $(basename $d)...${NC}"
            cd "$d"
            pnpm install || npm install || echo -e "${RED}Erro em $(basename $d)${NC}"
        fi
    done
    echo -e "${GREEN}✅ Instalação concluída!${NC}"
}

# Função: Limpar node_modules de todos os projetos
clean_all_modules() {
    echo -e "${YELLOW}⚠️  Isso vai remover todos os node_modules. Continuar? (s/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}>>> Limpando node_modules...${NC}"
        find ~/dev -name "node_modules" -type d -prune -exec rm -rf {} +
        echo -e "${GREEN}✅ Limpeza concluída!${NC}"
    else
        echo -e "${YELLOW}Operação cancelada.${NC}"
    fi
}

# Função: Status de todos os projetos Git
git_status_all() {
    echo -e "${BLUE}>>> Verificando status Git de todos os projetos...${NC}"
    for d in ~/dev/*; do
        if [ -d "$d/.git" ]; then
            cd "$d"
            echo -e "\n${YELLOW}=== $(basename $d) ===${NC}"
            git status -s
            
            # Verificar se há commits não pushados
            LOCAL=$(git rev-parse @)
            REMOTE=$(git rev-parse @{u} 2>/dev/null)
            if [ "$LOCAL" != "$REMOTE" ]; then
                echo -e "${RED}⚠️  Há commits locais não enviados!${NC}"
            fi
        fi
    done
}

# Função: Criar backup de todos os projetos
backup_all() {
    BACKUP_DIR=~/backups/$(date +%Y%m%d_%H%M%S)
    echo -e "${BLUE}>>> Criando backup em $BACKUP_DIR...${NC}"
    mkdir -p "$BACKUP_DIR"
    
    for d in ~/dev/*; do
        if [ -d "$d" ]; then
            echo -e "${YELLOW}Backup de $(basename $d)...${NC}"
            tar -czf "$BACKUP_DIR/$(basename $d).tar.gz" -C ~/dev "$(basename $d)"
        fi
    done
    
    echo -e "${GREEN}✅ Backup concluído em $BACKUP_DIR${NC}"
}

# Função: Listar todos os projetos e suas portas (se estiverem rodando)
list_projects() {
    echo -e "${BLUE}>>> Projetos disponíveis:${NC}\n"
    for d in ~/dev/*; do
        if [ -d "$d" ]; then
            PROJECT=$(basename $d)
            echo -e "${GREEN}📁 $PROJECT${NC}"
            
            # Verificar se tem package.json
            if [ -f "$d/package.json" ]; then
                # Tentar extrair scripts
                if command -v jq &> /dev/null; then
                    SCRIPTS=$(jq -r '.scripts | keys[]' "$d/package.json" 2>/dev/null | head -5)
                    if [ -n "$SCRIPTS" ]; then
                        echo -e "   ${YELLOW}Scripts:${NC} $(echo $SCRIPTS | tr '\n' ', ' | sed 's/,$//')"
                    fi
                fi
            fi
            
            # Verificar se está rodando no PM2
            if pm2 list | grep -q "$PROJECT"; then
                echo -e "   ${GREEN}✅ Rodando no PM2${NC}"
            fi
            
            echo ""
        fi
    done
}

# Função: Verificar saúde do sistema
system_health() {
    echo -e "${BLUE}>>> Verificando saúde do sistema...${NC}\n"
    
    # Disco
    echo -e "${YELLOW}💾 Uso de Disco:${NC}"
    df -h / | tail -1
    echo ""
    
    # Memória
    echo -e "${YELLOW}🧠 Uso de Memória:${NC}"
    free -h | grep Mem
    echo ""
    
    # Docker
    echo -e "${YELLOW}🐳 Docker:${NC}"
    if command -v docker &> /dev/null; then
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "Docker não instalado"
    fi
    echo ""
    
    # PM2
    echo -e "${YELLOW}⚡ PM2:${NC}"
    if command -v pm2 &> /dev/null; then
        pm2 list
    else
        echo "PM2 não instalado"
    fi
    echo ""
    
    # Node
    echo -e "${YELLOW}📦 Node:${NC}"
    node -v 2>/dev/null || echo "Node não instalado"
    echo ""
    
    # PNPM
    echo -e "${YELLOW}📦 PNPM:${NC}"
    pnpm -v 2>/dev/null || echo "PNPM não instalado"
}

# Função: Configurar variáveis de ambiente em um projeto
setup_env() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Uso: setup_env <nome-do-projeto>${NC}"
        echo -e "${YELLOW}Exemplo: setup_env rs-admin${NC}"
        return 1
    fi
    
    PROJECT="$1"
    PROJECT_DIR=~/dev/$PROJECT
    
    if [ ! -d "$PROJECT_DIR" ]; then
        echo -e "${RED}❌ Projeto $PROJECT não encontrado em ~/dev/${NC}"
        return 1
    fi
    
    if [ ! -f ~/dev/.env.template ]; then
        echo -e "${RED}❌ Template .env.template não encontrado${NC}"
        return 1
    fi
    
    echo -e "${BLUE}>>> Configurando .env para $PROJECT...${NC}"
    cp ~/dev/.env.template "$PROJECT_DIR/.env"
    echo -e "${GREEN}✅ Arquivo .env criado em $PROJECT_DIR/.env${NC}"
    echo -e "${YELLOW}💡 Edite o arquivo se necessário: nano $PROJECT_DIR/.env${NC}"
}

# Função: Rodar um projeto
run_project() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Uso: run_project <nome-do-projeto> [comando]${NC}"
        echo -e "${YELLOW}Exemplo: run_project rs-admin dev${NC}"
        return 1
    fi
    
    PROJECT="$1"
    COMMAND="${2:-dev}"
    PROJECT_DIR=~/dev/$PROJECT
    
    if [ ! -d "$PROJECT_DIR" ]; then
        echo -e "${RED}❌ Projeto $PROJECT não encontrado em ~/dev/${NC}"
        return 1
    fi
    
    echo -e "${BLUE}>>> Rodando $PROJECT com comando: $COMMAND${NC}"
    cd "$PROJECT_DIR"
    
    # Verificar se tem .env
    if [ ! -f .env ] && [ -f ~/dev/.env.template ]; then
        echo -e "${YELLOW}⚠️  .env não encontrado. Criando...${NC}"
        cp ~/dev/.env.template .env
    fi
    
    pnpm run "$COMMAND"
}

# Menu principal
show_menu() {
    echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  RS PRÓLIPSI - VPS Helper Scripts     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"
    echo -e "${GREEN}1.${NC} Atualizar todos os repositórios (git pull)"
    echo -e "${GREEN}2.${NC} Instalar dependências em todos os projetos"
    echo -e "${GREEN}3.${NC} Limpar todos os node_modules"
    echo -e "${GREEN}4.${NC} Ver status Git de todos os projetos"
    echo -e "${GREEN}5.${NC} Criar backup de todos os projetos"
    echo -e "${GREEN}6.${NC} Listar todos os projetos"
    echo -e "${GREEN}7.${NC} Verificar saúde do sistema"
    echo -e "${GREEN}8.${NC} Configurar .env em um projeto"
    echo -e "${GREEN}9.${NC} Rodar um projeto"
    echo -e "${RED}0.${NC} Sair\n"
}

# Se o script for executado diretamente
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    # Verificar se foi passado um comando
    if [ -n "$1" ]; then
        case "$1" in
            update)
                update_all_repos
                ;;
            install)
                install_all_deps
                ;;
            clean)
                clean_all_modules
                ;;
            status)
                git_status_all
                ;;
            backup)
                backup_all
                ;;
            list)
                list_projects
                ;;
            health)
                system_health
                ;;
            env)
                setup_env "$2"
                ;;
            run)
                run_project "$2" "$3"
                ;;
            *)
                echo -e "${RED}Comando desconhecido: $1${NC}"
                echo -e "${YELLOW}Comandos disponíveis:${NC}"
                echo "  update  - Atualizar todos os repos"
                echo "  install - Instalar dependências"
                echo "  clean   - Limpar node_modules"
                echo "  status  - Status Git"
                echo "  backup  - Criar backup"
                echo "  list    - Listar projetos"
                echo "  health  - Saúde do sistema"
                echo "  env     - Configurar .env (uso: env <projeto>)"
                echo "  run     - Rodar projeto (uso: run <projeto> [comando])"
                ;;
        esac
    else
        # Modo interativo
        while true; do
            show_menu
            read -p "Escolha uma opção: " choice
            case $choice in
                1) update_all_repos ;;
                2) install_all_deps ;;
                3) clean_all_modules ;;
                4) git_status_all ;;
                5) backup_all ;;
                6) list_projects ;;
                7) system_health ;;
                8)
                    read -p "Nome do projeto: " proj
                    setup_env "$proj"
                    ;;
                9)
                    read -p "Nome do projeto: " proj
                    read -p "Comando (padrão: dev): " cmd
                    run_project "$proj" "${cmd:-dev}"
                    ;;
                0)
                    echo -e "${GREEN}Até logo!${NC}"
                    break
                    ;;
                *)
                    echo -e "${RED}Opção inválida!${NC}"
                    ;;
            esac
            
            if [ "$choice" != "0" ]; then
                echo -e "\n${YELLOW}Pressione Enter para continuar...${NC}"
                read
            fi
        done
    fi
fi

# Exportar funções para uso em outros scripts
export -f update_all_repos
export -f install_all_deps
export -f clean_all_modules
export -f git_status_all
export -f backup_all
export -f list_projects
export -f system_health
export -f setup_env
export -f run_project
