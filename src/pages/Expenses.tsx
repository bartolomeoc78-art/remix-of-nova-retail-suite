import { useState } from "react";
import { Receipt, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useExpenses, useCreateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = [
  "Suministros", "Alquiler", "Seguros", "Transporte", "Material oficina",
  "Marketing", "Servicios profesionales", "Mantenimiento", "Otros",
];

const paymentMethods = [
  { value: "efectivo", label: "Efectivo" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "transferencia", label: "Transferencia" },
  { value: "bizum", label: "Bizum" },
];

const Expenses = () => {
  const { session: authSession } = useAuth();
  const userId = authSession?.user?.id;

  const { data: expenses, isLoading } = useExpenses();
  const { data: suppliers } = useSuppliers();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    category: "Otros",
    amount: "",
    tax_rate: "21",
    payment_method: "transferencia",
    supplier_id: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const filtered = expenses?.filter((e) =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totals = filtered?.reduce(
    (acc, e) => ({ base: acc.base + Number(e.amount), tax: acc.tax + Number(e.tax_amount), total: acc.total + Number(e.total) }),
    { base: 0, tax: 0, total: 0 }
  ) ?? { base: 0, tax: 0, total: 0 };

  const handleCreate = () => {
    const amount = parseFloat(form.amount) || 0;
    const taxRate = parseFloat(form.tax_rate) || 0;
    const taxAmount = amount * (taxRate / 100);
    const total = amount + taxAmount;

    createExpense.mutate({
      description: form.description,
      category: form.category,
      amount,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total,
      payment_method: form.payment_method as any,
      supplier_id: form.supplier_id || null,
      expense_date: form.expense_date,
      user_id: userId ?? null,
    }, {
      onSuccess: () => {
        toast.success("Gasto registrado");
        setDialogOpen(false);
        setForm({ description: "", category: "Otros", amount: "", tax_rate: "21", payment_method: "transferencia", supplier_id: "", expense_date: new Date().toISOString().split("T")[0] });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteExpense.mutate(id, { onSuccess: () => toast.success("Gasto eliminado") });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gastos</h1>
          <p className="text-sm text-muted-foreground mt-1">Registro de gastos con IVA soportado y categorías contables</p>
        </div>
        <Button className="gap-2 bg-expenses hover:bg-expenses/90" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />Nuevo gasto
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-expenses">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Base imponible</p>
            <p className="text-xl font-semibold">{totals.base.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-expenses">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">IVA soportado</p>
            <p className="text-xl font-semibold">{totals.tax.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-expenses">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total gastos</p>
            <p className="text-xl font-semibold">{totals.total.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar gasto..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando…</div>
          ) : !filtered?.length ? (
            <div className="p-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Sin gastos registrados</h3>
              <p className="text-sm text-muted-foreground mt-1">Registra tu primer gasto.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="text-sm">{format(new Date(e.expense_date), "dd MMM yyyy", { locale: es })}</TableCell>
                    <TableCell className="font-medium">{e.description}</TableCell>
                    <TableCell><Badge variant="outline">{e.category}</Badge></TableCell>
                    <TableCell>{(e.suppliers as any)?.name ?? "—"}</TableCell>
                    <TableCell className="text-right">{Number(e.amount).toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{Number(e.tax_amount).toFixed(2)} €</TableCell>
                    <TableCell className="text-right font-medium">{Number(e.total).toFixed(2)} €</TableCell>
                    <TableCell><Badge variant="secondary">{e.payment_method}</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(e.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Nuevo gasto</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Descripción *</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <Label>Categoría</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} />
            </div>
            <div>
              <Label>Base imponible (€)</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <Label>Tipo IVA (%)</Label>
              <Select value={form.tax_rate} onValueChange={(v) => setForm({ ...form, tax_rate: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Exento (0%)</SelectItem>
                  <SelectItem value="4">Superreducido (4%)</SelectItem>
                  <SelectItem value="10">Reducido (10%)</SelectItem>
                  <SelectItem value="21">General (21%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Método de pago</Label>
              <Select value={form.payment_method} onValueChange={(v) => setForm({ ...form, payment_method: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => <SelectItem key={pm.value} value={pm.value}>{pm.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Proveedor</Label>
              <Select value={form.supplier_id} onValueChange={(v) => setForm({ ...form, supplier_id: v })}>
                <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Ninguno</SelectItem>
                  {suppliers?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={!form.description.trim() || !form.amount}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;
