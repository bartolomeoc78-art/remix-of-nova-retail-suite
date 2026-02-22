import { Receipt, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Expenses = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Gastos</h1>
        <p className="text-sm text-muted-foreground mt-1">Registro de gastos con categorías contables e IVA</p>
      </div>
      <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo gasto</Button>
    </div>
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <Receipt className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Sin gastos registrados</h3>
        <p className="text-sm text-muted-foreground mt-1">Registra gastos para el control contable y fiscal.</p>
      </CardContent>
    </Card>
  </div>
);

export default Expenses;
