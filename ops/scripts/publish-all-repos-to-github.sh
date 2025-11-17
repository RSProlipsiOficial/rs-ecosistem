#!/bin/bash

set -e

GITHUB_TOKEN="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"
GITHUB_ORG="RSProlipsiOficial"
BASE_DIR="G:/Rs  Ecosystem"

repos=(
  "rs-ecosystem"
  "bolt.new"
  "n8n"
  "evolution-api"
  "openhunter"
)

cd "$BASE_DIR"

for repo in "${repos[@]}"; do
  echo "=== Publicando $repo ==="
  
  if [ ! -d "$repo" ]; then
    echo "❌ Diretório $repo não encontrado, pulando..."
    continue
  fi
  
  cd "$BASE_DIR/$repo"
  
  if [ ! -d ".git" ]; then
    echo "Inicializando repositório Git..."
    git init
    git add -A
    git commit -m "Initial commit - RS Prólipsi"
  fi
  
  echo "Criando repositório no GitHub..."
  curl -X POST \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    https://api.github.com/orgs/${GITHUB_ORG}/repos \
    -d "{\"name\":\"${repo}\",\"private\":false,\"auto_init\":false}"
  
  echo "Configurando remote..."
  git remote remove origin 2>/dev/null || true
  git remote add origin https://${GITHUB_TOKEN}@github.com/${GITHUB_ORG}/${repo}.git
  
  echo "Publicando no GitHub..."
  git branch -M main
  git push -u origin main --force
  
  echo "✅ $repo publicado com sucesso!"
  echo ""
done

echo "=== Todos os repositórios publicados ==="