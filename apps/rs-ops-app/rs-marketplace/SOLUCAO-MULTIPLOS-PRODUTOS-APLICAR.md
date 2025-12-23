# SOLUÇÃO: Checkout com Múltiplos Produtos - APLICAR MANUALMENTE

## 🎯 OBJETIVO
Fazer o checkout processar TODOS os produtos do carrinho de uma vez, com soma total correta.

---

## 📝 PASSO 1: Modificar `App.tsx` (Marketplace)

**Arquivo:** `G:\Rs  Ecosystem\rs-ecosystem\apps\rs-marketplace\Marketplace\App.tsx`

**Localizar linha 1228** e **SUBSTITUIR:**

```tsx
// ANTES (ERRADO):
if (view === 'checkout') {
    const mainProductId = cart[0]?.productId || selectedProduct?.id;
    return (
        <>
            <style>{storeCustomization.customCss}</style>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-gold-400">Carregando Checkout...</div>}>
                <CheckoutProvider productId={mainProductId} orderBump={{
                    id: storeCustomization.orderBump?.id ?? 'default-bump',
                    name: storeCustomization.orderBump?.name ?? 'Oferta Especial',
                    price: storeCustomization.orderBump?.price ?? 0,
                    image: storeCustomization.orderBump?.image ?? ''
                }}>
                    <CheckoutProApp />
                </CheckoutProvider>
            </Suspense>
        </>
    )
}
```

**POR (CORRETO):**

```tsx
if (view === 'checkout') {
    const mainProductId = cart[0]?.productId || selectedProduct?.id;
    const cartItemsForCheckout = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        variantId: item.variantId,
        price: item.price
    }));
    
    return (
        <>
            <style>{storeCustomization.customCss}</style>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-900 text-gold-400">Carregando Checkout...</div>}>
                <CheckoutProvider 
                    productId={mainProductId} 
                    cartItems={cartItemsForCheckout}
                    orderBump={{
                        id: storeCustomization.orderBump?.id ?? 'default-bump',
                        name: storeCustomization.orderBump?.name ?? 'Oferta Especial',
                        price: storeCustomization.orderBump?.price ?? 0,
                        image: storeCustomization.orderBump?.image ?? ''
                    }}
                >
                    <CheckoutProApp />
                </CheckoutProvider>
            </Suspense>
        </>
    )
}
```

---

## 📝 PASSO 2: Modificar `CheckoutContext.tsx`

**Arquivo:** `G:\Rs  Ecosystem\rs-ecosystem\apps\rs-marketplace\Marketplace\checkout-pro-rs-prólipsi\context\CheckoutContext.tsx`

### 2.1: Adicionar interface CartItem (linha 23)

**ADICIONAR ANTES de `interface CheckoutProviderProps`:**

```tsx
interface CartItem {
  productId: string;
  quantity: number;
  variantId?: string;
  price: number;
}
```

### 2.2: Atualizar CheckoutProviderProps (linha 29)

**SUBSTITUIR:**

```tsx
// ANTES:
interface CheckoutProviderProps {
  children: ReactNode;
  productId?: string;
  orderBump?: OrderBump | null;
  initialQuantity?: number;
}
```

**POR:**

```tsx
interface CheckoutProviderProps {
  children: ReactNode;
  productId?: string;
  cartItems?: CartItem[];
  orderBump?: OrderBump | null;
  initialQuantity?: number;
}
```

### 2.3: Atualizar o Provider (linha 39)

**SUBSTITUIR:**

```tsx
// ANTES:
export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
  children,
  productId,
  orderBump = null,
  initialQuantity = INITIAL_QUANTITY
}) => {
  const [step, setStepState] = useState<CheckoutStep>(CheckoutStep.IDENTIFICATION);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity] = useState(initialQuantity);
```

**POR:**

```tsx
export const CheckoutProvider: React.FC<CheckoutProviderProps> = ({
  children,
  productId,
  cartItems = [],
  orderBump = null,
  initialQuantity = INITIAL_QUANTITY
}) => {
  const [step, setStepState] = useState<CheckoutStep>(CheckoutStep.IDENTIFICATION);
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Array<{product: Product, quantity: number, price: number}>>([]);
  const [quantity] = useState(initialQuantity);
```

### 2.4: Adicionar useEffect para carregar múltiplos produtos (após linha 60)

**ADICIONAR APÓS o useEffect que carrega o produto principal:**

```tsx
// Load all cart products
useEffect(() => {
  const loadCartProducts = async () => {
    if (cartItems.length > 0) {
      const loadedProducts = await Promise.all(
        cartItems.map(async (item) => {
          const prod = await getProductById(item.productId);
          return prod ? { product: prod, quantity: item.quantity, price: item.price } : null;
        })
      );
      setProducts(loadedProducts.filter(p => p !== null) as Array<{product: Product, quantity: number, price: number}>);
    }
  };
  loadCartProducts();
}, [cartItems]);
```

### 2.5: Atualizar cálculo do subtotal (linha 111)

**SUBSTITUIR:**

```tsx
// ANTES:
const subtotal = (product?.price || 0) * quantity;
```

**POR:**

```tsx
const subtotal = products.length > 0
  ? products.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  : (product?.price || 0) * quantity;
```

---

## 📝 PASSO 3: Atualizar Summary.tsx para mostrar múltiplos produtos

**Arquivo:** `G:\Rs  Ecosystem\rs-ecosystem\apps\rs-marketplace\Marketplace\checkout-pro-rs-prólipsi\components\Summary.tsx`

**Localizar linha 90** (dentro do componente OrderSummaryCard) e **SUBSTITUIR:**

```tsx
// ANTES (mostra apenas 1 produto):
<div className="flex gap-4 items-start">
  <div className="relative w-16 h-16 flex-shrink-0">
    <img src={imageUrl} alt={title} className="w-full h-full rounded-lg object-cover border border-rs-border shadow-sm" />
  </div>
  <div className="flex-1 min-w-0">
    <h4 className="font-semibold text-rs-text text-sm leading-tight mb-1 line-clamp-2">{title}</h4>
    <p className="text-xs text-rs-muted line-clamp-2 mb-2">{description}</p>
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold border tracking-wider uppercase ${isDigital ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
      {isDigital ? 'PRODUTO DIGITAL' : 'PRODUTO FÍSICO'}
    </span>
  </div>
</div>
```

**POR (mostra todos os produtos do carrinho):**

```tsx
<div className="space-y-3">
  {orderSummary.cartItems?.map((item, index) => (
    <div key={index} className="flex gap-3 items-start pb-3 border-b border-rs-border/30 last:border-0 last:pb-0">
      <div className="relative w-12 h-12 flex-shrink-0">
        <img src={item.image} alt={item.name} className="w-full h-full rounded-lg object-cover border border-rs-border shadow-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-rs-text text-xs leading-tight mb-0.5">{item.name}</h4>
        <p className="text-[10px] text-rs-muted">Qtd: {item.quantity}</p>
      </div>
      <span className="text-xs font-mono font-bold text-rs-text whitespace-nowrap">
        R$ {(item.price * item.quantity).toFixed(2)}
      </span>
    </div>
  )) || (
    <div className="flex gap-4 items-start">
      <div className="relative w-16 h-16 flex-shrink-0">
        <img src={imageUrl} alt={title} className="w-full h-full rounded-lg object-cover border border-rs-border shadow-sm" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-rs-text text-sm leading-tight mb-1 line-clamp-2">{title}</h4>
        <p className="text-xs text-rs-muted line-clamp-2 mb-2">{description}</p>
        <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-bold border tracking-wider uppercase ${isDigital ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
          {isDigital ? 'PRODUTO DIGITAL' : 'PRODUTO FÍSICO'}
        </span>
      </div>
    </div>
  )}
</div>
```

---

## 📝 PASSO 4: Atualizar tipos (OrderSummary)

**Arquivo:** `G:\Rs  Ecosystem\rs-ecosystem\apps\rs-marketplace\Marketplace\checkout-pro-rs-prólipsi\types.ts`

**Localizar a interface `OrderSummary`** e **ADICIONAR:**

```tsx
export interface OrderSummary {
  subtotal: number;
  shipping: number;
  orderBump: number;
  discount: number;
  balanceUsed: number;
  total: number;
  sigmaPoints: number;
  quantity: number;
  cartItems?: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}
```

---

## 📝 PASSO 5: Atualizar orderSummary no CheckoutContext

**Arquivo:** `G:\Rs  Ecosystem\rs-ecosystem\apps\rs-marketplace\Marketplace\checkout-pro-rs-prólipsi\context\CheckoutContext.tsx`

**Localizar linha 119** (criação do orderSummary) e **SUBSTITUIR:**

```tsx
// ANTES:
const orderSummary: OrderSummary = {
  subtotal: subtotal,
  shipping: shippingCost,
  orderBump: bumpPrice,
  discount: discountAmount,
  balanceUsed: balanceUsed,
  total: finalTotal,
  sigmaPoints: Math.floor(finalTotal * POINTS_MULTIPLIER),
  quantity: INITIAL_QUANTITY
};
```

**POR:**

```tsx
const orderSummary: OrderSummary = {
  subtotal: subtotal,
  shipping: shippingCost,
  orderBump: bumpPrice,
  discount: discountAmount,
  balanceUsed: balanceUsed,
  total: finalTotal,
  sigmaPoints: Math.floor(finalTotal * POINTS_MULTIPLIER),
  quantity: products.length > 0 ? products.reduce((sum, p) => sum + p.quantity, 0) : INITIAL_QUANTITY,
  cartItems: products.map(p => ({
    productId: p.product.id,
    name: p.product.name,
    price: p.price,
    quantity: p.quantity,
    image: p.product.image
  }))
};
```

---

## 📝 PASSO 6: Remover banner laranja de "Produto Único"

**Arquivo:** `G:\Rs  Ecosystem\rs-ecosystem\apps\rs-marketplace\Marketplace\checkout-pro-rs-prólipsi\App.tsx`

**Localizar linha 189** e **REMOVER:**

```tsx
// REMOVER ESTE BLOCO INTEIRO:
<div className="mb-6 bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl flex items-start gap-3 text-orange-300">
  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <p className="text-sm font-bold mb-1">⚠️ Checkout de Produto Único</p>
    <p className="text-xs text-orange-200/80 leading-relaxed">
      Este checkout processa <strong>1 produto por vez</strong>. 
      Finalizando compra de: <strong className="text-rs-gold">{product?.name}</strong> (R$ {product?.price.toFixed(2)}).
      {' '}Para comprar outros itens do carrinho, finalize este pedido primeiro.
    </p>
  </div>
</div>
```

---

## ✅ RESULTADO ESPERADO

Após aplicar todas as mudanças:

1. **Resumo do Pedido mostrará:**
   - Bolsa de Ombro: R$ 2.100,00 (Qtd: 1)
   - Caneta-tinteiro: R$ 850,00 (Qtd: 1)
   - **Subtotal: R$ 2.950,00**
   - Frete: R$ 18,50 (ou valor selecionado)
   - **Total: R$ 2.968,50**

2. **Sem banner laranja** de "Produto Único"

3. **Checkout processa TODOS os produtos** de uma vez

---

## 🚀 COMO APLICAR

1. Abra cada arquivo mencionado
2. Localize as linhas indicadas
3. Faça as substituições/adições
4. Salve todos os arquivos
5. O Vite fará hot reload automaticamente
6. Teste no navegador

**Tempo estimado:** 10-15 minutos

Se tiver dúvida em algum passo, me avise!
