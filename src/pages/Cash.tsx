import { Landmark, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Cash = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Caja y Bancos</h1>
        <p className="text-sm text-muted-foreground mt-1">Sesiones de caja, bancos y conciliación</p>
      </div>
      <Button className="gap-2"><DollarSign className="h-4 w-4" />Abrir caja</Button>
    </div>
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <Landmark className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Sin sesiones de caja</h3>
        <p className="text-sm text-muted-foreground mt-1">Abre una sesión de caja para comenzar a registrar movimientos.</p>
      </CardContent>
    </Card>
  </div>
);

export default Cash;
