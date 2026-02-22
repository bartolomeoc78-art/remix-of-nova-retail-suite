import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ProductSearch } from "@/components/pos/ProductSearch";
import { CartPanel } from "@/components/pos/CartPanel";
import { PaymentDialog } from "@/components/pos/PaymentDialog";
import { usePOS, type PaymentMethod } from "@/hooks/usePOS";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle } from "lucide-react";

const POS = () => {
  const {
    cart,
    addToCart,
    updateQuantity,
    updateDiscount,
    removeFromCart,
    clearCart,
    totals,
    completeSale,
    processing,
  } = usePOS();

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [lastSale, setLastSale] = useState<{ sale_number: number; total: number } | null>(null);
  const { toast } = useToast();

  const handleCheckout = () => {
    setPaymentOpen(true);
  };

  const handlePayment = async (method: PaymentMethod) => {
    try {
      const sale = await completeSale(method);
      if (sale) {
        setLastSale({ sale_number: sale.sale_number, total: sale.total });
        setPaymentOpen(false);
        toast({
          title: "✅ Venta completada",
          description: `Ticket #${sale.sale_number} — ${new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(sale.total)}`,
        });
        // Auto-dismiss success
        setTimeout(() => setLastSale(null), 4000);
      }
    } catch (e: any) {
      toast({ title: "Error en la venta", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex gap-4">
      {/* Product search area */}
      <div className="flex-1 flex flex-col min-w-0">
        {lastSale && (
          <div className="mb-3 flex items-center gap-3 p-3 rounded-xl bg-module-inventory-light border border-module-inventory/20 animate-in fade-in">
            <CheckCircle className="h-5 w-5 text-module-inventory shrink-0" />
            <span className="text-sm font-medium text-module-inventory">
              Ticket #{lastSale.sale_number} completado
            </span>
          </div>
        )}
        <ProductSearch onSelect={addToCart} />
      </div>

      {/* Cart sidebar */}
      <Card className="w-80 shrink-0 border-0 shadow-md flex flex-col overflow-hidden rounded-2xl">
        <CartPanel
          cart={cart}
          totals={totals}
          onUpdateQuantity={updateQuantity}
          onUpdateDiscount={updateDiscount}
          onRemove={removeFromCart}
          onClear={clearCart}
          onCheckout={handleCheckout}
          processing={processing}
        />
      </Card>

      {/* Payment dialog */}
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={totals.total}
        onConfirm={handlePayment}
        processing={processing}
      />
    </div>
  );
};

export default POS;
