import os

file_path = r'd:\Rs  Ecosystem\rs-ecosystem\apps\rs-consultor\consultant\sigme\CicloGlobal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Redesigning the Product Item to fix the [-] button visibility and layout cutting
old_product_ui_complex = """                  <div key={product.id} className="p-4 bg-brand-gray/50 border border-brand-gray-light rounded-xl flex items-center justify-between group hover:border-brand-gold/30 transition-all">
                    <div className="flex-grow">
                      <p className="font-bold text-white group-hover:text-brand-gold transition-colors">{product.name}</p>
                      <p className="text-xl font-black text-brand-gold mt-1">{formatCurrency(discountedPrice)}</p>
                    </div>
                    
                    {/* Controle de Quantidade Premium */}
                    <div className="flex items-center bg-brand-dark rounded-lg p-1 border border-brand-gold/20">
                      <button 
                        onClick={() => {
                          const item = cart.find(i => i.id === product.id);
                          if (item) updateCartQuantity(product.id, item.quantity - 1);
                        }}
                        className={`p-2 rounded-md transition-all ${cart.find(i => i.id === product.id) ? 'text-brand-gold hover:bg-brand-gold/10' : 'text-gray-600 cursor-not-allowed'}`}
                      >
                        <IconMinus size={18} />
                      </button>
                      
                      <div className="w-10 text-center font-black text-white text-lg">
                        {cart.find(i => i.id === product.id)?.quantity || 0}
                      </div>

                      <button 
                        onClick={() => addToCart(product, 1)}
                        className="p-2 rounded-md text-brand-gold hover:bg-brand-gold/10 transition-all"
                      >
                        <IconPlus size={18} />
                      </button>
                    </div>
                  </div>"""

new_product_ui_fixed = """                  <div key={product.id} className="p-4 bg-brand-gray/40 border border-brand-gray-light/50 rounded-xl flex items-center justify-between group hover:border-brand-gold/40 transition-all duration-300">
                    <div className="flex-grow pr-4">
                      <p className="font-bold text-white group-hover:text-brand-gold transition-colors text-sm sm:text-base">{product.name}</p>
                      <p className="text-xl font-black text-brand-gold mt-1">{formatCurrency(discountedPrice)}</p>
                    </div>
                    
                    {/* Controle de Quantidade Premium (Fixed Visibility) */}
                    <div className="flex items-center bg-brand-dark/80 rounded-xl p-1.5 border border-brand-gold/30 shadow-inner">
                      <button 
                        onClick={() => {
                          const item = cart.find(i => i.id === product.id);
                          if (item && item.quantity > 0) updateCartQuantity(product.id, item.quantity - 1);
                        }}
                        className={`p-2 rounded-lg transition-all ${
                          (cart.find(i => i.id === product.id)?.quantity || 0) > 0 
                          ? 'text-brand-gold hover:bg-brand-gold/20' 
                          : 'text-brand-gray cursor-not-allowed opacity-30'
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
                    </div>
                  </div>"""

if old_product_ui_complex in content:
    content = content.replace(old_product_ui_complex, new_product_ui_fixed)
    print("Success: Fixed Product Selector UI and visibility")
else:
    # Fallback search if exact match fails due to minor formatting diffs
    print("Error: Could not find exactly old_product_ui_complex. Trying generic replace.")
    import re
    # Simplified regex-like replacement for the specific block
    start_tag = 'key={product.id}'
    # We'll use a more localized approach
    parts = content.split(start_tag)
    if len(parts) > 1:
        print("Found product.id key. Attempting manual restoration via write_to_file.")
    else:
        print("Could not even find product.id key.")

with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
