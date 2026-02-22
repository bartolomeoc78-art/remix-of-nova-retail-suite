import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, ShoppingCart, Landmark, AlertTriangle, ArrowUpRight, ArrowDownRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTodaySales, useLowStockCount, useSalesLast7Days, usePendingSupplierInvoices } from "@/hooks/useDashboard";
import { useOpenCashSession } from "@/hooks/useCash";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const quickActions = [
  { label: "Nueva venta", path: "/pos", color: "text-sales", bg: "bg-sales-light hover:bg-sales/10" },
  { label: "Crear pedido", path: "/suppliers", color: "text-suppliers", bg: "bg-suppliers-light hover:bg-suppliers/10" },
  { label: "Registrar recepción", path: "/inventory", color: "text-inventory", bg: "bg-inventory-light hover:bg-inventory/10" },
  { label: "Exportar informe", path: "/reports", color: "text-reports", bg: "bg-reports-light hover:bg-reports/10" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: todaySales } = useTodaySales();
  const { data: lowStock } = useLowStockCount();
  const { data: sales7d } = useSalesLast7Days();
  const { data: openSession } = useOpenCashSession();
  const { data: pendingSI } = usePendingSupplierInvoices();

  const kpis = [
    {
      title: "Ventas hoy",
      value: `€${(todaySales?.total ?? 0).toFixed(2)}`,
      change: `${todaySales?.count ?? 0} ventas`,
      icon: ShoppingCart,
      up: (todaySales?.count ?? 0) > 0,
      color: "text-sales",
      bg: "bg-sales-light",
    },
    {
      title: "Stock crítico",
      value: `${lowStock?.length ?? 0}`,
      change: "productos",
      icon: AlertTriangle,
      up: false,
      color: "text-customers",
      bg: "bg-customers-light",
    },
    {
      title: "Caja",
      value: openSession ? `€${Number(openSession.expected_amount ?? 0).toFixed(2)}` : "Cerrada",
      change: openSession ? "abierta" : "sin sesión",
      icon: Landmark,
      up: !!openSession,
      color: "text-cash",
      bg: "bg-cash-light",
    },
    {
      title: "Fact. proveedor pend.",
      value: `${pendingSI ?? 0}`,
      change: "por pagar",
      icon: FileText,
      up: false,
      color: "text-expenses",
      bg: "bg-expenses-light",
    },
  ];

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
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <div className={`h-9 w-9 rounded-xl ${kpi.bg} flex items-center justify-center`}>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.up ? "text-green-600" : "text-muted-foreground"}`}>
                {kpi.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm font-medium">Ventas últimos 7 días</CardTitle></CardHeader>
          <CardContent>
            {sales7d && sales7d.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sales7d}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip formatter={(v: number) => [`€${v.toFixed(2)}`, "Ventas"]} />
                  <Bar dataKey="total" fill="hsl(var(--sales))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm rounded-lg bg-secondary/50">
                Sin datos de ventas esta semana
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="text-sm font-medium">Alertas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(lowStock?.length ?? 0) > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-customers" />
                <span className="text-muted-foreground">{lowStock!.length} productos bajo stock mínimo</span>
              </div>
            )}
            {(pendingSI ?? 0) > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-expenses" />
                <span className="text-muted-foreground">{pendingSI} facturas proveedor pendientes</span>
              </div>
            )}
            {!openSession && (
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-cash" />
                <span className="text-muted-foreground">Caja no abierta</span>
              </div>
            )}
            {(lowStock?.length ?? 0) === 0 && (pendingSI ?? 0) === 0 && openSession && (
              <p className="text-sm text-muted-foreground">Sin alertas activas ✓</p>
            )}
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
