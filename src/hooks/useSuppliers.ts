import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (supplier: TablesInsert<"suppliers">) => {
      const { data, error } = await supabase.from("suppliers").insert(supplier).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"suppliers"> & { id: string }) => {
      const { data, error } = await supabase.from("suppliers").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });
}

export function usePurchaseOrders() {
  return useQuery({
    queryKey: ["purchase_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*, suppliers(name), purchase_order_lines(*, products(name))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      order,
      lines,
    }: {
      order: TablesInsert<"purchase_orders">;
      lines: Omit<TablesInsert<"purchase_order_lines">, "order_id">[];
    }) => {
      const { data: po, error: poErr } = await supabase
        .from("purchase_orders")
        .insert(order)
        .select()
        .single();
      if (poErr) throw poErr;

      if (lines.length > 0) {
        const linesWithOrder = lines.map((l) => ({ ...l, order_id: po.id }));
        const { error: lErr } = await supabase.from("purchase_order_lines").insert(linesWithOrder);
        if (lErr) throw lErr;
      }
      return po;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase_orders"] }),
  });
}

export function useUpdatePurchaseOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("purchase_orders")
        .update({ status: status as any })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchase_orders"] }),
  });
}

export function useSupplierInvoices() {
  return useQuery({
    queryKey: ["supplier_invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplier_invoices")
        .select("*, suppliers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
