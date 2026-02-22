import { useState } from "react";
import {
  Warehouse, ArrowDownUp, ClipboardCheck, ArrowDown, ArrowUp,
  Package, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryMovements, useLowStockProducts } from "@/hooks/useInventory";
import { AdjustmentDialog } from "@/components/inventory/AdjustmentDialog";

const moveTypeLabels: Record<string, { label: string; color: string }> = {
  compra: { label: "Compra", color: "bg-module-suppliers-light text-module-suppliers" },
  venta: { label: "Venta", color: "bg-module-sales-light text-module-sales" },
  devolucion: { label: "Devolución", color: "bg-module-invoicing-light text-module-invoicing" },
  ajuste: { label: "Ajuste", color: "bg-module-cash-light text-module-cash" },
  recuento: { label: "Recuento", color: "bg-module-reports-light text-module-reports" },
  ecommerce: { label: "E-commerce", color: "bg-module-accounting-light text-module-accounting" },
};

const fmt = (n: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

const Inventory = () => {
  const [adjustOpen, setAdjustOpen] = useState(false);
  const { data: movements, isLoading } = useInventoryMovements();
  const { data: lowStock } = useLowStockProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Inventario</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control de stock, movimientos y recuentos
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setAdjustOpen(true)}>
            <ArrowDownUp className="h-4 w-4" />
            Ajuste manual
          </Button>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock && lowStock.length > 0 && (
        <Card className="border-module-customers/20 bg-module-customers-light border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-module-customers" />
              <span className="text-sm font-medium text-module-customers">
                {lowStock.length} producto{lowStock.length > 1 ? "s" : ""} bajo stock mínimo
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {lowStock.slice(0, 8).map((p: any) => (
                <Badge key={p.id} variant="secondary" className="text-xs bg-background">
                  {p.name}: {p.stock_on_hand}/{p.stock_min}
                </Badge>
              ))}
              {lowStock.length > 8 && (
                <Badge variant="secondary" className="text-xs">+{lowStock.length - 8} más</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="movements">
        <TabsList>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="low-stock">Stock bajo ({lowStock?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="movements" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : movements && movements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                      <TableHead className="text-right">Coste unit.</TableHead>
                      <TableHead>Motivo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((m: any) => {
                      const typeInfo = moveTypeLabels[m.move_type] || { label: m.move_type, color: "bg-secondary" };
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(m.created_at).toLocaleDateString("es-ES", {
                              day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm">{m.products?.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{m.products?.sku || ""}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${typeInfo.color} border-0 text-xs`}>
                              {typeInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium flex items-center justify-end gap-1 ${m.quantity > 0 ? "text-module-inventory" : "text-module-expenses"}`}>
                              {m.quantity > 0 ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                              {m.quantity > 0 ? "+" : ""}{m.quantity}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {m.unit_cost ? fmt(m.unit_cost) : "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                            {m.reason || m.notes || "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center">
                  <div className="h-16 w-16 rounded-2xl bg-module-inventory-light flex items-center justify-center mx-auto mb-4">
                    <Warehouse className="h-8 w-8 text-module-inventory" />
                  </div>
                  <h3 className="text-lg font-medium">Sin movimientos de inventario</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Los movimientos se generan automáticamente con ventas, compras y ajustes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low-stock" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              {lowStock && lowStock.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Stock actual</TableHead>
                      <TableHead className="text-right">Stock mín.</TableHead>
                      <TableHead className="text-right">Faltante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStock.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.sku || ""}</div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{p.categories?.name || "—"}</TableCell>
                        <TableCell className="text-right text-module-expenses font-medium">{p.stock_on_hand}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{p.stock_min}</TableCell>
                        <TableCell className="text-right font-medium text-module-expenses">
                          {(p.stock_min ?? 0) - p.stock_on_hand}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-12 text-center">
                  <Package className="h-12 w-12 text-module-inventory mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Todo en orden</h3>
                  <p className="text-sm text-muted-foreground mt-1">No hay productos bajo stock mínimo.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdjustmentDialog open={adjustOpen} onOpenChange={setAdjustOpen} />
    </div>
  );
};

export default Inventory;
