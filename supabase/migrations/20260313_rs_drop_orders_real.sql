-- ============================================================================
-- RS ECOSYSTEM - RS DROP ORDERS REAL DATA
-- Migration: 20260313_rs_drop_orders_real.sql
-- Objetivo: complementar a estrutura de pedidos do CD para atender o fluxo
-- real do RS Controle Drop (cliente, itens, envio, marketing e afiliados)
-- ============================================================================

ALTER TABLE public.cd_customers
  ADD COLUMN IF NOT EXISTS document VARCHAR(32),
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS address_street TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_complement TEXT,
  ADD COLUMN IF NOT EXISTS address_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS address_city TEXT,
  ADD COLUMN IF NOT EXISTS address_state TEXT,
  ADD COLUMN IF NOT EXISTS address_zip_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS transactional_consent BOOLEAN DEFAULT TRUE;

ALTER TABLE public.cd_orders
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.cd_customers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_document VARCHAR(32),
  ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(32),
  ADD COLUMN IF NOT EXISTS items_total DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS discount_total DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS shipping_charged DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100),
  ADD COLUMN IF NOT EXISTS payment_fee DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS other_expenses DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_date DATE,
  ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS actual_delivery_date DATE,
  ADD COLUMN IF NOT EXISTS shipping_label_url TEXT,
  ADD COLUMN IF NOT EXISTS fulfillment_center_id UUID,
  ADD COLUMN IF NOT EXISTS sales_channel VARCHAR(150),
  ADD COLUMN IF NOT EXISTS campaign VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS affiliate_id UUID,
  ADD COLUMN IF NOT EXISTS affiliate_commission DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS commission_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS shipping_street TEXT,
  ADD COLUMN IF NOT EXISTS shipping_number TEXT,
  ADD COLUMN IF NOT EXISTS shipping_complement TEXT,
  ADD COLUMN IF NOT EXISTS shipping_neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS shipping_city TEXT,
  ADD COLUMN IF NOT EXISTS shipping_state TEXT,
  ADD COLUMN IF NOT EXISTS shipping_zip_code VARCHAR(20);

ALTER TABLE public.cd_order_items
  ADD COLUMN IF NOT EXISTS cd_order_id UUID REFERENCES public.cd_orders(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS supplier_id UUID,
  ADD COLUMN IF NOT EXISTS discount DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS unit_cost DECIMAL(12, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS product_sku VARCHAR(120),
  ADD COLUMN IF NOT EXISTS product_catalog_id UUID;

UPDATE public.cd_order_items
SET cd_order_id = order_id
WHERE cd_order_id IS NULL
  AND order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cd_orders_cd_created_at
  ON public.cd_orders (cd_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cd_orders_customer_id
  ON public.cd_orders (customer_id);

CREATE INDEX IF NOT EXISTS idx_cd_orders_status
  ON public.cd_orders (status);

CREATE INDEX IF NOT EXISTS idx_cd_orders_utm_source
  ON public.cd_orders (utm_source);

CREATE INDEX IF NOT EXISTS idx_cd_orders_sales_channel
  ON public.cd_orders (sales_channel);

CREATE INDEX IF NOT EXISTS idx_cd_customers_cd_name
  ON public.cd_customers (cd_id, name);

CREATE INDEX IF NOT EXISTS idx_cd_customers_cd_email
  ON public.cd_customers (cd_id, email);

CREATE INDEX IF NOT EXISTS idx_cd_customers_cd_document
  ON public.cd_customers (cd_id, document);

CREATE INDEX IF NOT EXISTS idx_cd_order_items_cd_order_id
  ON public.cd_order_items (cd_order_id);
