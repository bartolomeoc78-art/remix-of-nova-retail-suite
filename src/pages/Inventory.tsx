import { Warehouse, ArrowDownUp, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Inventory = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Inventario</h1>
        <p className="text-sm text-muted-foreground mt-1">Control de stock, movimientos y recuentos</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2"><ArrowDownUp className="h-4 w-4" />Ajuste manual</Button>
        <Button className="gap-2"><ClipboardCheck className="h-4 w-4" />Nuevo recuento</Button>
      </div>
    </div>
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <Warehouse className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Sin movimientos de inventario</h3>
        <p className="text-sm text-muted-foreground mt-1">Los movimientos se generarán automáticamente con ventas, compras y ajustes.</p>
      </CardContent>
    </Card>
  </div>
);

export default Inventory;
