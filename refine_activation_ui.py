import os

file_path = r'd:\Rs  Ecosystem\rs-ecosystem\apps\rs-consultor\consultant\sigme\CicloGlobal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Product Item UI in Manual Activation (Step 2)
old_product_item_manual = """                  <div key={product.id} className="p-3 bg-brand-gray-light rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{product.name}</p>
                      <p className="text-lg font-bold text-brand-gold">{formatCurrency(discountedPrice)}</p>
                    </div>
                    <button onClick={() => addToCart(product, 1)} className="bg-brand-gold text-brand-dark font-bold py-2 px-3 rounded-lg hover:bg-yellow-400 flex items-center gap-1">
                      <IconPlus size={16} />
                    </button>
                  </div>"""

new_product_item_manual = """                  <div key={product.id} className="p-4 bg-brand-gray/50 border border-brand-gray-light rounded-xl flex items-center justify-between group hover:border-brand-gold/30 transition-all">
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

if old_product_item_manual in content:
    content = content.replace(old_product_item_manual, new_product_item_manual)
    print("Success: Updated Product Item UI in Manual Activation")
else:
    print("Error: Could not find old_product_item_manual")

# 2. Update "Ver Carrinho" Button to Premium Style
old_cart_button = """              <button onClick={() => setModalStep(3)} disabled={cart.length === 0} className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-400 disabled:bg-brand-gray flex items-center gap-2">
                <IconShoppingCart size={16} />
                Ver Carrinho ({cart.reduce((acc, item) => acc + item.quantity, 0)})
              </button>"""

new_cart_button = """              <button 
                onClick={() => setModalStep(3)} 
                disabled={cart.length === 0} 
                className="flex items-center gap-3 bg-brand-dark border-2 border-brand-gold text-brand-gold font-black py-3 px-6 rounded-xl hover:bg-brand-gold hover:text-brand-dark transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-brand-gold/10"
              >
                <IconShoppingCart size={20} />
                <span>Ver Carrinho ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
              </button>"""

if old_cart_button in content:
    content = content.replace(old_cart_button, new_cart_button)
    print("Success: Updated Ver Carrinho button style")
else:
    print("Error: Could not find old_cart_button")

with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
