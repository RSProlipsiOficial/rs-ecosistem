# 🔨 BUILD MARKETPLACE E ESCRITÓRIO

**Data:** 07/11/2025 15:15

---

## 🔍 PROBLEMA IDENTIFICADO:

**Tela branca** porque os arquivos não foram buildados!

Os arquivos em `/dist` são **código fonte** (.tsx), não compilados.

---

## ✅ SOLUÇÃO:

### **1. Instalar dependências:**
```bash
cd rs-marketplace/dist
npm install

cd rs-consultor/dist
npm install
```

### **2. Fazer build:**
```bash
cd rs-marketplace/dist
npm run build

cd rs-consultor/dist
npm run build
```

### **3. Deploy:**
```bash
# Marketplace
scp -r dist/* root@72.60.144.245:/var/www/rs-prolipsi/marketplace/

# Escritório
scp -r dist/* root@72.60.144.245:/var/www/rs-prolipsi/escritorio/
```

---

## 📊 STATUS:

- ⏳ Instalando dependências...
- ⏳ Aguardando build...

---

**Processando... 🔄**
