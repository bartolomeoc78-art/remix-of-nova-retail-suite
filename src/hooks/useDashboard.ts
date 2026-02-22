import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, format } from "date-fns";

export function useTodaySales() {
  return useQuery({
    queryKey: ["dashboard_today_sales"],
    queryFn: async () => {
      const todayStart = startOfDay(new Date()).toISOString();
      const { data, error } = await supabase
        .from("sales")
        .select("total, subtotal, tax_total")
        .gte("created_at", todayStart)
        .eq("status", "completada");
      if (error) throw error;
      const total = data?.reduce((s, r) => s + Number(r.total), 0) ?? 0;
      const count = data?.length ?? 0;
      return { total, count };
    },
  });
}

export function useLowStockCount() {
  return useQuery({
    queryKey: ["dashboard_low_stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock_on_hand, stock_min")
        .eq("active", true);
      if (error) throw error;
      const low = data?.filter((p) => Number(p.stock_on_hand) <= Number(p.stock_min ?? 0)) ?? [];
      return low;
    },
  });
}

export function useSalesLast7Days() {
  return useQuery({
    queryKey: ["dashboard_sales_7d"],
    queryFn: async () => {
      const from = subDays(new Date(), 6);
      const fromStr = startOfDay(from).toISOString();
      const { data, error } = await supabase
        .from("sales")
        .select("total, created_at")
        .gte("created_at", fromStr)
        .eq("status", "completada")
        .order("created_at");
      if (error) throw error;

      // Group by day
      const byDay = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        byDay.set(format(subDays(new Date(), 6 - i), "yyyy-MM-dd"), 0);
      }
      for (const s of data ?? []) {
        const day = format(new Date(s.created_at), "yyyy-MM-dd");
        byDay.set(day, (byDay.get(day) ?? 0) + Number(s.total));
      }
      return Array.from(byDay.entries()).map(([date, total]) => ({
        date,
        label: format(new Date(date), "EEE"),
        total,
      }));
    },
  });
}

export function usePendingSupplierInvoices() {
  return useQuery({
    queryKey: ["dashboard_pending_si"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_invoices")
        .select("id")
        .eq("paid", false);
      if (error) throw error;
      return data?.length ?? 0;
    },
  });
}
