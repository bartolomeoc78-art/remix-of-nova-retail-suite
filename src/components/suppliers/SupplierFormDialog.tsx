import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: any;
  onSubmit: (data: any) => void;
}

export function SupplierFormDialog({ open, onOpenChange, supplier, onSubmit }: SupplierFormDialogProps) {
  const [form, setForm] = useState(() => ({
    name: supplier?.name ?? "",
    nif: supplier?.nif ?? "",
    email: supplier?.email ?? "",
    phone: supplier?.phone ?? "",
    address: supplier?.address ?? "",
    city: supplier?.city ?? "",
    postal_code: supplier?.postal_code ?? "",
    iban: supplier?.iban ?? "",
    payment_terms: supplier?.payment_terms ?? "",
    payment_days: supplier?.payment_days ?? 30,
    notes: supplier?.notes ?? "",
    active: supplier?.active ?? true,
  }));

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit({ ...form, ...(supplier && { id: supplier.id }) });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplier ? "Editar proveedor" : "Nuevo proveedor"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>NIF/CIF</Label>
            <Input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>IBAN</Label>
            <Input value={form.iban} onChange={(e) => setForm({ ...form, iban: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label>Dirección</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div>
            <Label>Ciudad</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <Label>C.P.</Label>
            <Input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
          </div>
          <div>
            <Label>Condiciones pago</Label>
            <Input value={form.payment_terms} onChange={(e) => setForm({ ...form, payment_terms: e.target.value })} />
          </div>
          <div>
            <Label>Días pago</Label>
            <Input type="number" value={form.payment_days} onChange={(e) => setForm({ ...form, payment_days: parseInt(e.target.value) || 30 })} />
          </div>
          <div className="col-span-2">
            <Label>Notas</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <Label>Activo</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim()}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
