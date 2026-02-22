import { Package, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Products = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Productos</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión del catálogo de productos</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre, SKU o EAN..." className="pl-9" />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium text-foreground">Sin productos aún</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Añade tu primer producto para empezar a gestionar el catálogo, inventario y ventas.
            </p>
            <Button className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Crear producto
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
