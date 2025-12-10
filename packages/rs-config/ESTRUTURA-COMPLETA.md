# 🧩 RS PRÓLIPSI - CONFIG SYSTEM
## Estrutura Completa do Módulo de Configuração

---

## 📁 Árvore de Diretórios

```
rs-config/
├── src/
│   ├── settings/           # Regras de negócio editáveis
│   │   ├── bonus.json      # ✅ Percentuais de todos os bônus
│   │   ├── planos.json     # ✅ Configuração de matrizes e pools
│   │   └── carreira.json   # ✅ 13 PINs do plano de carreira
│   │
│   ├── version/            # Controle de versão
│   │   ├── changelog.json  # ✅ Histórico de alterações
│   │   ├── version.ts      # ✅ Versão atual do sistema
│   │   └── releaseNotes.md # ✅ Notas de release
│   │
│   ├── env/                # Variáveis de ambiente
│   │   ├── supabase.env.ts # ✅ Credenciais Supabase
│   │   ├── walletpay.env.ts # ✅ Credenciais WalletPay
│   │   └── global.env.ts   # ✅ Configurações globais
│   │
│   ├── utils/              # Funções auxiliares
│   │   ├── validation.ts   # ✅ Validação de integridade
│   │   ├── formatters.ts   # ✅ Formatação de dados
│   │   └── converters.ts   # ✅ Conversões
│   │
│   └── index.ts            # ✅ Ponto de entrada (exporta tudo)
│
├── public/                 # Configuração pública
│   ├── config.json         # ✅ Config visível para front-end
│   └── readme.md           # ✅ Instruções de uso
│
├── package.json            # Dependências
├── tsconfig.json           # Config TypeScript
└── README.md               # Documentação principal
```

---

## 🎯 Propósito de Cada Pasta

### 📂 **src/settings/**
**Propósito:** Armazena todas as regras de negócio editáveis do sistema.

| Arquivo | Conteúdo | Usado por |
|---------|----------|-----------|
| `bonus.json` | Percentuais de ciclo, profundidade, fidelidade, Top SIGMA, carreira | rs-api, rs-ops |
| `planos.json` | Estrutura de matrizes, pools, alcances, regras de desbloqueio | rs-api, rs-ops |
| `carreira.json` | 13 graduações com ciclos necessários, VMECs, recompensas | rs-admin, rs-consultor |

**Características:**
- ✅ Valores podem ser alterados sem redeploy
- ✅ Validação automática de integridade
- ✅ Versionamento completo
- ❌ NÃO expor publicamente

---

### 📂 **src/version/**
**Propósito:** Controlar versões e histórico de mudanças nas configurações.

| Arquivo | Conteúdo | Usado por |
|---------|----------|-----------|
| `version.ts` | Versão atual (semântica), data, nome da release | Todos os módulos |
| `changelog.json` | Histórico detalhado de todas as alterações | Admin, DevOps |
| `releaseNotes.md` | Notas de cada release em formato legível | Documentação |

**Características:**
- ✅ Versionamento semântico (major.minor.patch)
- ✅ Rastreabilidade total de mudanças
- ✅ Facilita rollbacks
- ✅ Compatibilidade entre versões

---

### 📂 **src/env/**
**Propósito:** Centralizar variáveis de ambiente e credenciais sensíveis.

| Arquivo | Conteúdo | Usado por |
|---------|----------|-----------|
| `supabase.env.ts` | URL, anon key, service role key, JWT secret | rs-core, rs-api, rs-ops |
| `walletpay.env.ts` | API URL, API key, webhook secret, merchant ID | rs-walletpay |
| `global.env.ts` | Configurações globais, limites, emails de sistema | Todos |

**Características:**
- ✅ Credenciais seguras
- ✅ Validação de configuração
- ✅ Máscaras para logs
- ❌ NUNCA commitar com valores reais

---

### 📂 **src/utils/**
**Propósito:** Biblioteca de funções auxiliares reutilizáveis.

| Arquivo | Conteúdo | Usado por |
|---------|----------|-----------|
| `validation.ts` | Valida integridade de JSONs, percentuais, estruturas | Todos |
| `formatters.ts` | Formata moeda, datas, CPF, CNPJ, telefone | Front-end, API |
| `converters.ts` | Conversões de percentuais, decimais, normalização | Todos |

**Características:**
- ✅ DRY (Don't Repeat Yourself)
- ✅ Funções puras
- ✅ Type-safe
- ✅ Bem testadas

---

### 📂 **public/**
**Propósito:** Configurações que podem ser expostas para front-ends.

| Arquivo | Conteúdo | Visível para |
|---------|----------|--------------|
| `config.json` | Nome do sistema, cores, logos, planos (sem valores), limites | Front-ends |
| `readme.md` | Instruções sobre o que pode ser público | Desenvolvedores |

**Características:**
- ✅ Somente dados não-sensíveis
- ✅ Read-only para front-end
- ✅ Sem credenciais
- ✅ Sem valores monetários exatos

---

### 📄 **src/index.ts**
**Propósito:** Ponto de entrada único que exporta todas as configurações consolidadas.

**Exporta:**
```typescript
ConfigSystem = {
  settings: {
    bonus,        // bonus.json
    planos,       // planos.json
    carreira      // carreira.json
  },
  version: {
    current,      // Versão atual
    changelog,    // Histórico
    getVersion(), // Funções
    isCompatible()
  },
  env: {
    supabase,     // Credenciais Supabase
    walletPay,    // Credenciais WalletPay
    global        // Config global
  },
  utils: {
    validation,   // Validadores
    formatters,   // Formatadores
    converters    // Conversores
  },
  helpers: {
    isProduction(),
    isMaintenanceMode(),
    getGlobalConfig()
  }
}
```

---

## 🔗 Como Usar em Outros Módulos

### **rs-api:**
```typescript
import { ConfigSystem } from 'rs-config';

const bonusPercent = ConfigSystem.settings.bonus.ciclo.percentual;
const cycleBase = ConfigSystem.settings.planos.matriz.valores.cicloCompleto;
```

### **rs-ops:**
```typescript
import { ConfigSystem } from 'rs-config';

const depthLevels = ConfigSystem.settings.planos.fidelidade.alcance.niveis;
const top10Weights = ConfigSystem.settings.bonus.topSigma.top10;
```

### **rs-admin:**
```typescript
import { ConfigSystem } from 'rs-config';

const ranks = ConfigSystem.settings.carreira.graduacoes;
const version = ConfigSystem.version.getVersion();
```

### **Front-ends:**
```typescript
// Importar apenas config pública
import publicConfig from 'rs-config/public/config.json';

const appName = publicConfig.app.name;
const planos = publicConfig.planos;
```

---

## 🚀 Workflow de Atualização

### 1. **Alterar Configuração**
```bash
# Editar arquivo JSON
vim src/settings/bonus.json
```

### 2. **Validar**
```bash
npm run validate
```

### 3. **Atualizar Versão**
```typescript
// version.ts
export const currentVersion = {
  major: 1,
  minor: 1,  // Incrementar
  patch: 0,
  full: '1.1.0',
  // ...
};
```

### 4. **Atualizar Changelog**
```json
{
  "version": "1.1.0",
  "date": "2025-11-07",
  "changes": [
    {
      "category": "update",
      "description": "Atualizado percentual de fidelidade",
      "files": ["bonus.json"]
    }
  ]
}
```

### 5. **Release Notes**
```markdown
## Versão 1.1.0
- Atualizado pool de fidelidade de 1.25% para 1.5%
- Ajustados VMECs dos PINs superiores
```

---

## ✅ Checklist de Validação

Antes de fazer deploy de novas configurações:

- [ ] Todos os campos obrigatórios preenchidos?
- [ ] Soma de percentuais = 48.95%?
- [ ] 13 PINs configurados?
- [ ] Credenciais validadas?
- [ ] Versão incrementada?
- [ ] Changelog atualizado?
- [ ] Release notes escritas?
- [ ] Validação automática passou?
- [ ] Backup da versão anterior?
- [ ] Time notificado?

---

## 🔐 Segurança

### ✅ **Boas Práticas:**
- Nunca commitar credenciais reais
- Usar `.env` para valores sensíveis
- Máscaras em logs
- Validação rigorosa de entrada
- Separação public/private

### ❌ **NÃO FAZER:**
- Expor credenciais em JSON público
- Hardcode de tokens/keys
- Commit de arquivos .env
- Logs com dados sensíveis

---

## 📊 Status dos Arquivos

| Arquivo | Status | Valores |
|---------|--------|---------|
| `bonus.json` | ✅ Estruturado | ⚠️ A preencher |
| `planos.json` | ✅ Estruturado | ⚠️ A preencher |
| `carreira.json` | ✅ Estruturado | ⚠️ A preencher |
| `version.ts` | ✅ Completo | ✅ |
| `changelog.json` | ✅ Completo | ✅ |
| `*.env.ts` | ✅ Templates | ⚠️ Configurar |
| `validation.ts` | ✅ Completo | ✅ |
| `formatters.ts` | ✅ Completo | ✅ |
| `converters.ts` | ✅ Completo | ✅ |
| `index.ts` | ✅ Completo | ✅ |
| `public/config.json` | ✅ Completo | ✅ |

---

## 🎯 Próximos Passos

1. **Preencher valores reais** em `bonus.json`
2. **Configurar PINs** em `carreira.json`
3. **Definir VMECs** para cada graduação
4. **Configurar credenciais** em `env/*.ts`
5. **Criar testes** de validação
6. **Documentar API** de acesso

---

**Versão da Estrutura:** 1.0.0  
**Data:** Novembro 2025  
**Status:** ✅ Estrutura Completa (Aguardando preenchimento de valores)

💛🖤 **RS PRÓLIPSI - Config System**
