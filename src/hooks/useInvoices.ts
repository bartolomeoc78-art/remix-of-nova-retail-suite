import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInvoices(filters?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: async () => {
      let query = supabase
        .from("invoices_issued")
        .select("*, customers(name, nif), invoice_lines(*)")
        .order("issued_at", { ascending: false });

      if (filters?.type) query = query.eq("invoice_type", filters.type as any);
      if (filters?.status) query = query.eq("status", filters.status as any);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useInvoiceSeries() {
  return useQuery({
    queryKey: ["invoice_series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoice_series")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}
