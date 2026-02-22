import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type CartItem = {
  product: Tables<"products"> & { tax_rates?: { rate: number; name: string } | null };
  quantity: number;
  discountPercent: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
};

export type PaymentMethod = "efectivo" | "tarjeta" | "bizum" | "transferencia" | "mixto";

function recalcLine(item: CartItem): CartItem {
  const base = item.unitPrice * item.quantity;
  const discount = base * (item.discountPercent / 100);
  const subtotal = base - discount;
  const taxAmount = subtotal * (item.taxRate / 100);
  const total = subtotal + taxAmount;
  return { ...item, subtotal: Math.round(subtotal * 100) / 100, taxAmount: Math.round(taxAmount * 100) / 100, total: Math.round(total * 100) / 100 };
}

export function usePOS() {
  const { session } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const addToCart = useCallback((product: CartItem["product"]) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = recalcLine({ ...updated[idx], quantity: updated[idx].quantity + 1 });
        return updated;
      }
      const taxRate = product.tax_rates?.rate ?? 21;
      const newItem: CartItem = {
        product,
        quantity: 1,
        discountPercent: 0,
        unitPrice: product.sale_price,
        taxRate,
        subtotal: 0,
        taxAmount: 0,
        total: 0,
      };
      return [...prev, recalcLine(newItem)];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) => prev.map((i) => (i.product.id === productId ? recalcLine({ ...i, quantity }) : i)));
  }, []);

  const updateDiscount = useCallback((productId: string, discountPercent: number) => {
    setCart((prev) => prev.map((i) => (i.product.id === productId ? recalcLine({ ...i, discountPercent }) : i)));
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setCustomerId(null);
    setNotes("");
  }, []);

  const totals = cart.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + item.subtotal,
      taxTotal: acc.taxTotal + item.taxAmount,
      discountTotal: acc.discountTotal + (item.unitPrice * item.quantity * item.discountPercent) / 100,
      total: acc.total + item.total,
    }),
    { subtotal: 0, taxTotal: 0, discountTotal: 0, total: 0 }
  );

  const completeSale = useCallback(
    async (paymentMethod: PaymentMethod) => {
      if (!session?.user?.id || cart.length === 0) return null;
      setProcessing(true);
      try {
        // 1. Create sale
        const { data: sale, error: saleError } = await supabase
          .from("sales")
          .insert({
            user_id: session.user.id,
            customer_id: customerId,
            payment_method: paymentMethod,
            subtotal: Math.round(totals.subtotal * 100) / 100,
            tax_total: Math.round(totals.taxTotal * 100) / 100,
            discount_total: Math.round(totals.discountTotal * 100) / 100,
            total: Math.round(totals.total * 100) / 100,
            notes: notes || null,
            status: "completada",
          })
          .select()
          .single();
        if (saleError) throw saleError;

        // 2. Create sale lines
        const lines = cart.map((item) => ({
          sale_id: sale.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_percent: item.discountPercent,
          tax_rate: item.taxRate,
          cost_price: item.product.cost_price,
          subtotal: item.subtotal,
          tax_amount: item.taxAmount,
          total: item.total,
        }));
        const { error: linesError } = await supabase.from("sale_lines").insert(lines);
        if (linesError) throw linesError;

        // 3. Update stock
        for (const item of cart) {
          const { error: stockError } = await supabase
            .from("products")
            .update({ stock_on_hand: item.product.stock_on_hand - item.quantity })
            .eq("id", item.product.id);
          if (stockError) console.error("Stock update error:", stockError);

          // 4. Inventory movement
          await supabase.from("inventory_movements").insert({
            product_id: item.product.id,
            move_type: "venta",
            quantity: -item.quantity,
            unit_cost: item.product.cost_price,
            reference_type: "sale",
            reference_id: sale.id,
            user_id: session.user.id,
          });
        }

        clearCart();
        return sale;
      } finally {
        setProcessing(false);
      }
    },
    [session, cart, customerId, notes, totals, clearCart]
  );

  return {
    cart,
    addToCart,
    updateQuantity,
    updateDiscount,
    removeFromCart,
    clearCart,
    totals,
    customerId,
    setCustomerId,
    notes,
    setNotes,
    completeSale,
    processing,
  };
}
