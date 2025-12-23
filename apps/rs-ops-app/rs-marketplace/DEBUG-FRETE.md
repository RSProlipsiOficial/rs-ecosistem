# Debug - Problema de Frete no Checkout Pro

## 🔍 Problema Reportado
"ESTA IGUAL O MESMO ERRO" - As opções de frete não estão aparecendo mesmo após preencher todos os campos.

## ✅ Correções Aplicadas

### 1. **Fallback de Frete Implementado**
**Arquivo:** `checkout-pro-rs-prólipsi/services/api.ts` (linhas 68-105)

**Problema:** A função `getShippingQuotes` retornava array vazio quando não havia token do Melhor Envio.

**Solução:** Adicionado fallback com 3 opções simuladas:
- PAC - Correios: R$ 18,50 (8 dias úteis) - Melhor Preço
- SEDEX - Correios: R$ 32,90 (3 dias úteis) - Mais Rápido
- JADLOG Econômico: R$ 22,00 (6 dias úteis)

### 2. **Auto-carregamento de Frete**
**Arquivo:** `checkout-pro-rs-prólipsi/components/IdentificationStep.tsx` (linhas 44-51)

**Adicionado:** `useEffect` que dispara busca de frete automaticamente quando:
- Produto é físico
- CEP está preenchido (8 dígitos)
- Endereço já foi carregado
- Ainda não há opções de frete

### 3. **Feedback Visual de Loading**
**Arquivo:** `checkout-pro-rs-prólipsi/components/IdentificationStep.tsx` (linhas 255-259)

**Adicionado:** Mensagem "Calculando opções de frete..." enquanto carrega.

## 🧪 Como Testar

### Passo 1: Abrir Console do Navegador
1. Pressione `F12` no Chrome
2. Vá para a aba **Console**
3. Procure por mensagens:
   - ✅ `"Melhor Envio token not configured. Using fallback shipping quotes."`
   - ❌ Erros relacionados a `fetchShippingQuotes`

### Passo 2: Verificar Estado do React
1. Instale a extensão **React Developer Tools**
2. Vá para a aba **Components**
3. Procure por `IdentificationStep`
4. Verifique o estado:
   - `shippingQuotes`: deve ter 3 itens após preencher CEP
   - `isPhysical`: deve ser `true`
   - `zipCode`: deve ter o CEP preenchido
   - `address.zipCode`: deve ter o CEP sem máscara

### Passo 3: Verificar Chamada da API
1. Vá para a aba **Network** (Rede)
2. Filtre por `calculate` ou `viacep`
3. Verifique se há chamadas sendo feitas
4. Se houver erro 401/403 no Melhor Envio, é normal (fallback será usado)

### Passo 4: Forçar Reload
1. Pressione `Ctrl+Shift+R` (hard reload)
2. Limpe o cache: `Ctrl+Shift+Delete`
3. Recarregue a página

## 🐛 Possíveis Causas do Problema

### Causa 1: Cache do Navegador
**Sintoma:** Código antigo ainda está rodando
**Solução:** Hard reload (`Ctrl+Shift+R`)

### Causa 2: Hot Module Replacement (HMR) Falhou
**Sintoma:** Vite não atualizou o módulo
**Solução:** Parar o servidor (`Ctrl+C`) e rodar `pnpm dev` novamente

### Causa 3: Produto Não é Físico
**Sintoma:** Seção de frete não aparece
**Verificação:** 
```tsx
// No console do navegador:
console.log(product.type); // Deve ser 'PHYSICAL'
```

### Causa 4: CEP Não Está Sendo Reconhecido
**Sintoma:** `useEffect` não dispara
**Verificação:**
```tsx
// Adicione console.log temporário em IdentificationStep.tsx linha 44:
React.useEffect(() => {
  console.log('🔍 Debug Frete:', { 
    isPhysical, 
    zipCode, 
    addressZipCode: address.zipCode, 
    quotesLength: shippingQuotes.length 
  });
  // ... resto do código
}, [isPhysical, zipCode, address.zipCode, shippingQuotes.length, fetchShippingQuotes]);
```

### Causa 5: Erro no CheckoutContext
**Sintoma:** `fetchShippingQuotes` não está definido
**Verificação:**
```tsx
// No console do navegador:
console.log(typeof fetchShippingQuotes); // Deve ser 'function'
```

## 🔧 Solução Rápida (Teste Manual)

Se o auto-carregamento não funcionar, você pode forçar manualmente:

1. Abra o console do navegador (`F12`)
2. Cole este código:
```javascript
// Simular clique no campo CEP para disparar busca
const cepInput = document.querySelector('input[placeholder="00000-000"]');
if (cepInput) {
  cepInput.focus();
  cepInput.blur();
}
```

## 📊 Checklist de Validação

- [ ] Console mostra: "Melhor Envio token not configured. Using fallback shipping quotes."
- [ ] Seção "Opções de Envio" aparece após preencher CEP
- [ ] 3 opções de frete aparecem (PAC, SEDEX, JADLOG)
- [ ] Ao clicar em uma opção, ela fica destacada em dourado
- [ ] Mensagem de erro desaparece após selecionar frete
- [ ] Botão "Continuar para Pagamento" funciona

## 🚨 Se Ainda Não Funcionar

Execute estes comandos no terminal:

```bash
# Parar o servidor
Ctrl+C

# Limpar cache do Vite
rm -rf node_modules/.vite

# Reinstalar dependências (se necessário)
pnpm install

# Rodar novamente
pnpm dev
```

## 📝 Logs Esperados no Console

```
🔍 Debug Frete: {
  isPhysical: true,
  zipCode: "83310-456",
  addressZipCode: "83310456",
  quotesLength: 0
}

⚠️ Melhor Envio token not configured. Using fallback shipping quotes.

✅ Shipping quotes loaded: 3 options
```

## 🎯 Próximos Passos

1. Abra o console do navegador
2. Recarregue a página
3. Vá para o checkout
4. Preencha o CEP
5. Copie e cole aqui TODOS os logs do console
6. Tire um print da aba **Components** do React DevTools mostrando o estado do `IdentificationStep`

Isso m