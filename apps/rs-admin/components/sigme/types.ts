// Tipos para componentes SIGMA
export interface NetworkNode {
  id: string;
  user_id: string;
  parent_id: string | null;
  position: number;
  level: number;
  is_active: boolean;
  created_at: string;
  user?: {
    id: string;
    name: string;
    email: string;
    nivel_carreira: string;
    foto_perfil: string | null;
  };
  children?: NetworkNode[];
  isEmpty?: boolean;
  name?: string;
  pin?: string;
  status?: string;
  hasPurchased?: boolean;
}

export interface CDProduct {
  id: number;
  name: string;
  price: number;
  fullPrice?: number;
  discount?: number;
  stock: number;
  category: string;
}

export interface CartItem extends CDProduct {
  quantity: number;
}

export interface DistributionCenter {
  id: number;
  name: string;
  city: string;
  state: string;
  products: number;
  isFederalSede?: boolean;
  whatsapp?: string;
}
