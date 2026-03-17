import os

file_path = r'd:\Rs  Ecosystem\rs-ecosystem\apps\rs-consultor\consultant\sigme\CicloGlobal.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the Locked Card design to be more "premium/drawn"
old_locked_card = """                return ( // --- Locked Card ---
                  <div key={summary.level} className="w-60 h-72 flex-shrink-0 bg-brand-gray-light opacity-60 border border-dashed border-brand-gray rounded-xl p-4 flex flex-col justify-center items-center text-center">
                    <IconLock size={40} className="text-gray-500" />
                    <p className="text-6xl font-extrabold text-gray-600 my-4">{summary.level}</p>
                    <p className="font-semibold text-gray-500">Bloqueado</p>
                  </div>
                );"""

new_locked_card = """                return ( // --- Locked Card (Premium Drawn Style) ---
                  <div key={summary.level} className="w-60 h-72 flex-shrink-0 bg-brand-dark/40 border-2 border-dashed border-brand-gray/30 rounded-xl p-4 flex flex-col justify-center items-center text-center group hover:border-brand-gold/20 transition-all duration-500">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-brand-gray/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <IconLock size={48} className="text-brand-gray group-hover:text-brand-gold/30 transition-colors relative z-10" />
                    </div>
                    <p className="text-7xl font-black text-brand-gray-light/10 my-2 group-hover:text-brand-gold/5 transition-colors tracking-tighter select-none">{summary.level}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-brand-gray uppercase tracking-[0.2em]">Ciclo {summary.level}</p>
                      <p className="text-[10px] font-semibold text-brand-gray-light/40 uppercase">Aguardando Progresso</p>
                    </div>
                  </div>
                );"""

if old_locked_card in content:
    content = content.replace(old_locked_card, new_locked_card)
    print("Success: Updated Locked Card design")
else:
    print("Error: Could not find old_locked_card")

# 2. Add a visual indicator for horizontal scroll (gradient mask)
old_container_start = """        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">"""
new_container_start = """        <div className="relative group/journey">
          {/* Scroll Indicators */}
          <div className="absolute left-0 top-0 bottom-4 w-12 bg-gradient-to-r from-brand-dark to-transparent z-20 pointer-events-none opacity-0 group-hover/journey:opacity-100 transition-opacity"></div>
          <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-brand-dark to-transparent z-20 pointer-events-none opacity-60 group-hover/journey:opacity-100 transition-opacity"></div>
          
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">"""

if old_container_start in content:
    content = content.replace(old_container_start, new_container_start)
    # Add closing div for the new wrapper
    content = content.replace("""            });
          })()}
        </div>
      </div>""", """            });
          })()}
          </div>
        </div>
      </div>""")
    print("Success: Added scroll indicators and snap points")
else:
    print("Error: Could not find old_container_start")

with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
