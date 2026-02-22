import { Minus, Plus, Trash2, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { CartItem } from "@/hooks/usePOS";
import { useState } from "react";

type Props = {
  cart: CartItem[];
  totals: { subtotal: number; taxTotal: number; discountTotal: number; total: number };
  onUpdateQuantity: (productId: string, qty: number) => void;
  onUpdateDiscount: (productId: string, discount: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  processing: boolean;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export function CartPanel({
  cart,
  totals,
  onUpdateQuantity,
  onUpdateDiscount,
  onRemove,
  onClear,
  onCheckout,
  processing,
}: Props) {
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-sm text-foreground">Ticket</h3>
          <p className="text-xs text-muted-foreground">
            {cart.length} {cart.length === 1 ? "artículo" : "artículos"}
          </p>
        </div>
        {cart.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs text-muted-foreground hover:text-module-expenses">
            Vaciar
          </Button>
        )}
      </div>

      {/* Items */}
      <ScrollArea className="flex-1">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center h-full py-12">
            <p className="text-sm text-muted-foreground">Carrito vacío</p>
          </div>
        ) : (
          <div className="divide-y">
            {cart.map((item) => (
              <div key={item.product.id} className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(item.unitPrice)} × {item.quantity}
                      {item.discountPercent > 0 && (
                        <span className="text-module-invoicing ml-1">-{item.discountPercent}%</span>
                      )}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                    {fmt(item.total)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                    className="h-7 w-12 text-center text-sm px-1 rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>

                  {/* Discount toggle */}
                  {editingDiscount === item.product.id ? (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      autoFocus
                      placeholder="%"
                      value={item.discountPercent || ""}
                      onChange={(e) => onUpdateDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                      onBlur={() => setEditingDiscount(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingDiscount(null)}
                      className="h-7 w-14 text-center text-sm px-1 rounded-lg"
                    />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-module-invoicing"
                      onClick={() => setEditingDiscount(item.product.id)}
                      title="Descuento"
                    >
                      <Percent className="h-3 w-3" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-muted-foreground hover:text-module-expenses ml-auto"
                    onClick={() => onRemove(item.product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Totals & checkout */}
      <div className="p-4 border-t space-y-2 bg-card">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{fmt(totals.subtotal)}</span>
        </div>
        {totals.discountTotal > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-module-invoicing">Descuento</span>
            <span className="text-module-invoicing">-{fmt(totals.discountTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">IVA</span>
          <span>{fmt(totals.taxTotal)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold border-t pt-3">
          <span>Total</span>
          <span>{fmt(totals.total)}</span>
        </div>
        <Button
          className="w-full h-12 text-base font-semibold rounded-xl bg-module-sales hover:bg-module-sales/90"
          size="lg"
          disabled={cart.length === 0 || processing}
          onClick={onCheckout}
        >
          {processing ? "Procesando..." : `Cobrar ${fmt(totals.total)}`}
        </Button>
      </div>
    </div>
  );
}
