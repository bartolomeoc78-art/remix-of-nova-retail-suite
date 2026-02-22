import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, ShoppingCart, Landmark, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const kpis = [
  {
    title: "Ventas hoy",
    value: "€1,284.50",
    change: "+12.5%",
    icon: ShoppingCart,
    up: true,
    color: "text-module-sales",
    bg: "bg-module-sales-light",
  },
  {
    title: "Margen bruto",
    value: "34.2%",
    change: "+2.1%",
    icon: TrendingUp,
    up: true,
    color: "text-module-inventory",
    bg: "bg-module-inventory-light",
  },
  {
    title: "Stock crítico",
    value: "7",
    change: "productos",
    icon: AlertTriangle,
    up: false,
    color: "text-module-customers",
    bg: "bg-module-customers-light",
  },
  {
    title: "Caja del día",
    value: "€856.00",
    change: "abierta",
    icon: Landmark,
    up: true,
    color: "text-module-cash",
    bg: "bg-module-cash-light",
  },
];

const quickActions = [
  { label: "Nueva venta", path: "/pos", color: "text-module-sales", bg: "bg-module-sales-light hover:bg-module-sales/10" },
  { label: "Crear pedido", path: "/suppliers", color: "text-module-suppliers", bg: "bg-module-suppliers-light hover:bg-module-suppliers/10" },
  { label: "Registrar recepción", path: "/inventory", color: "text-module-inventory", bg: "bg-module-inventory-light hover:bg-module-inventory/10" },
  { label: "Exportar informe", path: "/reports", color: "text-module-reports", bg: "bg-module-reports-light hover:bg-module-reports/10" },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Bienvenido a NovaSystem</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen del día — {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-0 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`h-9 w-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.up ? "text-nova-success" : "text-module-customers"}`}>
                {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Ventas últimos 7 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm rounded-lg bg-secondary/50">
              Gráfico de ventas (conectar con datos reales)
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-module-customers" />
              <span className="text-muted-foreground">7 productos bajo stock mínimo</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-module-expenses" />
              <span className="text-muted-foreground">3 lotes próximos a caducar</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="h-2.5 w-2.5 rounded-full bg-module-sales" />
              <span className="text-muted-foreground">2 facturas proveedor vencidas</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Acciones rápidas</h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="ghost"
              onClick={() => navigate(action.path)}
              className={`${action.bg} ${action.color} border-0 rounded-xl px-5 h-10 text-sm font-medium transition-all`}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
