
-- ============================================================
-- NovaSystem: Complete Database Schema (fixed order)
-- ============================================================

-- 1) ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'cajero', 'inventario', 'contable', 'auditor');
CREATE TYPE public.invoice_type AS ENUM ('simplificada', 'completa', 'rectificativa');
CREATE TYPE public.invoice_status AS ENUM ('borrador', 'confirmada', 'anulada');
CREATE TYPE public.purchase_order_status AS ENUM ('borrador', 'enviado', 'en_camino', 'recibido', 'facturado', 'cancelado');
CREATE TYPE public.journal_entry_status AS ENUM ('borrador', 'confirmado', 'bloqueado');
CREATE TYPE public.payment_method AS ENUM ('efectivo', 'tarjeta', 'bizum', 'transferencia', 'mixto');
CREATE TYPE public.inventory_move_type AS ENUM ('compra', 'venta', 'devolucion', 'ajuste', 'recuento', 'ecommerce');
CREATE TYPE public.supplier_type AS ENUM ('manual', 'auto_email');
CREATE TYPE public.valuation_method AS ENUM ('pmp', 'fifo');
CREATE TYPE public.cash_move_type AS ENUM ('apertura', 'venta', 'retiro', 'gasto', 'cierre', 'ajuste');
CREATE TYPE public.sync_event_type AS ENUM ('order_created', 'order_updated', 'stock_updated', 'product_updated');

-- 2) USER ROLES TABLE (must exist before functions that reference it)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3) SECURITY DEFINER FUNCTIONS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;

-- 4) RLS for user_roles (now functions exist)
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5) PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- 6) COMPANY SETTINGS
CREATE TABLE public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Mi Empresa',
  nif text, address text, city text DEFAULT 'Valladolid', postal_code text, phone text, email text, logo_url text,
  valuation_method valuation_method NOT NULL DEFAULT 'pmp',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view settings" ON public.company_settings FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage settings" ON public.company_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7) TAX RATES
CREATE TABLE public.tax_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, rate numeric(5,2) NOT NULL, is_default boolean DEFAULT false, active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view tax rates" ON public.tax_rates FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage tax rates" ON public.tax_rates FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8) CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, parent_id uuid REFERENCES public.categories(id), accounting_account_code text, active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view categories" ON public.categories FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Manager can manage categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 9) BRANDS
CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view brands" ON public.brands FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Manager can manage brands" ON public.brands FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 10) SUPPLIERS
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, nif text, email text, phone text, website text, address text, city text, postal_code text, iban text,
  supplier_type supplier_type NOT NULL DEFAULT 'manual',
  payment_terms text, payment_days integer DEFAULT 30, moq text, shipping_conditions text, notes text,
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view suppliers" ON public.suppliers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Manager can manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 11) PRODUCTS
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE, ean text, name text NOT NULL, description text,
  category_id uuid REFERENCES public.categories(id), brand_id uuid REFERENCES public.brands(id),
  supplier_id uuid REFERENCES public.suppliers(id), tax_rate_id uuid REFERENCES public.tax_rates(id),
  unit text DEFAULT 'uds', sale_price numeric(12,2) NOT NULL DEFAULT 0, cost_price numeric(12,2) NOT NULL DEFAULT 0,
  avg_cost numeric(12,2) DEFAULT 0, stock_on_hand numeric(12,3) NOT NULL DEFAULT 0,
  stock_min numeric(12,3) DEFAULT 0, stock_max numeric(12,3), reorder_point numeric(12,3),
  location text, track_lots boolean DEFAULT false, image_url text, tags text[] DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view products" ON public.products FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Manager/Inventario can manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventario'));

-- 12) PRODUCT PRICE HISTORY
CREATE TABLE public.product_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  field_changed text NOT NULL, old_value text, new_value text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.product_price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view price history" ON public.product_price_history FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "System can insert price history" ON public.product_price_history FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 13) INVENTORY LOTS
CREATE TABLE public.inventory_lots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  lot_number text NOT NULL, expiry_date date, quantity numeric(12,3) NOT NULL DEFAULT 0, cost_price numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_lots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view lots" ON public.inventory_lots FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage lots" ON public.inventory_lots FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventario'));

-- 14) INVENTORY MOVEMENTS
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  lot_id uuid REFERENCES public.inventory_lots(id),
  move_type inventory_move_type NOT NULL, quantity numeric(12,3) NOT NULL, unit_cost numeric(12,2),
  reason text, reference_type text, reference_id uuid,
  user_id uuid REFERENCES auth.users(id), notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view movements" ON public.inventory_movements FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert movements" ON public.inventory_movements FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 15) STOCK COUNT SESSIONS
CREATE TABLE public.stock_count_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text, status text NOT NULL DEFAULT 'abierta',
  started_by uuid REFERENCES auth.users(id), approved_by uuid REFERENCES auth.users(id),
  started_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, notes text
);
ALTER TABLE public.stock_count_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view counts" ON public.stock_count_sessions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Inventario can manage counts" ON public.stock_count_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventario'));

-- 16) STOCK COUNT LINES
CREATE TABLE public.stock_count_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.stock_count_sessions(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  expected_qty numeric(12,3), counted_qty numeric(12,3), difference numeric(12,3), notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_count_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view count lines" ON public.stock_count_lines FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Inventario can manage count lines" ON public.stock_count_lines FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'inventario'));

-- 17) CUSTOMERS
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, nif text, email text, phone text, address text, city text, postal_code text,
  is_business boolean DEFAULT false, credit_allowed boolean DEFAULT false, notes text, active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view customers" ON public.customers FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can manage customers" ON public.customers FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- 18) SALES
CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number serial,
  customer_id uuid REFERENCES public.customers(id),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  payment_method payment_method NOT NULL DEFAULT 'efectivo',
  subtotal numeric(12,2) NOT NULL DEFAULT 0, tax_total numeric(12,2) NOT NULL DEFAULT 0,
  discount_total numeric(12,2) NOT NULL DEFAULT 0, total numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completada', notes text, cash_session_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view sales" ON public.sales FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Cajero+ can create sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage sales" ON public.sales FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 19) SALE LINES
CREATE TABLE public.sale_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  lot_id uuid REFERENCES public.inventory_lots(id),
  quantity numeric(12,3) NOT NULL, unit_price numeric(12,2) NOT NULL, cost_price numeric(12,2) DEFAULT 0,
  tax_rate numeric(5,2) NOT NULL DEFAULT 21, tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  discount_percent numeric(5,2) DEFAULT 0, subtotal numeric(12,2) NOT NULL DEFAULT 0, total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sale_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view sale lines" ON public.sale_lines FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert sale lines" ON public.sale_lines FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 20) REFUNDS
CREATE TABLE public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES public.sales(id) NOT NULL,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  reason text NOT NULL, total numeric(12,2) NOT NULL DEFAULT 0, is_partial boolean DEFAULT false,
  status text NOT NULL DEFAULT 'completado',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view refunds" ON public.refunds FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can create refunds" ON public.refunds FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 21) INVOICE SERIES
CREATE TABLE public.invoice_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prefix text NOT NULL UNIQUE, name text NOT NULL, invoice_type invoice_type NOT NULL DEFAULT 'completa',
  next_number integer NOT NULL DEFAULT 1, active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoice_series ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view series" ON public.invoice_series FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage series" ON public.invoice_series FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 22) INVOICES ISSUED
CREATE TABLE public.invoices_issued (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  series_id uuid REFERENCES public.invoice_series(id),
  invoice_type invoice_type NOT NULL DEFAULT 'simplificada',
  sale_id uuid REFERENCES public.sales(id), customer_id uuid REFERENCES public.customers(id),
  refund_id uuid REFERENCES public.refunds(id),
  original_invoice_id uuid REFERENCES public.invoices_issued(id),
  subtotal numeric(12,2) NOT NULL DEFAULT 0, tax_total numeric(12,2) NOT NULL DEFAULT 0, total numeric(12,2) NOT NULL DEFAULT 0,
  tax_breakdown jsonb DEFAULT '[]', payment_method payment_method,
  status invoice_status NOT NULL DEFAULT 'borrador',
  issued_at timestamptz NOT NULL DEFAULT now(), notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices_issued ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view invoices" ON public.invoices_issued FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can create invoices" ON public.invoices_issued FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admin can update invoices" ON public.invoices_issued FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contable'));

-- 23) INVOICE LINES
CREATE TABLE public.invoice_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES public.invoices_issued(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id),
  description text NOT NULL, quantity numeric(12,3) NOT NULL, unit_price numeric(12,2) NOT NULL,
  tax_rate numeric(5,2) NOT NULL DEFAULT 21, tax_amount numeric(12,2) NOT NULL DEFAULT 0,
  subtotal numeric(12,2) NOT NULL DEFAULT 0, total numeric(12,2) NOT NULL DEFAULT 0
);
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view invoice lines" ON public.invoice_lines FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert invoice lines" ON public.invoice_lines FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 24) PURCHASE ORDERS
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number serial,
  supplier_id uuid REFERENCES public.suppliers(id) NOT NULL,
  status purchase_order_status NOT NULL DEFAULT 'borrador',
  subtotal numeric(12,2) DEFAULT 0, tax_total numeric(12,2) DEFAULT 0, total numeric(12,2) DEFAULT 0,
  expected_date date, received_date date, notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view purchase orders" ON public.purchase_orders FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Manager can manage POs" ON public.purchase_orders FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 25) PURCHASE ORDER LINES
CREATE TABLE public.purchase_order_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.purchase_orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) NOT NULL,
  quantity_ordered numeric(12,3) NOT NULL, quantity_received numeric(12,3) DEFAULT 0,
  unit_cost numeric(12,2) NOT NULL, tax_rate numeric(5,2) DEFAULT 21, subtotal numeric(12,2) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view PO lines" ON public.purchase_order_lines FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Manager can manage PO lines" ON public.purchase_order_lines FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- 26) SUPPLIER INVOICES
CREATE TABLE public.supplier_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text, supplier_id uuid REFERENCES public.suppliers(id) NOT NULL,
  purchase_order_id uuid REFERENCES public.purchase_orders(id),
  subtotal numeric(12,2) NOT NULL DEFAULT 0, tax_total numeric(12,2) NOT NULL DEFAULT 0, total numeric(12,2) NOT NULL DEFAULT 0,
  tax_breakdown jsonb DEFAULT '[]', due_date date, paid boolean DEFAULT false, paid_at timestamptz,
  payment_method payment_method, notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view supplier invoices" ON public.supplier_invoices FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Manager/Contable can manage" ON public.supplier_invoices FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'contable'));

-- 27) CASH SESSIONS
CREATE TABLE public.cash_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opened_by uuid REFERENCES auth.users(id) NOT NULL, closed_by uuid REFERENCES auth.users(id),
  opening_amount numeric(12,2) NOT NULL DEFAULT 0, expected_amount numeric(12,2) DEFAULT 0,
  counted_amount numeric(12,2), difference numeric(12,2), difference_notes text,
  status text NOT NULL DEFAULT 'abierta',
  opened_at timestamptz NOT NULL DEFAULT now(), closed_at timestamptz
);
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view cash sessions" ON public.cash_sessions FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Cajero+ can manage cash" ON public.cash_sessions FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- 28) CASH MOVEMENTS
CREATE TABLE public.cash_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.cash_sessions(id) ON DELETE CASCADE NOT NULL,
  move_type cash_move_type NOT NULL, amount numeric(12,2) NOT NULL, description text,
  reference_type text, reference_id uuid, user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view cash movements" ON public.cash_movements FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Cajero+ can insert cash movements" ON public.cash_movements FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 29) BANK ACCOUNTS
CREATE TABLE public.bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, iban text, bank_name text, balance numeric(12,2) DEFAULT 0,
  accounting_account_code text DEFAULT '572', active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view banks" ON public.bank_accounts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin can manage banks" ON public.bank_accounts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contable'));

-- 30) BANK MOVEMENTS
CREATE TABLE public.bank_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid REFERENCES public.bank_accounts(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12,2) NOT NULL, description text, value_date date,
  reconciled boolean DEFAULT false, reconciliation_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bank_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view bank movements" ON public.bank_movements FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Contable can manage bank movements" ON public.bank_movements FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contable'));

-- 31) EXPENSES
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  description text NOT NULL, category text NOT NULL, amount numeric(12,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 21, tax_amount numeric(12,2) DEFAULT 0, total numeric(12,2) NOT NULL,
  payment_method payment_method DEFAULT 'transferencia',
  supplier_id uuid REFERENCES public.suppliers(id), accounting_account_code text, attachment_url text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE, user_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view expenses" ON public.expenses FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Manager/Contable can manage expenses" ON public.expenses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR public.has_role(auth.uid(), 'contable'));

-- 32) ACCOUNTING ACCOUNTS (PGC)
CREATE TABLE public.accounting_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE, name text NOT NULL, account_type text NOT NULL,
  nature text NOT NULL DEFAULT 'deudora', parent_code text, active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.accounting_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view accounts" ON public.accounting_accounts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Admin/Contable can manage accounts" ON public.accounting_accounts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contable'));

-- 33) JOURNAL ENTRIES
CREATE TABLE public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number serial, entry_date date NOT NULL DEFAULT CURRENT_DATE, description text NOT NULL,
  reference_type text, reference_id uuid, status journal_entry_status NOT NULL DEFAULT 'borrador',
  created_by uuid REFERENCES auth.users(id), confirmed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view journal entries" ON public.journal_entries FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Contable+ can manage entries" ON public.journal_entries FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contable'));

-- 34) JOURNAL ENTRY LINES
CREATE TABLE public.journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
  account_code text REFERENCES public.accounting_accounts(code) NOT NULL,
  debit numeric(12,2) NOT NULL DEFAULT 0, credit numeric(12,2) NOT NULL DEFAULT 0, description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view entry lines" ON public.journal_entry_lines FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Contable+ can manage entry lines" ON public.journal_entry_lines FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'contable'));

-- 35) AUDIT LOG
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id), action text NOT NULL, entity_type text NOT NULL,
  entity_id uuid, old_data jsonb, new_data jsonb, ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin/Auditor can view audit log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'auditor'));
CREATE POLICY "System can insert audit log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 36) ECOMMERCE SYNC EVENTS
CREATE TABLE public.ecommerce_sync_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type sync_event_type NOT NULL, direction text NOT NULL DEFAULT 'inbound',
  payload jsonb, status text NOT NULL DEFAULT 'pending', error_message text, retries integer DEFAULT 0,
  processed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ecommerce_sync_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can view sync events" ON public.ecommerce_sync_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "System can insert sync events" ON public.ecommerce_sync_events FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- 37) INDEXES
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_products_ean ON public.products(ean);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_supplier ON public.products(supplier_id);
CREATE INDEX idx_products_active ON public.products(active);
CREATE INDEX idx_sales_created ON public.sales(created_at);
CREATE INDEX idx_sales_customer ON public.sales(customer_id);
CREATE INDEX idx_sale_lines_sale ON public.sale_lines(sale_id);
CREATE INDEX idx_sale_lines_product ON public.sale_lines(product_id);
CREATE INDEX idx_inventory_movements_product ON public.inventory_movements(product_id);
CREATE INDEX idx_inventory_movements_created ON public.inventory_movements(created_at);
CREATE INDEX idx_journal_entries_date ON public.journal_entries(entry_date);
CREATE INDEX idx_journal_entry_lines_account ON public.journal_entry_lines(account_code);
CREATE INDEX idx_audit_log_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at);
CREATE INDEX idx_invoices_issued_number ON public.invoices_issued(invoice_number);
CREATE INDEX idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);

-- 38) AUTO-CREATE PROFILE + ADMIN ROLE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  IF NOT EXISTS (SELECT 1 FROM public.user_roles LIMIT 1) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 39) UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
