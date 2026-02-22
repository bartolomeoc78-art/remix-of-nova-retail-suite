import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type InventoryMovement = Tables<"inventory_movements"> & {
  products?: { name: string; sku: string | null } | null;
};

export function useInventoryMovements(productId?: string) {
  return useQuery({
    queryKey: ["inventory_movements", productId],
    queryFn: async () => {
      let query = supabase
        .from("inventory_movements")
        .select("*, products(name, sku)")
        .order("created_at", { ascending: false })
        .limit(200);

      if (productId) {
        query = query.eq("product_id", productId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      product_id: string;
      quantity: number;
      reason: string;
      notes?: string;
      user_id: string;
    }) => {
      // Get current stock
      const { data: product, error: pErr } = await supabase
        .from("products")
        .select("stock_on_hand")
        .eq("id", params.product_id)
        .single();
      if (pErr) throw pErr;

      const newStock = product.stock_on_hand + params.quantity;

      // Insert movement
      const { error: mErr } = await supabase.from("inventory_movements").insert({
        product_id: params.product_id,
        move_type: "ajuste",
        quantity: params.quantity,
        reason: params.reason,
        notes: params.notes || null,
        user_id: params.user_id,
      });
      if (mErr) throw mErr;

      // Update stock
      const { error: sErr } = await supabase
        .from("products")
        .update({ stock_on_hand: newStock })
        .eq("id", params.product_id);
      if (sErr) throw sErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory_movements"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useProductsForSelect() {
  return useQuery({
    queryKey: ["products_select"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, stock_on_hand, stock_min")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useLowStockProducts() {
  return useQuery({
    queryKey: ["low_stock_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, stock_on_hand, stock_min, categories(name)")
        .eq("active", true)
        .order("stock_on_hand", { ascending: true });
      if (error) throw error;
      return (data || []).filter((p) => p.stock_on_hand <= (p.stock_min ?? 0));
    },
  });
}
