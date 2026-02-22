import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ── Supplier Scoring (8 dimensions, 0-100) ──

interface SupplierScore {
  id: string;
  name: string;
  score: number;
  dimensions: {
    precio: number;
    calidad: number;
    plazo: number;
    moq: number;
    sostenibilidad: number;
    cercania: number;
    condiciones_pago: number;
    comunicacion: number;
  };
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
}

function scoreSupplier(supplier: any, invoices: any[], orders: any[]): SupplierScore {
  const supplierInvoices = invoices.filter((i) => i.supplier_id === supplier.id);
  const supplierOrders = orders.filter((o) => o.supplier_id === supplier.id);

  // 1. Precio (based on invoice amounts — lower avg = better, heuristic)
  const avgInvoice = supplierInvoices.length > 0
    ? supplierInvoices.reduce((s, i) => s + Number(i.total), 0) / supplierInvoices.length
    : 0;
  const precio = avgInvoice > 0 ? Math.max(0, Math.min(100, 100 - avgInvoice / 20)) : 50;

  // 2. Calidad (% orders received without issues — heuristic: received/facturado = good)
  const completedOrders = supplierOrders.filter((o) => ["recibido", "facturado"].includes(o.status));
  const calidad = supplierOrders.length > 0 ? (completedOrders.length / supplierOrders.length) * 100 : 50;

  // 3. Plazo (payment days — shorter = better)
  const payDays = supplier.payment_days ?? 30;
  const plazo = Math.max(0, Math.min(100, 100 - (payDays - 15) * 2));

  // 4. MOQ (lower = better for small shop)
  const moqVal = supplier.moq ? parseInt(supplier.moq) : 0;
  const moq = moqVal > 0 ? Math.max(0, Math.min(100, 100 - moqVal * 2)) : 70;

  // 5. Sostenibilidad (heuristic: has notes mentioning eco/bio/orgánico)
  const ecoKeywords = ["eco", "bio", "orgáni", "sostenib", "local", "km0"];
  const notesLower = (supplier.notes ?? "").toLowerCase();
  const ecoHits = ecoKeywords.filter((k) => notesLower.includes(k)).length;
  const sostenibilidad = Math.min(100, 40 + ecoHits * 15);

  // 6. Cercanía (city matches Valladolid or CyL)
  const cityLower = (supplier.city ?? "").toLowerCase();
  const cercania = cityLower.includes("valladolid") ? 100
    : ["palencia", "segovia", "zamora", "león", "salamanca", "ávila", "burgos", "soria"].some((c) => cityLower.includes(c)) ? 80
    : cityLower ? 40 : 50;

  // 7. Condiciones pago
  const condiciones_pago = payDays <= 15 ? 90 : payDays <= 30 ? 70 : payDays <= 60 ? 50 : 30;

  // 8. Comunicación (has email + phone = better)
  const comunicacion = (supplier.email ? 40 : 0) + (supplier.phone ? 30 : 0) + (supplier.website ? 30 : 0);

  const dims = { precio, calidad, plazo, moq, sostenibilidad, cercania, condiciones_pago, comunicacion };
  const weights = { precio: 0.18, calidad: 0.2, plazo: 0.1, moq: 0.08, sostenibilidad: 0.12, cercania: 0.1, condiciones_pago: 0.12, comunicacion: 0.1 };
  const score = Math.round(
    Object.entries(dims).reduce((total, [key, val]) => total + val * (weights[key as keyof typeof weights] ?? 0.1), 0)
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const redFlags: string[] = [];

  if (calidad >= 80) strengths.push("Alta fiabilidad en entregas");
  if (cercania >= 80) strengths.push("Proximidad geográfica");
  if (sostenibilidad >= 70) strengths.push("Perfil sostenible");
  if (condiciones_pago >= 70) strengths.push("Buenas condiciones de pago");

  if (calidad < 50) weaknesses.push("Baja tasa de entregas completadas");
  if (comunicacion < 50) weaknesses.push("Datos de contacto incompletos");
  if (moq < 40) weaknesses.push("MOQ elevado");

  if (calidad < 30) redFlags.push("🔴 Muy baja fiabilidad");
  if (supplierOrders.filter((o) => o.status === "cancelado").length > 2) redFlags.push("🔴 Pedidos cancelados frecuentes");

  return { id: supplier.id, name: supplier.name, score, dimensions: dims, strengths, weaknesses, redFlags };
}

export function useSupplierScoring() {
  return useQuery({
    queryKey: ["supplier_scoring"],
    queryFn: async () => {
      const [{ data: suppliers }, { data: invoices }, { data: orders }] = await Promise.all([
        supabase.from("suppliers").select("*").eq("active", true),
        supabase.from("supplier_invoices").select("id, supplier_id, total"),
        supabase.from("purchase_orders").select("id, supplier_id, status"),
      ]);
      return (suppliers ?? []).map((s) => scoreSupplier(s, invoices ?? [], orders ?? []));
    },
  });
}

// ── Slow-moving products (no sales in 180 days) ──

export function useSlowMovingProducts() {
  return useQuery({
    queryKey: ["slow_moving_products"],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 180);

      const { data: products } = await supabase
        .from("products")
        .select("id, name, sku, stock_on_hand, cost_price")
        .eq("active", true)
        .gt("stock_on_hand", 0);

      const { data: recentSaleLines } = await supabase
        .from("sale_lines")
        .select("product_id")
        .gte("created_at", cutoff.toISOString());

      const recentProductIds = new Set((recentSaleLines ?? []).map((sl) => sl.product_id));
      return (products ?? [])
        .filter((p) => !recentProductIds.has(p.id))
        .map((p) => ({
          ...p,
          stockValue: Number(p.stock_on_hand) * Number(p.cost_price),
        }))
        .sort((a, b) => b.stockValue - a.stockValue);
    },
  });
}

// ── Top customers (simple RFM-like: frequency + monetary) ──

export interface CustomerSegment {
  id: string;
  name: string;
  totalSpent: number;
  orderCount: number;
  lastPurchase: string | null;
  segment: "VIP" | "Regular" | "Ocasional" | "Inactivo";
}

export function useCustomerSegmentation() {
  return useQuery({
    queryKey: ["customer_segmentation"],
    queryFn: async () => {
      const { data: customers } = await supabase.from("customers").select("id, name").eq("active", true);
      const { data: sales } = await supabase.from("sales").select("id, customer_id, total, created_at").eq("status", "completada");

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      return (customers ?? []).map((c): CustomerSegment => {
        const customerSales = (sales ?? []).filter((s) => s.customer_id === c.id);
        const totalSpent = customerSales.reduce((s, sale) => s + Number(sale.total), 0);
        const orderCount = customerSales.length;
        const lastPurchase = customerSales.length > 0
          ? customerSales.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null;

        const isRecent = lastPurchase && new Date(lastPurchase) > sixMonthsAgo;
        let segment: CustomerSegment["segment"] = "Inactivo";
        if (orderCount >= 10 && totalSpent >= 500) segment = "VIP";
        else if (orderCount >= 3 && isRecent) segment = "Regular";
        else if (orderCount >= 1) segment = "Ocasional";

        return { id: c.id, name: c.name, totalSpent, orderCount, lastPurchase, segment };
      }).sort((a, b) => b.totalSpent - a.totalSpent);
    },
  });
}

// ── Cross-sell recommendations (products often bought together) ──

export function useCrossSellRecommendations() {
  return useQuery({
    queryKey: ["cross_sell"],
    queryFn: async () => {
      const { data: saleLines } = await supabase
        .from("sale_lines")
        .select("sale_id, product_id, products(name)")
        .limit(1000);

      if (!saleLines || saleLines.length === 0) return [];

      // Group products by sale
      const salesMap = new Map<string, { id: string; name: string }[]>();
      saleLines.forEach((sl) => {
        const list = salesMap.get(sl.sale_id) ?? [];
        list.push({ id: sl.product_id, name: (sl.products as any)?.name ?? "" });
        salesMap.set(sl.sale_id, list);
      });

      // Count co-occurrences
      const pairs = new Map<string, { a: string; b: string; nameA: string; nameB: string; count: number }>();
      salesMap.forEach((products) => {
        if (products.length < 2) return;
        for (let i = 0; i < products.length; i++) {
          for (let j = i + 1; j < products.length; j++) {
            const key = [products[i].id, products[j].id].sort().join("-");
            const existing = pairs.get(key);
            if (existing) {
              existing.count++;
            } else {
              pairs.set(key, {
                a: products[i].id, b: products[j].id,
                nameA: products[i].name, nameB: products[j].name,
                count: 1,
              });
            }
          }
        }
      });

      return Array.from(pairs.values())
        .filter((p) => p.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });
}
