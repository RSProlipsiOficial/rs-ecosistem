
import os
from supabase import create_client, Client

url = "https://rptkhrboejbwexseikuo.supabase.co"
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

CD_ID = "d107da4e-e266-41b0-947a-0c66b2f2b9ef"

def audit():
    print(f"Auditing CD: {CD_ID}\n")
    
    # 1. Get current stock
    res = supabase.table("cd_products").select("*").eq("cd_id", CD_ID).execute()
    current_stock = {p['sku']: p['stock_level'] for p in res.data}
    print(f"Current Stock in DB: {current_stock}")
    
    # 2. Get Delivered Replenishments
    # We look for orders of type REPLENISHMENT or ABASTECIMENTO that are ENTREGUE
    res = supabase.table("cd_orders")\
        .select("id, status, type, cd_order_items(sku, quantity)")\
        .eq("cd_id", CD_ID)\
        .execute()
    
    orders = res.data
    calculated_stock = {}
    
    print("\nOrders found:")
    for o in orders:
        items = o.get('cd_order_items', [])
        status = o['status']
        otype = o['type']
        oid = o['id'][:8]
        print(f"Order {oid}: Status={status}, Type={otype}, Items={len(items)}")
        
        # Logic: Increment if it's a RECEIVED replenishment
        if (otype in ['REPLENISHMENT', 'ABASTECIMENTO']) and status == 'ENTREGUE':
            for item in items:
                sku = item['sku']
                qty = item['quantity']
                calculated_stock[sku] = calculated_stock.get(sku, 0) + qty
                print(f"  + Added {qty} of {sku} (Abastecimento Entregue)")
        
        # Logic: Decrement if it's a SALE (confirmed or delivered)
        # Note: In the video, sales history has orders too.
        if (otype in ['SALE', 'MARKETPLACE']):
             for item in items:
                sku = item['sku']
                qty = item['quantity']
                calculated_stock[sku] = calculated_stock.get(sku, 0) - qty
                print(f"  - Removed {qty} of {sku} (Venda)")

    print(f"\nCalculated 'True' Stock: {calculated_stock}")
    
    for sku, level in calculated_stock.items():
        if level != current_stock.get(sku):
            print(f"Mismatch for {sku}: DB={current_stock.get(sku)}, Calc={level}")

if __name__ == "__main__":
    audit()
