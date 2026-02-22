import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Customer } from "@/hooks/useCustomers";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onSubmit: (data: any) => Promise<void>;
  loading: boolean;
};

export function CustomerFormDialog({ open, onOpenChange, customer, onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    name: customer?.name || "",
    nif: customer?.nif || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    postal_code: customer?.postal_code || "",
    is_business: customer?.is_business || false,
    credit_allowed: customer?.credit_allowed || false,
    notes: customer?.notes || "",
  });

  // Reset form when customer changes
  useState(() => {
    if (customer) {
      setForm({
        name: customer.name, nif: customer.nif || "", email: customer.email || "",
        phone: customer.phone || "", address: customer.address || "", city: customer.city || "",
        postal_code: customer.postal_code || "", is_business: customer.is_business || false,
        credit_allowed: customer.credit_allowed || false, notes: customer.notes || "",
      });
    } else {
      setForm({
        name: "", nif: "", email: "", phone: "", address: "", city: "",
        postal_code: "", is_business: false, credit_allowed: false, notes: "",
      });
    }
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({
      name: form.name.trim(),
      nif: form.nif || null,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      city: form.city || null,
      postal_code: form.postal_code || null,
      is_business: form.is_business,
      credit_allowed: form.credit_allowed,
      notes: form.notes || null,
    });
  };

  const update = (field: string, value: any) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{customer ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label>Nombre *</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nombre completo o razón social" />
            </div>
            <div className="space-y-2">
              <Label>NIF / CIF</Label>
              <Input value={form.nif} onChange={(e) => update("nif", e.target.value)} placeholder="12345678A" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@ejemplo.com" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="600 000 000" />
            </div>
            <div className="space-y-2">
              <Label>Ciudad</Label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Valladolid" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Dirección</Label>
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Calle, número..." />
            </div>
            <div className="space-y-2">
              <Label>Código postal</Label>
              <Input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} placeholder="47001" />
            </div>
          </div>

          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <Label className="text-sm font-medium">Empresa / B2B</Label>
              <p className="text-xs text-muted-foreground">Marcar si es cliente empresarial</p>
            </div>
            <Switch checked={form.is_business} onCheckedChange={(v) => update("is_business", v)} />
          </div>

          <div className="flex items-center justify-between border rounded-lg p-3">
            <div>
              <Label className="text-sm font-medium">Permitir crédito</Label>
              <p className="text-xs text-muted-foreground">Permitir venta a crédito</p>
            </div>
            <Switch checked={form.credit_allowed} onCheckedChange={(v) => update("credit_allowed", v)} />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} placeholder="Notas internas..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            disabled={!form.name.trim() || loading}
            className="bg-module-customers hover:bg-module-customers/90"
          >
            {loading ? "Guardando..." : customer ? "Actualizar" : "Crear cliente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
