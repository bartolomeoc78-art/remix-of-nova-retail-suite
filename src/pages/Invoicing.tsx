import { FileText, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Invoicing = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Facturación</h1>
        <p className="text-sm text-muted-foreground mt-1">Facturas emitidas, simplificadas y rectificativas</p>
      </div>
      <Button className="gap-2"><Plus className="h-4 w-4" />Nueva factura</Button>
    </div>
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Sin facturas</h3>
        <p className="text-sm text-muted-foreground mt-1">Las facturas se generarán automáticamente con cada venta.</p>
      </CardContent>
    </Card>
  </div>
);

export default Invoicing;
