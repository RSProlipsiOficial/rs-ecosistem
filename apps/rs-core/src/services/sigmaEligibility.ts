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
  const { data, error } = await supabase
    .from('orders')
    .select('matrix_accumulated, payment_status, status, payment_date')
    .eq('buyer_id', consultorId)
    .gte('payment_date', start.toISOString())
    .lt('payment_date', nextMonth.toISOString())
    .in('payment_status', ['approved', 'paid'])
    .in('status', ['paid', 'processing', 'delivered'])
  if (error) return false
  const sum = (data || []).reduce((s, o: any) => s + Number(o.matrix_accumulated || 0), 0)
  return sum >= 60
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
