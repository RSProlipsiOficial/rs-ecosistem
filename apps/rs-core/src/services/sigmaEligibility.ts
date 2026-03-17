import { createClient } from '@supabase/supabase-js'

function sb() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes')
  return createClient(url, key)
}

export async function isActiveInMatrixBase(consultorId: string): Promise<boolean> {
  const supabase = sb()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  // 1. Buscar dados do consultor para obter e-mail e CPF (usados na busca em cd_orders)
  const { data: consultor } = await supabase
    .from('consultores')
    .select('email, cpf')
    .eq('id', consultorId)
    .maybeSingle();

  // 2. Buscar pedidos na tabela 'orders' (Sede/Marketplace)
  const { data: orders, error: ordersErr } = await supabase
    .from('orders')
    .select('id, matrix_accumulated, total, payment_status, status, payment_date, created_at')
    .eq('buyer_id', consultorId)
    .in('payment_status', ['approved', 'paid', 'Pago'])
    .in('status', ['paid', 'processing', 'delivered', 'in_transit', 'shipped']);

  if (ordersErr) return false;

  // 3. Buscar pedidos na tabela 'cd_orders' (Vendas On-site nos CDs)
  let cdOrders: any[] = [];
  if (consultor?.email || consultor?.cpf) {
    const cdQuery = consultor.email && consultor.cpf 
        ? `buyer_email.eq."${consultor.email}",buyer_cpf.eq."${consultor.cpf}"`
        : consultor.email 
            ? `buyer_email.eq."${consultor.email}"` 
            : `buyer_cpf.eq."${consultor.cpf}"`;

    const { data: cds } = await supabase
      .from('cd_orders')
      .select('marketplace_order_id, total, status, created_at, order_date')
      .or(cdQuery)
      .in('status', ['ENTREGUE', 'EM_TRANSPORTE', 'PAGO', 'paid', 'delivered', 'in_transit', 'shipped'])
      .is('marketplace_order_id', null);
    
    cdOrders = cds || [];
  }

  // 4. Unificar fontes e calcular soma mensal
  const allOrders = [...(orders || []), ...cdOrders];

  const sum = allOrders.reduce((s, o: any) => {
    const orderDate = new Date(o.payment_date || o.created_at || o.order_date);
    
    if (orderDate >= start && orderDate < nextMonth) {
      const value = Number(o.matrix_accumulated || 0) > 0 
        ? Number(o.matrix_accumulated) 
        : Number(o.total || 0);
      return s + value;
    }
    return s;
  }, 0);

  return sum >= 60;
}

export async function qualifiesDepthBonus(userId: string): Promise<boolean> {
  return isActiveInMatrixBase(userId)
}

export async function qualifiesTop10(userId: string, rank: number): Promise<boolean> {
  return isActiveInMatrixBase(userId) && rank >= 1 && rank <= 10
}

export async function qualifiesCareerBonus(userId: string): Promise<boolean> {
  return isActiveInMatrixBase(userId)
}
