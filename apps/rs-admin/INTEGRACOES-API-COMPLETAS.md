# 🔗 INTEGRAÇÕES API - PAINEL ADMIN

**Data:** 07/11/2025 13:30  
**Versão:** 1.0.0  
**Status:** 🚧 EM DESENVOLVIMENTO

---

## 🎯 OBJETIVO

Conectar TODAS as configurações do Painel Admin com a API para que:
- ✅ Configurações SIGMA sejam salvas e aplicadas em tempo real
- ✅ Plano de Carreira (PINs) seja totalmente funcional
- ✅ Upload de imagens funcione (Supabase Storage)
- ✅ Todas as mudanças no admin reflitam nos outros painéis
- ✅ Sincronização entre Admin, Consultor e WalletPay

---

## 📦 ARQUIVOS CRIADOS

### **1. `/src/services/api.ts`**
API Service completo com **TODOS** os endpoints necessários:
- 🔐 Auth API (3 endpoints)
- 👥 Consultants API (6 endpoints)
- ⚙️ SIGMA Config API (9 endpoints)
- 🎯 Career Plan API (10 endpoints)
- 🏪 Marketplace API (12 endpoints)
- 🚚 Logistics API (8 endpoints)
- 💰 Wallet API (10 endpoints)
- 💬 Communication API (6 endpoints)
- ⚙️ Settings API (5 endpoints)
- 📤 Upload API (5 endpoints)
- 📊 Reports API (5 endpoints)

**TOTAL: 79 ENDPOINTS PRONTOS!**

### **2. `/src/services/supabase.ts`**
Serviço de upload de arquivos no Supabase Storage:
- Upload genérico
- Upload de imagens de PINs
- Upload de avatares
- Upload de imagens de produtos
- Deletar arquivos
- Listar arquivos
- Criar buckets automaticamente

### **3. `/src/vite-env.d.ts`**
Tipos TypeScript para variáveis de ambiente

---

## 🔗 ENDPOINTS POR MÓDULO

### **⚙️ CONFIGURAÇÕES SIGMA**

#### **Matriz SIGMA:**
```typescript
GET    /api/admin/sigma/matrix/config
PUT    /api/admin/sigma/matrix/config
```

**Exemplo de uso:**
```typescript
import { sigmaConfigAPI } from './src/services/api';

// Buscar configuração atual
const config = await sigmaConfigAPI.getMatrixConfig();

// Atualizar configuração
await sigmaConfigAPI.updateMatrixConfig({
  matrix_size: 3,
  entry_fee: 5000, // R$ 50,00 em centavos
  bonus_per_cycle: 15000, // R$ 150,00
  max_depth: 10,
  auto_reentry: true,
});
```

#### **Top SIGMA:**
```typescript
GET    /api/admin/sigma/top/config
PUT    /api/admin/sigma/top/config
```

#### **Bônus Fidelidade:**
```typescript
GET    /api/admin/sigma/fidelity/config
PUT    /api/admin/sigma/fidelity/config
```

#### **Ciclos:**
```typescript
GET    /api/admin/sigma/cycles
POST   /api/admin/sigma/cycles
POST   /api/admin/sigma/cycles/:id/close
```

---

### **🎯 PLANO DE CARREIRA (PINs)**

#### **Gerenciar PINs:**
```typescript
GET    /api/admin/career/pins
GET    /api/admin/career/pins/:id
POST   /api/admin/career/pins
PUT    /api/admin/career/pins/:id
DELETE /api/admin/career/pins/:id
```

**Exemplo - Criar PIN:**
```typescript
import { careerPlanAPI } from './src/services/api';

const newPin = await careerPlanAPI.createPin({
  name: 'Bronze',
  level: 1,
  color: '#CD7F32',
  requirements: {
    direct_consultants: 3,
    network_volume: 100000, // R$ 1.000,00
    personal_sales: 50000,
  },
  bonuses: {
    direct_bonus: 10, // 10%
    indirect_bonus: 5, // 5%
    leadership_bonus: 2000, // R$ 20,00
  },
  image_url: null,
});
```

#### **Upload de Imagem do PIN:**
```typescript
POST   /api/admin/career/pins/:id/image
```

**Exemplo - Upload:**
```typescript
import { uploadPinImage } from './src/services/supabase';

// Método 1: Via Supabase direto
const imageUrl = await uploadPinImage(file, pinId);

// Método 2: Via API
const response = await careerPlanAPI.uploadPinImage(pinId, file);
const imageUrl = response.data.image_url;
```

#### **Requisitos e Bônus:**
```typescript
GET    /api/admin/career/pins/:id/requirements
PUT    /api/admin/career/pins/:id/requirements
GET    /api/admin/career/pins/:id/bonuses
PUT    /api/admin/career/pins/:id/bonuses
```

---

### **📤 UPLOAD DE IMAGENS**

#### **Supabase Storage - Buckets:**
- `pins` - Imagens dos PINs
- `avatars` - Avatares dos consultores
- `products` - Imagens de produtos
- `documents` - Documentos
- `banners` - Banners promocionais
- `logos` - Logos

#### **Como usar:**
```typescript
import { uploadFile, uploadPinImage, uploadAvatar } from './src/services/supabase';

// Upload genérico
const url = await uploadFile(file, 'pins', 'bronze');

// Upload de PIN
const pinImageUrl = await uploadPinImage(file, 'pin-bronze-123');

// Upload de avatar
const avatarUrl = await uploadAvatar(file, 'user-123');
```

---

### **🏪 MARKETPLACE**

#### **Produtos:**
```typescript
GET    /api/admin/marketplace/products
GET    /api/admin/marketplace/products/:id
POST   /api/admin/marketplace/products
PUT    /api/admin/marketplace/products/:id
DELETE /api/admin/marketplace/products/:id
POST   /api/admin/marketplace/products/:id/image
```

#### **Pedidos:**
```typescript
GET    /api/admin/marketplace/orders
GET    /api/admin/marketplace/orders/:id
PATCH  /api/admin/marketplace/orders/:id/status
```

#### **Configurações:**
```typescript
GET    /api/admin/marketplace/config
PUT    /api/admin/marketplace/config
```

---

### **🚚 LOGÍSTICA (CDs)**

```typescript
GET    /api/admin/logistics/cds
POST   /api/admin/logistics/cds
PUT    /api/admin/logistics/cds/:id
DELETE /api/admin/logistics/cds/:id
GET    /api/admin/logistics/cds/:id/stock
PUT    /api/admin/logistics/cds/:id/stock
```

---

### **💰 WALLETPAY**

```typescript
GET    /api/admin/wallet/dashboard
GET    /api/admin/wallet/transactions
GET    /api/admin/wallet/withdrawals
POST   /api/admin/wallet/withdrawals/:id/approve
POST   /api/admin/wallet/withdrawals/:id/reject
GET    /api/admin/wallet/config
PUT    /api/admin/wallet/config
```

---

### **⚙️ CONFIGURAÇÕES GERAIS**

```typescript
GET    /api/admin/settings
GET    /api/admin/settings/:key
PUT    /api/admin/settings/:key
GET    /api/admin/settings/system
GET    /api/admin/settings/logs
```

---

## 🔄 FLUXO DE INTEGRAÇÃO

### **1. Configurações SIGMA**

```mermaid
Admin Panel → API → Database → Consultor Panel
```

**Quando admin edita:**
1. Admin clica em "Salvar" na Matriz SIGMA
2. Frontend chama `sigmaConfigAPI.updateMatrixConfig(data)`
3. API salva no banco de dados
4. Painel do Consultor busca config atualizada
5. Mudanças aplicadas em tempo real

### **2. Plano de Carreira (PINs)**

```mermaid
Admin Panel → Upload Supabase → API → Database → Consultor Panel
```

**Quando admin cria/edita PIN:**
1. Admin preenche formulário do PIN
2. Admin faz upload da imagem
3. Imagem vai para Supabase Storage
4. URL da imagem é salva no banco
5. Consultor vê PIN atualizado com imagem

### **3. Upload de Imagens**

```mermaid
Admin Panel → Supabase Storage → URL Pública → Database
```

**Fluxo:**
1. Admin seleciona arquivo
2. Frontend faz upload para Supabase
3. Supabase retorna URL pública
4. URL é salva no banco de dados
5. Imagem fica acessível publicamente

---

## 🛠️ COMO INTEGRAR CADA PÁGINA

### **MatrixSettingsPage.tsx**

```typescript
import { sigmaConfigAPI } from '../src/services/api';
import { useState, useEffect } from 'react';

const MatrixSettingsPage = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar configuração
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await sigmaConfigAPI.getMatrixConfig();
        setConfig(response.data.config);
      } catch (error) {
        console.error('Erro ao carregar config:', error);
      }
    };
    loadConfig();
  }, []);

  // Salvar configuração
  const handleSave = async (data) => {
    try {
      setLoading(true);
      await sigmaConfigAPI.updateMatrixConfig(data);
      alert('Configuração salva com sucesso!');
    } catch (error) {
      alert('Erro ao salvar configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX
  );
};
```

### **CareerPlanPage.tsx**

```typescript
import { careerPlanAPI } from '../src/services/api';
import { uploadPinImage } from '../src/services/supabase';

const CareerPlanPage = () => {
  const [pins, setPins] = useState([]);

  // Carregar PINs
  useEffect(() => {
    const loadPins = async () => {
      const response = await careerPlanAPI.getAllPins();
      setPins(response.data.pins);
    };
    loadPins();
  }, []);

  // Criar PIN com imagem
  const handleCreatePin = async (data, imageFile) => {
    try {
      // 1. Criar PIN
      const response = await careerPlanAPI.createPin(data);
      const pinId = response.data.pin.id;

      // 2. Upload da imagem
      if (imageFile) {
        const imageUrl = await uploadPinImage(imageFile, pinId);
        
        // 3. Atualizar PIN com URL da imagem
        await careerPlanAPI.updatePin(pinId, { image_url: imageUrl });
      }

      alert('PIN criado com sucesso!');
      // Recarregar lista
    } catch (error) {
      alert('Erro ao criar PIN');
    }
  };

  return (
    // ... JSX
  );
};
```

---

## 📋 CHECKLIST DE INTEGRAÇÃO

### **Configurações SIGMA:**
- [ ] MatrixSettingsPage.tsx
- [ ] SigmeSettingsPage.tsx (Top SIGMA)
- [ ] FidelityBonusPage.tsx

### **Plano de Carreira:**
- [ ] CareerPlanPage.tsx (Tabela de PINs)
- [ ] CareerReportsPage.tsx

### **Marketplace:**
- [ ] MarketplaceProductsPage.tsx
- [ ] MarketplaceOrdersPage.tsx
- [ ] MarketplaceInvoicesPage.tsx
- [ ] MarketplaceSettingsPage.tsx

### **Logística:**
- [ ] ManageCDsPage.tsx
- [ ] CDStorePage.tsx
- [ ] CDReportsPage.tsx

### **WalletPay:**
- [ ] WalletDashboard.tsx
- [ ] WalletStatementPage.tsx
- [ ] WalletTransfersPage.tsx
- [ ] WalletSettingsPage.tsx

### **Outros:**
- [ ] ConsultantsPage.tsx
- [ ] CommunicationCenterPage.tsx
- [ ] SettingsPage.tsx

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ API Service criado
2. ✅ Supabase Service criado
3. ⏳ Integrar páginas principais
4. ⏳ Testar uploads
5. ⏳ Testar sincronização
6. ⏳ Deploy

---

**Documento criado em:** 07/11/2025 13:30
