# 🎯 INTEGRAÇÃO CRITERIOSA - ADMIN É A FONTE DA VERDADE

**Data:** 07/11/2025 13:35  
**Princípio:** **ADMIN → API → CONFIG → TODOS OS PAINÉIS**

---

## 📋 ESTRUTURA EXISTENTE CONFIRMADA

### **13 PINs do Plano de Carreira:**

| Código | Nome | Nível | Ciclos | Linhas | VMEC | Recompensa |
|--------|------|-------|--------|--------|------|------------|
| PIN01 | Bronze | 1 | 5 | 0 | [] | R$ 13,50 |
| PIN02 | Prata | 2 | 15 | 1 | [100%] | R$ 40,50 |
| PIN03 | Ouro | 3 | 70 | 1 | [100%] | R$ 189,00 |
| PIN04 | Safira | 4 | 150 | 2 | [60%, 40%] | R$ 405,00 |
| PIN05 | Esmeralda | 5 | 300 | 2 | [60%, 40%] | R$ 810,00 |
| PIN06 | Topázio | 6 | 500 | 2 | [60%, 40%] | R$ 1.350,00 |
| PIN07 | Rubi | 7 | 750 | 3 | [50%, 30%, 20%] | R$ 2.025,00 |
| PIN08 | Diamante | 8 | 1500 | 3 | [50%, 30%, 20%] | R$ 4.050,00 |
| PIN09 | Duplo Diamante | 9 | 3000 | 4 | [40%, 30%, 20%, 10%] | R$ 18.450,00 |
| PIN10 | Triplo Diamante | 10 | 5000 | 5 | [35%, 25%, 20%, 10%, 10%] | R$ 36.450,00 |
| PIN11 | Diamante Red | 11 | 15000 | 6 | [30%, 20%, 18%, 12%, 10%, 10%] | R$ 67.500,00 |
| PIN12 | Diamante Blue | 12 | 25000 | 6 | [30%, 20%, 18%, 12%, 10%, 10%] | R$ 105.300,00 |
| PIN13 | Diamante Black | 13 | 50000 | 6 | [30%, 20%, 18%, 12%, 10%, 10%] | R$ 135.000,00 |

### **Arquivos de Configuração Existentes:**
- ✅ `/rs-config/src/settings/carreira.json` - **FONTE DA VERDADE**
- ✅ `/rs-config/src/utils/careerValidation.ts` - Validações
- ✅ `/rs-api/src/core/rules/careerRules.ts` - Regras da API

---

## 🔗 FLUXO DE INTEGRAÇÃO CRITERIOSA

```
┌─────────────────┐
│  ADMIN PANEL    │ ← Admin edita configuração
└────────┬────────┘
         │
         ↓ PUT /api/admin/career/pins/:id
┌─────────────────┐
│   RS-API        │ ← Valida e salva no banco
└────────┬────────┘
         │
         ↓ Atualiza
┌─────────────────┐
│   RS-CONFIG     │ ← carreira.json é atualizado
└────────┬────────┘
         │
         ↓ Sincroniza
┌─────────────────────────────────────────┐
│  TODOS OS PAINÉIS LEEM A CONFIGURAÇÃO   │
│  - Consultor                            │
│  - WalletPay                            │
│  - Ops                                  │
│  - Docs                                 │
│  - Logística                            │
└─────────────────────────────────────────┘
```

---

## 🎯 REGRAS CRÍTICAS

### **1. ADMIN É A FONTE DA VERDADE**
- ✅ Qualquer mudança no Admin DEVE ser salva na API
- ✅ API DEVE atualizar o `carreira.json` no rs-config
- ✅ Todos os painéis DEVEM ler do rs-config
- ❌ NUNCA editar carreira.json manualmente
- ❌ NUNCA ter configurações duplicadas

### **2. VALIDAÇÕES OBRIGATÓRIAS**
Antes de salvar qualquer mudança:
```typescript
// 1. Validar estrutura
if (pins.length !== 13) {
  throw new Error('Devem existir exatamente 13 PINs');
}

// 2. Validar códigos sequenciais
pins.forEach((pin, index) => {
  if (pin.code !== `PIN${String(index + 1).padStart(2, '0')}`) {
    throw new Error('Códigos de PIN devem ser sequenciais');
  }
});

// 3. Validar VMEC
pins.forEach(pin => {
  const somaVmec = pin.requirements.vmecPercentages.reduce((a, b) => a + b, 0);
  if (somaVmec > 100) {
    throw new Error('Soma dos VMEC não pode exceder 100%');
  }
});

// 4. Validar progressão
pins.forEach((pin, index) => {
  if (index > 0) {
    const prevPin = pins[index - 1];
    if (pin.requirements.minQuarterPoints <= prevPin.requirements.minQuarterPoints) {
      throw new Error('Ciclos devem ser progressivos');
    }
  }
});
```

### **3. CAMPOS IMUTÁVEIS**
Alguns campos NÃO podem ser editados pelo admin:
- ❌ `code` (PIN01, PIN02, etc)
- ❌ `nivel` (1, 2, 3, etc)
- ❌ Estrutura do VMEC (apenas valores)

### **4. CAMPOS EDITÁVEIS**
Admin PODE editar:
- ✅ `label` (Nome do PIN)
- ✅ `requirements.minQuarterPoints` (Ciclos necessários)
- ✅ `requirements.minActiveDirects` (Linhas diretas)
- ✅ `requirements.vmecPercentages` (Percentuais VMEC)
- ✅ `benefits.reward` (Recompensa em R$)
- ✅ `retention.graceQuarters` (Trimestres de graça)
- ✅ Upload de imagem do PIN

---

## 📦 ENDPOINTS NECESSÁRIOS

### **1. Buscar Configuração Atual**
```typescript
GET /api/admin/career/config

Response:
{
  "success": true,
  "config": {
    "pins": [...], // 13 PINs
    "vmec": {...},
    "window": {...},
    "eligibility": {...}
  }
}
```

### **2. Atualizar PIN Individual**
```typescript
PUT /api/admin/career/pins/:pinCode

Body:
{
  "label": "Bronze Premium",
  "requirements": {
    "minQuarterPoints": 10,
    "minActiveDirects": 0,
    "vmecPercentages": []
  },
  "benefits": {
    "reward": 20.00
  }
}

Response:
{
  "success": true,
  "pin": {...},
  "message": "PIN atualizado. carreira.json sincronizado."
}
```

### **3. Upload de Imagem do PIN**
```typescript
POST /api/admin/career/pins/:pinCode/image

Body: FormData com arquivo

Response:
{
  "success": true,
  "image_url": "https://supabase.co/storage/pins/PIN01.png",
  "message": "Imagem salva no Supabase e URL atualizada no config"
}
```

### **4. Validar Configuração**
```typescript
POST /api/admin/career/validate

Body:
{
  "pins": [...] // Configuração a validar
}

Response:
{
  "valid": true,
  "errors": [],
  "warnings": ["Soma VMEC do PIN04 é 100%"]
}
```

### **5. Sincronizar Config**
```typescript
POST /api/admin/career/sync

Response:
{
  "success": true,
  "message": "carreira.json sincronizado com banco de dados",
  "timestamp": "2025-11-07T13:35:00Z"
}
```

---

## 🔄 SINCRONIZAÇÃO AUTOMÁTICA

### **Quando Admin salva:**
1. ✅ API valida os dados
2. ✅ API salva no banco de dados
3. ✅ API atualiza `carreira.json` no rs-config
4. ✅ API dispara webhook para outros serviços
5. ✅ Todos os painéis recebem notificação
6. ✅ Painéis recarregam configuração

### **Implementação:**
```typescript
// No backend (rs-api)
async function updateCareerConfig(pinCode: string, data: any) {
  // 1. Validar
  const validation = validatePinUpdate(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join(', '));
  }
  
  // 2. Salvar no banco
  await db.career_pins.update({ code: pinCode }, data);
  
  // 3. Atualizar carreira.json
  const allPins = await db.career_pins.findAll();
  const configPath = '../rs-config/src/settings/carreira.json';
  const config = JSON.parse(fs.readFileSync(configPath));
  config.pins = allPins;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  // 4. Notificar outros serviços
  await notifyConfigChange('career', pinCode);
  
  return { success: true, pin: data };
}
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### **Tabela: career_pins**
```sql
CREATE TABLE career_pins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- PIN01, PIN02, etc
  label VARCHAR(50) NOT NULL,
  nivel INTEGER NOT NULL,
  min_quarter_points INTEGER NOT NULL,
  min_active_directs INTEGER NOT NULL,
  min_lines_contributing INTEGER NOT NULL,
  vmec_percentages JSONB NOT NULL,
  reward DECIMAL(10,2) NOT NULL,
  badge BOOLEAN DEFAULT true,
  pool_access BOOLEAN DEFAULT false,
  downgrade_if_below BOOLEAN DEFAULT true,
  grace_quarters INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_career_pins_code ON career_pins(code);
CREATE INDEX idx_career_pins_nivel ON career_pins(nivel);
```

### **Tabela: career_config**
```sql
CREATE TABLE career_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(50) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Chaves:
-- 'vmec' → Configurações VMEC
-- 'window' → Configurações de janela trimestral
-- 'eligibility' → Requisitos de elegibilidade
-- 'bonusCarreira' → Configurações de bônus
```

---

## 📝 EXEMPLO DE INTEGRAÇÃO NO ADMIN

### **CareerPlanPage.tsx**
```typescript
import { careerPlanAPI } from '../src/services/api';
import { uploadPinImage } from '../src/services/supabase';
import { useState, useEffect } from 'react';

const CareerPlanPage = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingPin, setEditingPin] = useState(null);

  // Carregar PINs
  useEffect(() => {
    loadPins();
  }, []);

  const loadPins = async () => {
    try {
      const response = await careerPlanAPI.getAllPins();
      setPins(response.data.pins);
    } catch (error) {
      console.error('Erro ao carregar PINs:', error);
    }
  };

  // Editar PIN
  const handleEditPin = async (pinCode, data) => {
    try {
      setLoading(true);
      
      // Validar antes de enviar
      if (data.requirements.minQuarterPoints <= 0) {
        alert('Ciclos devem ser maior que 0');
        return;
      }
      
      // Atualizar PIN
      await careerPlanAPI.updatePin(pinCode, data);
      
      alert('PIN atualizado com sucesso!');
      loadPins(); // Recarregar
    } catch (error) {
      alert('Erro ao atualizar PIN: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Upload de imagem
  const handleUploadImage = async (pinCode, file) => {
    try {
      setLoading(true);
      
      // Upload para Supabase
      const imageUrl = await uploadPinImage(file, pinCode);
      
      // Atualizar PIN com URL
      await careerPlanAPI.updatePin(pinCode, { image_url: imageUrl });
      
      alert('Imagem atualizada!');
      loadPins();
    } catch (error) {
      alert('Erro ao fazer upload: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Plano de Carreira - 13 PINs</h1>
      
      {pins.map(pin => (
        <div key={pin.code}>
          <h3>{pin.label} ({pin.code})</h3>
          <p>Ciclos: {pin.requirements.minQuarterPoints}</p>
          <p>Linhas: {pin.requirements.minActiveDirects}</p>
          <p>VMEC: {pin.requirements.vmecPercentages.join(', ')}%</p>
          <p>Recompensa: R$ {pin.benefits.reward}</p>
          
          <button onClick={() => setEditingPin(pin)}>
            Editar
          </button>
          
          <input 
            type="file" 
            onChange={(e) => handleUploadImage(pin.code, e.target.files[0])}
          />
        </div>
      ))}
    </div>
  );
};
```

---

## ✅ CHECKLIST DE INTEGRAÇÃO

### **Backend (rs-api):**
- [ ] Criar endpoints de carreira
- [ ] Implementar validações
- [ ] Sincronizar com carreira.json
- [ ] Criar webhooks de notificação
- [ ] Testar com 13 PINs

### **Admin Panel:**
- [ ] Integrar CareerPlanPage.tsx
- [ ] Adicionar formulários de edição
- [ ] Implementar upload de imagens
- [ ] Adicionar validações no frontend
- [ ] Testar sincronização

### **Outros Painéis:**
- [ ] Consultor lê de carreira.json
- [ ] WalletPay lê de carreira.json
- [ ] Ops lê de carreira.json
- [ ] Docs lê de carreira.json

---

## 🚨 REGRAS DE OURO

1. **ADMIN É A FONTE DA VERDADE** - Sempre!
2. **VALIDAR ANTES DE SALVAR** - Sempre!
3. **SINCRONIZAR COM carreira.json** - Sempre!
4. **NOTIFICAR OUTROS SERVIÇOS** - Sempre!
5. **13 PINs SEMPRE** - Nunca mais, nunca menos!

---

**Documento criado em:** 07/11/2025 13:35  
**Status:** 🎯 PRONTO PARA IMPLEMENTAÇÃO
