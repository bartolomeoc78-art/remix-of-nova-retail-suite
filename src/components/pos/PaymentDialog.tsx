import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banknote, CreditCard, Smartphone, ArrowRightLeft } from "lucide-react";
import { useState } from "react";
import type { PaymentMethod } from "@/hooks/usePOS";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  onConfirm: (method: PaymentMethod) => void;
  processing: boolean;
};

const methods: { id: PaymentMethod; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: "efectivo", label: "Efectivo", icon: Banknote, color: "text-module-inventory", bg: "bg-module-inventory-light" },
  { id: "tarjeta", label: "Tarjeta", icon: CreditCard, color: "text-module-sales", bg: "bg-module-sales-light" },
  { id: "bizum", label: "Bizum", icon: Smartphone, color: "text-module-products", bg: "bg-module-products-light" },
  { id: "transferencia", label: "Transferencia", icon: ArrowRightLeft, color: "text-module-suppliers", bg: "bg-module-suppliers-light" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

export function PaymentDialog({ open, onOpenChange, total, onConfirm, processing }: Props) {
  const [selected, setSelected] = useState<PaymentMethod>("efectivo");
  const [cashAmount, setCashAmount] = useState("");

  const change = selected === "efectivo" ? (parseFloat(cashAmount) || 0) - total : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Cobrar</DialogTitle>
        </DialogHeader>

        <div className="text-center mb-4">
          <span className="text-3xl font-bold text-foreground">{fmt(total)}</span>
        </div>

        {/* Payment methods */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selected === m.id
                  ? `border-module-sales ${m.bg}`
                  : "border-transparent bg-secondary hover:bg-accent"
              }`}
            >
              <div className={`h-9 w-9 rounded-lg ${m.bg} flex items-center justify-center`}>
                <m.icon className={`h-4 w-4 ${m.color}`} />
              </div>
              <span className="text-sm font-medium">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Cash input */}
        {selected === "efectivo" && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-sm text-muted-foreground">Entregado</label>
              <Input
                type="number"
                step="0.01"
                min={0}
                autoFocus
                placeholder="0.00"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                className="h-12 text-xl text-center font-semibold rounded-xl"
              />
            </div>
            {parseFloat(cashAmount) >= total && (
              <div className="flex justify-between items-center p-3 rounded-xl bg-module-inventory-light">
                <span className="text-sm font-medium text-module-inventory">Cambio</span>
                <span className="text-lg font-bold text-module-inventory">{fmt(change)}</span>
              </div>
            )}
            {/* Quick amounts */}
            <div className="flex gap-2">
              {[5, 10, 20, 50].map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg"
                  onClick={() => setCashAmount(String(amt))}
                >
                  €{amt}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="flex-1 rounded-lg"
                onClick={() => setCashAmount(String(Math.ceil(total)))}
              >
                Exacto
              </Button>
            </div>
          </div>
        )}

        <Button
          className="w-full h-12 text-base font-semibold rounded-xl bg-module-sales hover:bg-module-sales/90"
          disabled={processing || (selected === "efectivo" && (parseFloat(cashAmount) || 0) < total)}
          onClick={() => onConfirm(selected)}
        >
          {processing ? "Procesando..." : `Confirmar pago`}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
