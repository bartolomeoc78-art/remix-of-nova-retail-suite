import { useState } from "react";
import { Truck, Plus, Search, Edit, Package, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSuppliers, useCreateSupplier, useUpdateSupplier, usePurchaseOrders, useUpdatePurchaseOrderStatus, useSupplierInvoices } from "@/hooks/useSuppliers";
import { SupplierFormDialog } from "@/components/suppliers/SupplierFormDialog";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const poStatusColors: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  enviado: "bg-blue-100 text-blue-700",
  en_camino: "bg-amber-100 text-amber-700",
  recibido: "bg-green-100 text-green-700",
  facturado: "bg-suppliers-light text-suppliers",
  cancelado: "bg-destructive/10 text-destructive",
};

const poStatusFlow: Record<string, string> = {
  borrador: "enviado",
  enviado: "en_camino",
  en_camino: "recibido",
  recibido: "facturado",
};

const Suppliers = () => {
  const [search, setSearch] = useState("");
  const [supplierDialog, setSupplierDialog] = useState(false);
  const [editSupplier, setEditSupplier] = useState<any>(null);

  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const { data: purchaseOrders, isLoading: loadingPOs } = usePurchaseOrders();
  const updatePOStatus = useUpdatePurchaseOrderStatus();
  const { data: supplierInvoices, isLoading: loadingSI } = useSupplierInvoices();

  const filtered = suppliers?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nif?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveSupplier = (data: any) => {
    if (data.id) {
      updateSupplier.mutate(data, { onSuccess: () => toast.success("Proveedor actualizado") });
    } else {
      createSupplier.mutate(data, { onSuccess: () => toast.success("Proveedor creado") });
    }
  };

  const handleAdvanceStatus = (id: string, currentStatus: string) => {
    const next = poStatusFlow[currentStatus];
    if (!next) return;
    updatePOStatus.mutate({ id, status: next }, {
      onSuccess: () => toast.success(`Pedido avanzado a: ${next.replace("_", " ")}`),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Proveedores y Compras</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión de proveedores, pedidos y facturas recibidas</p>
        </div>
        <Button className="gap-2 bg-suppliers hover:bg-suppliers/90" onClick={() => { setEditSupplier(null); setSupplierDialog(true); }}>
          <Plus className="h-4 w-4" />Nuevo proveedor
        </Button>
      </div>

      <Tabs defaultValue="suppliers">
        <TabsList>
          <TabsTrigger value="suppliers" className="gap-1"><Truck className="h-4 w-4" />Proveedores</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1"><Package className="h-4 w-4" />Pedidos</TabsTrigger>
          <TabsTrigger value="invoices" className="gap-1"><FileText className="h-4 w-4" />Facturas recibidas</TabsTrigger>
        </TabsList>

        {/* SUPPLIERS TAB */}
        <TabsContent value="suppliers" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar proveedor..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              {loadingSuppliers ? (
                <div className="p-12 text-center text-muted-foreground">Cargando…</div>
              ) : !filtered?.length ? (
                <div className="p-12 text-center">
                  <Truck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Sin proveedores</h3>
                  <p className="text-sm text-muted-foreground mt-1">Registra tu primer proveedor.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>NIF</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Días pago</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.nif ?? "—"}</TableCell>
                        <TableCell>{s.email ?? "—"}</TableCell>
                        <TableCell>{s.phone ?? "—"}</TableCell>
                        <TableCell>{s.payment_days ?? 30}d</TableCell>
                        <TableCell>
                          <Badge variant={s.active ? "default" : "secondary"}>
                            {s.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => { setEditSupplier(s); setSupplierDialog(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PURCHASE ORDERS TAB */}
        <TabsContent value="orders" className="space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              {loadingPOs ? (
                <div className="p-12 text-center text-muted-foreground">Cargando…</div>
              ) : !purchaseOrders?.length ? (
                <div className="p-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Sin pedidos</h3>
                  <p className="text-sm text-muted-foreground mt-1">Los pedidos de compra se crearán próximamente.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-mono">#{po.order_number}</TableCell>
                        <TableCell>{(po.suppliers as any)?.name}</TableCell>
                        <TableCell className="text-sm">{format(new Date(po.created_at), "dd MMM yyyy", { locale: es })}</TableCell>
                        <TableCell className="text-right font-medium">{Number(po.total).toFixed(2)} €</TableCell>
                        <TableCell>
                          <Badge className={poStatusColors[po.status] ?? ""}>{po.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          {poStatusFlow[po.status] && (
                            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleAdvanceStatus(po.id, po.status)}>
                              <ArrowRight className="h-3 w-3" />{poStatusFlow[po.status].replace("_", " ")}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUPPLIER INVOICES TAB */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              {loadingSI ? (
                <div className="p-12 text-center text-muted-foreground">Cargando…</div>
              ) : !supplierInvoices?.length ? (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Sin facturas de proveedor</h3>
                  <p className="text-sm text-muted-foreground mt-1">Las facturas de proveedor se registrarán con cada recepción.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Factura</TableHead>
                      <TableHead>Proveedor</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Base</TableHead>
                      <TableHead className="text-right">IVA</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Pagada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierInvoices.map((si) => (
                      <TableRow key={si.id}>
                        <TableCell className="font-mono text-sm">{si.invoice_number ?? "—"}</TableCell>
                        <TableCell>{(si.suppliers as any)?.name}</TableCell>
                        <TableCell className="text-sm">{format(new Date(si.created_at), "dd MMM yyyy", { locale: es })}</TableCell>
                        <TableCell className="text-right">{Number(si.subtotal).toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{Number(si.tax_total).toFixed(2)} €</TableCell>
                        <TableCell className="text-right font-medium">{Number(si.total).toFixed(2)} €</TableCell>
                        <TableCell>
                          <Badge variant={si.paid ? "default" : "outline"}>
                            {si.paid ? "Pagada" : "Pendiente"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Supplier form dialog */}
      {supplierDialog && (
        <SupplierFormDialog
          open={supplierDialog}
          onOpenChange={setSupplierDialog}
          supplier={editSupplier}
          onSubmit={handleSaveSupplier}
        />
      )}
    </div>
  );
};

export default Suppliers;
