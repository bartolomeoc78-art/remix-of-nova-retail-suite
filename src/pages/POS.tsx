import { ShoppingCart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const POS = () => {
  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Product search area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Escanear código de barras o buscar producto..."
            className="pl-9 h-11 text-base"
            autoFocus
          />
        </div>
        <Card className="flex-1 border shadow-sm">
          <CardContent className="h-full flex items-center justify-center p-12">
            <div className="text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">Punto de Venta</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Escanea un producto o búscalo para iniciar una venta
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart sidebar */}
      <div className="w-80 shrink-0 flex flex-col">
        <Card className="flex-1 border shadow-sm flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Carrito</h3>
            <p className="text-xs text-muted-foreground">0 artículos</p>
          </div>
          <CardContent className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Carrito vacío</p>
          </CardContent>
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">€0.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA</span>
              <span className="font-medium">€0.00</span>
            </div>
            <div className="flex justify-between text-base font-semibold border-t pt-3">
              <span>Total</span>
              <span>€0.00</span>
            </div>
            <Button className="w-full" size="lg" disabled>
              Cobrar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default POS;
