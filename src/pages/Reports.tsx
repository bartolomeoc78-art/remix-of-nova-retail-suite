import { BarChart3, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Reports = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Informes</h1>
        <p className="text-sm text-muted-foreground mt-1">Informes de ventas, inventario, fiscalidad y análisis</p>
      </div>
      <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Exportar PDF</Button>
    </div>
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Informes disponibles próximamente</h3>
        <p className="text-sm text-muted-foreground mt-1">Los informes se generarán con los datos del sistema.</p>
      </CardContent>
    </Card>
  </div>
);

export default Reports;
