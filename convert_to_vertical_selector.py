import os

file_path = r'd:\Rs  Ecosystem\rs-ecosystem\apps\rs-consultor\consultant\sigme\CicloGlobal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Imports
if 'IconChevronDown' not in content:
    # This shouldn't happen but just in case
    print("Warning: IconChevronDown not found in imports. Manual check needed.")
else:
    content = content.replace(
        'IconChevronLeft, IconWallet',
        'IconChevronDown, IconChevronUp, IconChevronLeft, IconWallet'
    )

# 2. Redesign Manual Activation Selector (Vertical Arrows)
old_manual_selector = """                    {/* Controle de Quantidade Premium (Fixed Visibility) */}
                    <div className="flex items-center bg-brand-dark/80 rounded-xl p-1.5 border border-brand-gold/30 shadow-inner">
                      <button 
                        onClick={() => {
                          const item = cart.find(i => i.id === product.id);
                          if (item && item.quantity > 0) updateCartQuantity(product.id, item.quantity - 1);
                        }}
                        className={`p-2 rounded-lg transition-all ${
                          (cart.find(i => i.id === product.id)?.quantity || 0) > 0 
                          ? 'text-brand-gold hover:bg-brand-gold/20' 
                          : 'text-brand-gray opacity-30 cursor-not-allowed'
                        }`}
                        disabled={(cart.find(i => i.id === product.id)?.quantity || 0) === 0}
                      >
                        <IconMinus size={20} weight="bold" />
                      </button>
                      
                      <div className="w-12 text-center font-black text-white text-xl tabular-nums">
                        {cart.find(i => i.id === product.id)?.quantity || 0}
                      </div>

                      <button 
                        onClick={() => addToCart(product, 1)}
                        className="p-2 rounded-lg text-brand-gold hover:bg-brand-gold/20 transition-all"
                      >
                        <IconPlus size={20} weight="bold" />
                      </button>
                    </div>"""

new_manual_selector = """                    {/* Controle de Quantidade Premium (Vertical Arrows) */}
                    <div className="flex items-center bg-brand-dark/90 rounded-xl p-1 px-3 border border-brand-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
                      <div className="w-10 text-center font-black text-white text-2xl tabular-nums mr-2">
                        {cart.find(i => i.id === product.id)?.quantity || 0}
                      </div>
                      <div className="flex flex-col border-l border-brand-gold/20 pl-2">
                        <button 
                          onClick={() => addToCart(product, 1)}
                          className="p-1 text-brand-gold hover:text-white transition-colors"
                          title="Aumentar"
                        >
                          <IconChevronUp size={22} weight="bold" />
                        </button>
                        <button 
                          onClick={() => {
                            const item = cart.find(i => i.id === product.id);
                            if (item && item.quantity > 0) updateCartQuantity(product.id, item.quantity - 1);
                          }}
                          className={`p-1 transition-all ${
                            (cart.find(i => i.id === product.id)?.quantity || 0) > 0 
                            ? 'text-brand-gold hover:text-white' 
                            : 'text-brand-gray opacity-30 cursor-not-allowed'
                          }`}
                          disabled={(cart.find(i => i.id === product.id)?.quantity || 0) === 0}
                          title="Diminuir"
                        >
                          <IconChevronDown size={22} weight="bold" />
                        </button>
                      </div>
                    </div>"""

# 3. Redesign Auto Activation Selector (Vertical Arrows)
old_auto_selector = """                    <div className="flex items-center bg-brand-dark/80 rounded-xl p-1.5 border border-brand-gold/30 shadow-inner">
                      <button 
                        onClick={() => { if (isSelected) setTempSelectedProduct(null); }}
                        className={`p-2 rounded-lg transition-all ${isSelected ? 'text-brand-gold hover:bg-brand-gold/20' : 'text-brand-gray opacity-30 cursor-not-allowed'}`}
                        disabled={!isSelected}
                      >
                        <IconMinus size={20} weight="bold" />
                      </button>
                      
                      <div className="w-12 text-center font-black text-xl tabular-nums text-white">
                        {isSelected ? 1 : 0}
                      </div>

                      <button 
                        onClick={() => setTempSelectedProduct(product)}
                        className={`p-2 rounded-lg transition-all ${isSelected ? 'text-brand-gray opacity-30 cursor-not-allowed' : 'text-brand-gold hover:bg-brand-gold/20'}`}
                        disabled={isSelected}
                      >
                        <IconPlus size={20} weight="bold" />
                      </button>
                    </div>"""

new_auto_selector = """                    <div className="flex items-center bg-brand-dark/90 rounded-xl p-1 px-3 border border-brand-gold/40 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
                      <div className="w-10 text-center font-black text-white text-2xl tabular-nums mr-2">
                        {isSelected ? 1 : 0}
                      </div>
                      <div className="flex flex-col border-l border-brand-gold/20 pl-2">
                        <button 
                          onClick={() => setTempSelectedProduct(product)}
                          className={`p-1 transition-colors ${isSelected ? 'text-brand-gray opacity-30 cursor-not-allowed' : 'text-brand-gold hover:text-white'}`}
                          disabled={isSelected}
                          title="Selecionar"
                        >
                          <IconChevronUp size={22} weight="bold" />
                        </button>
                        <button 
                          onClick={() => { if (isSelected) setTempSelectedProduct(null); }}
                          className={`p-1 transition-all ${isSelected ? 'text-brand-gold hover:text-white' : 'text-brand-gray opacity-30 cursor-not-allowed'}`}
                          disabled={!isSelected}
                          title="Remover"
                        >
                          <IconChevronDown size={22} weight="bold" />
                        </button>
                      </div>
                    </div>"""

if old_manual_selector in content:
    content = content.replace(old_manual_selector, new_manual_selector)
    print("Success: Updated Manual selector to vertical arrows")
else:
    print("Error: Could not find old_manual_selector")

if old_auto_selector in content:
    content = content.replace(old_auto_selector, new_auto_selector)
    print("Success: Updated Auto selector to vertical arrows")
else:
    print("Error: Could not find old_auto_selector")

with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
