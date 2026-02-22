import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, ShoppingCart, Landmark, AlertTriangle, ArrowUpRight } from "lucide-react";

const kpis = [
  { title: "Ventas hoy", value: "€1,284.50", change: "+12.5%", icon: ShoppingCart, up: true },
  { title: "Margen bruto", value: "34.2%", change: "+2.1%", icon: TrendingUp, up: true },
  { title: "Stock crítico", value: "7", change: "productos", icon: AlertTriangle, up: false },
  { title: "Caja del día", value: "€856.00", change: "abierta", icon: Landmark, up: true },
];

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Bienvenido a NovaSystem</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen del día — Lunes, 24 de febrero de 2026
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.up ? "text-nova-success" : "text-nova-warning"}`}>
                {kpi.up && <ArrowUpRight className="h-3 w-3" />}
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ventas últimos 7 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              Gráfico de ventas (conectar con datos reales)
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-nova-warning" />
              <span className="text-muted-foreground">7 productos bajo stock mínimo</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">3 lotes próximos a caducar</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2 w-2 rounded-full bg-nova-info" />
              <span className="text-muted-foreground">2 facturas proveedor vencidas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {["Nueva venta (TPV)", "Crear pedido proveedor", "Registrar recepción", "Exportar informe"].map((action) => (
          <button
            key={action}
            className="px-4 py-2 text-sm font-medium rounded-lg border bg-background hover:bg-accent transition-colors"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
