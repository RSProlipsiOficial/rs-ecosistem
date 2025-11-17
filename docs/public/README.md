# 📚 RS PRÓLIPSI - Documentação Técnica

**Sistema de Marketing Multinível**  
**Versão:** 1.0.0  
**Data:** Novembro 2025

---

## 🎯 Visão Geral

O RS Prólipsi é um sistema completo de Marketing Multinível baseado na **Matriz SIGME 1x6**, com pools de bonificação, plano de carreira com 13 graduações e sistema de carteira digital integrado.

### Módulos do Ecossistema

| Módulo | Descrição | Tecnologia |
|--------|-----------|------------|
| **rs-api** | API REST principal | Node.js + Express |
| **rs-core** | Banco de dados | Supabase (PostgreSQL) |
| **rs-ops** | Motor operacional | Node.js + CRONs |
| **rs-config** | Sistema de configuração | TypeScript + JSON |
| **rs-walletpay** | Carteira digital | API de pagamentos |
| **rs-admin** | Painel administrativo | React + Next.js |
| **rs-consultor** | Painel do consultor | React + Next.js |
| **rs-marketplace** | Marketplace de produtos | E-commerce |
| **rs-studio** | Comunicação e marketing | CMS |
| **rs-docs** | Documentação | OpenAPI + Markdown |

---

## 💰 Sistema de Bonificação

### Base do Ciclo: R$ 360,00

| Bônus | % | Valor | Descrição |
|-------|---|-------|-----------|
| **Ciclo** | 30% | R$ 108,00 | Pago ao ciclar |
| **Profundidade** | 6.81% | R$ 24,52 | L1-L6 |
| **Fidelidade** | 1.25% | R$ 4,50 | Pool mensal |
| **Top SIGMA** | 4.5% | R$ 16,20 | Top 10 |
| **Carreira** | 6.39% | R$ 23,00 | VME trimestral |
| **TOTAL** | **48.95%** | **R$ 176,22** | |

---

## 📊 Matriz SIGME 1x6

```
           [Você]
      /   /  |  \   \   \
    [1] [2] [3] [4] [5] [6]
```

- **Posições:** 6
- **Ciclo completo:** R$ 360,00
- **Reentrada:** R$ 60,00 (kit ativação)
- **Limite:** 10 reentradas/mês
- **Derramamento:** Linha ascendente

---

## 🏆 Plano de Carreira - 13 PINs

| PIN | Ciclos | Recompensa |
|-----|--------|------------|
| 🥉 Bronze | 5 | R$ 13,50 |
| 🥈 Prata | 15 | R$ 40,50 |
| 🥇 Ouro | 70 | R$ 189,00 |
| 💎 Safira | 150 | R$ 405,00 |
| 💚 Esmeralda | 300 | R$ 810,00 |
| 💛 Topázio | 500 | R$ 1.350,00 |
| ❤️ Rubi | 750 | R$ 2.025,00 |
| 💎 Diamante | 1.500 | R$ 4.050,00 |
| 💎💎 Duplo Diamante | 3.000 | R$ 18.450,00 |
| 💎💎💎 Triplo Diamante | 5.000 | R$ 36.450,00 |
| 🔴💎 Diamante Red | 15.000 | R$ 67.500,00 |
| 🔵💎 Diamante Blue | 25.000 | R$ 105.300,00 |
| ⚫💎 Diamante Black | 50.000 | R$ 135.000,00 |

---

## 🔗 Links Importantes

- [OpenAPI Spec](./openapi.yaml) - Contrato completo da API
- [Rotas](./routes.md) - Documentação de endpoints
- [Schemas](./schemas.md) - Estrutura do banco de dados
- [Glossário](./glossary.md) - Termos técnicos
- [Changelog](./changelog.md) - Histórico de alterações

---

## 🚀 Quick Start

### API Base URL
```
Development: http://localhost:8080
Production: https://api.rsprolipsi.com.br
```

### Autenticação
```http
Authorization: Bearer {token}
```

### Exemplo de Requisição
```bash
curl -X POST https://api.rsprolipsi.com.br/v1/ciclos/fechar \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"consultorId": "123"}'
```

---

## 📞 Suporte

**Email:** suporte@rsprolipsi.com.br  
**Site:** https://rsprolipsi.com.br  
**Documentação:** https://docs.rsprolipsi.com.br

---

💛🖤 **RS PRÓLIPSI - Transformando Vidas!**
