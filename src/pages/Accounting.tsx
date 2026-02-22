import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Accounting = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold">Contabilidad</h1>
      <p className="text-sm text-muted-foreground mt-1">Plan contable PGC, asientos, libro diario, mayor y balances</p>
    </div>
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Contabilidad PGC</h3>
        <p className="text-sm text-muted-foreground mt-1">Los asientos se generarán automáticamente con cada operación.</p>
      </CardContent>
    </Card>
  </div>
);

export default Accounting;
