import os

file_path = r'd:\Rs  Ecosystem\rs-ecosystem\apps\rs-consultor\consultant\sigme\CicloGlobal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Redesigning the Product Item for AUTO Activation (Step 2)
# To maintain single product selection logic but with the premium +/- UI
old_auto_product_item = """                  <button key={product.id} onClick={() => setTempSelectedProduct(product)} className={`w-full text-left p-3 bg-brand-gray-light rounded-lg hover:bg-brand-gray border-2 transition-all ${isSelected ? 'border-brand-gold' : 'border-transparent'}`}>
                    <p className="font-semibold text-white">{product.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-brand-gold">{formatCurrency(discountedPrice)}</p>
                    </div>
                  </button>"""

# Fixed UI to match Manual Activation (Premium +/- Style)
# Note: For Auto Activation, it's still single selection, but we show the UI for consistency.
new_auto_product_item = """                  <div key={product.id} className={`p-4 bg-brand-gray/40 border-2 rounded-xl flex items-center justify-between group transition-all duration-300 ${isSelected ? 'border-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'border-brand-gray-light/50 hover:border-brand-gold/30'}`}>
                    <div className="flex-grow pr-4 cursor-pointer" onClick={() => setTempSelectedProduct(product)}>
                      <p className={`font-bold transition-colors text-sm sm:text-base ${isSelected ? 'text-brand-gold' : 'text-white'}`}>{product.name}</p>
                      <p className="text-xl font-black text-brand-gold mt-1">{formatCurrency(discountedPrice)}</p>
                    </div>
                    
                    <div className="flex items-center bg-brand-dark/80 rounded-xl p-1.5 border border-brand-gold/30 shadow-inner">
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
                    </div>
                  </div>"""

if old_auto_product_item in content:
    content = content.replace(old_auto_product_item, new_auto_product_item)
    print("Success: Unified Auto Activation Product UI")
else:
    print("Error: Could not find old_auto_product_item")

with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
