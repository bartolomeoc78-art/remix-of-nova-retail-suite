import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useProductsForSelect, useCreateAdjustment } from "@/hooks/useInventory";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

const reasons = [
  "Rotura / daño",
  "Caducidad",
  "Error de recepción",
  "Corrección manual",
  "Merma / pérdida",
  "Inventario inicial",
  "Otro",
];

export function AdjustmentDialog({ open, onOpenChange }: Props) {
  const { session } = useAuth();
  const { toast } = useToast();
  const { data: products } = useProductsForSelect();
  const mutation = useCreateAdjustment();

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const selectedProduct = products?.find((p) => p.id === productId);

  const handleSubmit = async () => {
    if (!productId || !quantity || !reason || !session?.user?.id) return;
    try {
      await mutation.mutateAsync({
        product_id: productId,
        quantity: parseFloat(quantity),
        reason,
        notes,
        user_id: session.user.id,
      });
      toast({ title: "Ajuste registrado" });
      onOpenChange(false);
      setProductId(""); setQuantity(""); setReason(""); setNotes("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajuste manual de stock</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Producto</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.sku || "sin SKU"}) — Stock: {p.stock_on_hand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cantidad (positiva = entrada, negativa = salida)</Label>
            <Input
              type="number"
              placeholder="ej: -2 o +5"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            {selectedProduct && quantity && (
              <p className="text-xs text-muted-foreground">
                Stock actual: {selectedProduct.stock_on_hand} → Nuevo: {selectedProduct.stock_on_hand + parseFloat(quantity || "0")}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Motivo (obligatorio)</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar motivo" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notas adicionales</Label>
            <Textarea
              placeholder="Detalles del ajuste..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!productId || !quantity || !reason || mutation.isPending}
            className="bg-module-inventory hover:bg-module-inventory/90"
          >
            {mutation.isPending ? "Guardando..." : "Registrar ajuste"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
