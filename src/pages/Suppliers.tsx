import { Truck, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Suppliers = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Proveedores</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión de proveedores, pedidos y compras</p>
      </div>
      <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo proveedor</Button>
    </div>
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <Truck className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Sin proveedores</h3>
        <p className="text-sm text-muted-foreground mt-1">Registra tus proveedores para gestionar pedidos de compra.</p>
      </CardContent>
    </Card>
  </div>
);

export default Suppliers;
