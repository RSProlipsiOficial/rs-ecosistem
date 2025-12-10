# 🔧 PATCH DE INTEGRAÇÕES - TODAS AS PÁGINAS

Este documento contém as alterações necessárias para integrar todas as páginas com a API.

---

## 📄 PÁGINAS A INTEGRAR

### 1. **Transactions.tsx**
Adicionar no início:
```typescript
import { walletAPI } from '../src/services/api';
import { useEffect } from 'react';
```

Adicionar estados:
```typescript
const [loading, setLoading] = useState(false);
const [apiTransactions, setApiTransactions] = useState<LedgerEntry[]>([]);
```

Adicionar useEffect:
```typescript
useEffect(() => {
    const loadTransactions = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId') || 'demo-user';
            const response = await walletAPI.getTransactions(userId);
            
            if (response.data.success) {
                setApiTransactions(response.data.transactions);
            }
        } catch (error) {
            console.error('Erro ao carregar transações:', error);
        } finally {
            setLoading(false);
        }
    };
    
    loadTransactions();
}, []);
```

---

### 2. **Saques.tsx**
Adicionar:
```typescript
import { walletAPI } from '../src/services/api';

const handleWithdraw = async (data) => {
    try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        
        const response = await walletAPI.requestWithdraw({
            user_id: userId,
            amount: data.amount * 100, // Converter para centavos
            method: data.method,
            pix_key: data.pixKey
        });
        
        if (response.data.success) {
            alert('Saque solicitado com sucesso!');
            // Recarregar lista
        }
    } catch (error) {
        alert('Erro ao solicitar saque');
    } finally {
        setLoading(false);
    }
};
```

---

### 3. **MyNetwork.tsx**
Adicionar:
```typescript
import { sigmaAPI } from '../src/services/api';

useEffect(() => {
    const loadNetwork = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const [networkRes, statsRes] = await Promise.all([
                sigmaAPI.getNetwork(userId),
                sigmaAPI.getStats(userId)
            ]);
            
            if (networkRes.data.success) {
                setNetworkData(networkRes.data.network);
            }
            
            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
            }
        } catch (error) {
            console.error('Erro ao carregar rede:', error);
        }
    };
    
    loadNetwork();
}, []);
```

---

### 4. **Settings.tsx**
Adicionar:
```typescript
import { walletAPI } from '../src/services/api';

// Carregar chaves PIX
useEffect(() => {
    const loadPixKeys = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await walletAPI.listPixKeys(userId);
            
            if (response.data.success) {
                setPixKeys(response.data.pix_keys);
            }
        } catch (error) {
            console.error('Erro ao carregar chaves PIX:', error);
        }
    };
    
    loadPixKeys();
}, []);

// Criar nova chave PIX
const handleCreatePixKey = async (data) => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await walletAPI.createPixKey({
            user_id: userId,
            key_type: data.type,
            key_value: data.value
        });
        
        if (response.data.success) {
            alert('Chave PIX cadastrada!');
            // Recarregar lista
        }
    } catch (error) {
        alert('Erro ao cadastrar chave PIX');
    }
};
```

---

### 5. **Reports.tsx**
Adicionar:
```typescript
import { walletAPI, sigmaAPI, careerAPI } from '../src/services/api';

useEffect(() => {
    const loadReports = async () => {
        try {
            const userId = localStorage.getItem('userId');
            
            const [statementRes, statsRes, bonusRes] = await Promise.all([
                walletAPI.getStatement(userId, startDate, endDate),
                sigmaAPI.getStats(userId),
                careerAPI.getCareerBonus(userId)
            ]);
            
            if (statementRes.data.success) {
                setStatement(statementRes.data.statement);
            }
            
            if (statsRes.data.success) {
                setNetworkStats(statsRes.data.stats);
            }
            
            if (bonusRes.data.success) {
                setBonusData(bonusRes.data.bonus);
            }
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
        }
    };
    
    loadReports();
}, [startDate, endDate]);
```

---

### 6. **SalesHub.tsx**
Adicionar:
```typescript
import { marketplaceAPI } from '../src/services/api';

useEffect(() => {
    const loadSales = async () => {
        try {
            const userId = localStorage.getItem('userId');
            
            const [salesRes, commissionRes] = await Promise.all([
                marketplaceAPI.getUserOrders(userId),
                marketplaceAPI.getCommissions(userId)
            ]);
            
            if (salesRes.data.success) {
                setSales(salesRes.data.orders);
            }
            
            if (commissionRes.data.success) {
                setCommissions(commissionRes.data.commissions);
            }
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
        }
    };
    
    loadSales();
}, []);
```

---

### 7. **MarketingHub.tsx**
Adicionar:
```typescript
import { marketplaceAPI, studioAPI } from '../src/services/api';

// Gerar link de afiliado
const handleGenerateLink = async (productId) => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await marketplaceAPI.generateAffiliateLink({
            user_id: userId,
            product_id: productId
        });
        
        if (response.data.success) {
            setAffiliateLink(response.data.link);
        }
    } catch (error) {
        console.error('Erro ao gerar link:', error);
    }
};

// Gerar conteúdo com IA
const handleGenerateContent = async (prompt) => {
    try {
        const userId = localStorage.getItem('userId');
        const response = await studioAPI.generateImage({
            user_id: userId,
            prompt: prompt
        });
        
        if (response.data.success) {
            setGeneratedImage(response.data.image_url);
        }
    } catch (error) {
        console.error('Erro ao gerar conteúdo:', error);
    }
};
```

---

### 8. **Cards.tsx**
Adicionar:
```typescript
import { walletAPI } from '../src/services/api';

useEffect(() => {
    const loadCards = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const response = await walletAPI.getCards(userId);
            
            if (response.data.success) {
                setCards(response.data.cards);
            }
        } catch (error) {
            console.error('Erro ao carregar cartões:', error);
            // Usar dados mock como fallback
        }
    };
    
    loadCards();
}, []);
```

---

## 🎯 ESTRATÉGIA DE IMPLEMENTAÇÃO

### **Padrão para TODAS as páginas:**

```typescript
// 1. Imports
import { walletAPI, sigmaAPI, careerAPI, marketplaceAPI, studioAPI } from '../src/services/api';
import { useEffect, useState } from 'react';

// 2. Estados
const [loading, setLoading] = useState(false);
const [apiData, setApiData] = useState(null);
const [error, setError] = useState('');

// 3. useEffect para carregar dados
useEffect(() => {
    const loadData = async () => {
        try {
            setLoading(true);
            const userId = localStorage.getItem('userId') || 'demo-user';
            
            const response = await API_CALL(userId);
            
            if (response?.data?.success) {
                setApiData(response.data.DATA);
            }
        } catch (err) {
            console.error('Erro:', err);
            setError('Erro ao carregar dados');
            // Usar mock como fallback
        } finally {
            setLoading(false);
        }
    };
    
    loadData();
}, []);

// 4. Usar apiData se disponível, senão usar MOCK
const displayData = apiData || MOCK_DATA;
```

---

## ✅ CHECKLIST DE INTEGRAÇÃO

- [ ] Transactions.tsx
- [ ] Saques.tsx
- [ ] Transferencias.tsx
- [ ] MyNetwork.tsx
- [ ] Settings.tsx
- [ ] Reports.tsx
- [ ] SalesHub.tsx
- [ ] MarketingHub.tsx
- [ ] Cards.tsx
- [ ] PointOfSale.tsx

---

## 🚀 APÓS INTEGRAR TUDO

1. Testar cada página
2. Verificar fallbacks
3. Build de produção
4. Deploy no servidor

---

**Documento criado em:** 07/11/2025 10:52
