import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SettingsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-semibold">Configuración</h1>
      <p className="text-sm text-muted-foreground mt-1">Datos de empresa, IVA, roles y preferencias</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { title: "Datos de empresa", desc: "Nombre, NIF, dirección, logo" },
        { title: "Tipos de IVA", desc: "4%, 10%, 21% y personalización" },
        { title: "Series de facturación", desc: "Numeración correlativa por serie" },
        { title: "Usuarios y roles", desc: "Admin, Manager, Cajero, Contable..." },
        { title: "Plan contable", desc: "Cuentas PGC y mapeos" },
        { title: "E-commerce", desc: "Webhooks y sincronización" },
      ].map((item) => (
        <Card key={item.title} className="border shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default SettingsPage;
