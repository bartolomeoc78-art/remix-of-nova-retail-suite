import { Users, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Customers = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión de clientes B2C y B2B</p>
      </div>
      <Button className="gap-2"><Plus className="h-4 w-4" />Nuevo cliente</Button>
    </div>
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Buscar por nombre, NIF o email..." className="pl-9" />
    </div>
    <Card className="border shadow-sm">
      <CardContent className="p-12 text-center">
        <Users className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Sin clientes registrados</h3>
        <p className="text-sm text-muted-foreground mt-1">Los clientes son opcionales. Puedes vender sin registrar cliente.</p>
      </CardContent>
    </Card>
  </div>
);

export default Customers;
