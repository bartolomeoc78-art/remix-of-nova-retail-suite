import { useState } from "react";
import { TrendingUp, Package, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { format, subDays, subMonths, startOfDay, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = [
  "hsl(var(--sales))",
  "hsl(var(--products))",
  "hsl(var(--inventory))",
  "hsl(var(--customers))",
  "hsl(var(--invoicing))",
  "hsl(var(--suppliers))",
  "hsl(var(--cash))",
  "hsl(var(--expenses))",
];

type Period = "7d" | "30d" | "90d" | "6m" | "12m" | "all";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  "90d": "Últimos 90 días",
  "6m": "Últimos 6 meses",
  "12m": "Último año",
  "all": "Todo el histórico",
};

function getDateFrom(period: Period): string | null {
  const now = new Date();
  switch (period) {
    case "7d": return startOfDay(subDays(now, 6)).toISOString();
    case "30d": return startOfDay(subDays(now, 29)).toISOString();
    case "90d": return startOfDay(subDays(now, 89)).toISOString();
    case "6m": return startOfMonth(subMonths(now, 6)).toISOString();
    case "12m": return startOfMonth(subMonths(now, 12)).toISOString();
    case "all": return null;
  }
}

function getDaysCount(period: Period): number {
  switch (period) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "6m": return 180;
    case "12m": return 365;
    case "all": return 0;
  }
}

function shouldGroupByMonth(period: Period) {
  return period === "6m" || period === "12m" || period === "all";
}

const Reports = () => {
  const [period, setPeriod] = useState<Period>("30d");

  const dateFrom = getDateFrom(period);
  const groupByMonth = shouldGroupByMonth(period);

  // Sales by payment method (filtered by period)
  const { data: salesByMethod } = useQuery({
    queryKey: ["report_sales_by_method", period],
    queryFn: async () => {
      let q = supabase.from("sales").select("payment_method, total").eq("status", "completada");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data, error } = await q;
      if (error) throw error;
      const map = new Map<string, number>();
      for (const s of data ?? []) {
        map.set(s.payment_method, (map.get(s.payment_method) ?? 0) + Number(s.total));
      }
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    },
  });

  // Top products (filtered by period)
  const { data: topProducts } = useQuery({
    queryKey: ["report_top_products", period],
    queryFn: async () => {
      let q = supabase.from("sale_lines").select("product_id, quantity, total, created_at, products(name)");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data, error } = await q;
      if (error) throw error;
      const map = new Map<string, { name: string; qty: number; total: number }>();
      for (const l of data ?? []) {
        const name = (l.products as any)?.name ?? "Desconocido";
        const prev = map.get(l.product_id) ?? { name, qty: 0, total: 0 };
        map.set(l.product_id, { name, qty: prev.qty + Number(l.quantity), total: prev.total + Number(l.total) });
      }
      return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 10);
    },
  });

  // Sales chart data (filtered by period, grouped by day or month)
  const { data: salesChart } = useQuery({
    queryKey: ["report_sales_chart", period],
    queryFn: async () => {
      let q = supabase.from("sales").select("total, created_at").eq("status", "completada").order("created_at");
      if (dateFrom) q = q.gte("created_at", dateFrom);
      const { data, error } = await q;
      if (error) throw error;

      if (groupByMonth) {
        // Group by month
        const byMonth = new Map<string, number>();
        for (const s of data ?? []) {
          const key = format(new Date(s.created_at), "yyyy-MM");
          byMonth.set(key, (byMonth.get(key) ?? 0) + Number(s.total));
        }
        return Array.from(byMonth.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, total]) => ({
            date,
            label: format(new Date(date + "-01"), "MMM yy", { locale: es }),
            total,
          }));
      } else {
        // Group by day
        const days = getDaysCount(period);
        const byDay = new Map<string, number>();
        for (let i = 0; i < days; i++) {
          byDay.set(format(subDays(new Date(), days - 1 - i), "yyyy-MM-dd"), 0);
        }
        for (const s of data ?? []) {
          const day = format(new Date(s.created_at), "yyyy-MM-dd");
          byDay.set(day, (byDay.get(day) ?? 0) + Number(s.total));
        }
        return Array.from(byDay.entries()).map(([date, total]) => ({
          date,
          label: format(new Date(date), "dd", { locale: es }),
          total,
        }));
      }
    },
  });

  // Expenses by category (filtered by period)
  const { data: expensesByCategory } = useQuery({
    queryKey: ["report_expenses_category", period],
    queryFn: async () => {
      let q = supabase.from("expenses").select("category, total, expense_date");
      if (dateFrom) q = q.gte("expense_date", dateFrom.split("T")[0]);
      const { data, error } = await q;
      if (error) throw error;
      const map = new Map<string, number>();
      for (const e of data ?? []) {
        map.set(e.category, (map.get(e.category) ?? 0) + Number(e.total));
      }
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    },
  });

  const totalSales = salesChart?.reduce((s, d) => s + d.total, 0) ?? 0;
  const totalExpenses = expensesByCategory?.reduce((s, e) => s + e.value, 0) ?? 0;
  const salesCount = salesChart?.reduce((s, d) => s + (d.total > 0 ? 1 : 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Informes</h1>
          <p className="text-sm text-muted-foreground mt-1">Análisis de ventas, productos, gastos y rendimiento</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PERIOD_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-sales">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ventas ({PERIOD_LABELS[period].toLowerCase()})</p>
            <p className="text-xl font-semibold">{totalSales.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-expenses">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Gastos totales</p>
            <p className="text-xl font-semibold">{totalExpenses.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-inventory">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Margen neto</p>
            <p className="text-xl font-semibold">{(totalSales - totalExpenses).toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales" className="gap-1"><TrendingUp className="h-4 w-4" />Ventas</TabsTrigger>
          <TabsTrigger value="products" className="gap-1"><Package className="h-4 w-4" />Productos</TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1"><FileText className="h-4 w-4" />Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border shadow-sm">
              <CardHeader><CardTitle className="text-sm">Ventas — {PERIOD_LABELS[period]}</CardTitle></CardHeader>
              <CardContent>
                {salesChart && salesChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={salesChart}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip formatter={(v: number) => [`€${v.toFixed(2)}`, "Ventas"]} />
                      <Bar dataKey="total" fill="hsl(var(--sales))" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">Sin datos</div>
                )}
              </CardContent>
            </Card>
            <Card className="border shadow-sm">
              <CardHeader><CardTitle className="text-sm">Por método de pago</CardTitle></CardHeader>
              <CardContent>
                {salesByMethod && salesByMethod.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={salesByMethod} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {salesByMethod.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-muted-foreground">Sin datos</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-sm">Top 10 productos por facturación — {PERIOD_LABELS[period]}</CardTitle></CardHeader>
            <CardContent className="p-0">
              {!topProducts?.length ? (
                <div className="p-8 text-center text-muted-foreground">Sin datos de ventas</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead className="text-right">Uds. vendidas</TableHead>
                      <TableHead className="text-right">Facturado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono">{i + 1}</TableCell>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-right">{p.qty}</TableCell>
                        <TableCell className="text-right font-medium">{p.total.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-sm">Gastos por categoría — {PERIOD_LABELS[period]}</CardTitle></CardHeader>
            <CardContent>
              {expensesByCategory && expensesByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expensesByCategory} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={120} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                    <Bar dataKey="value" fill="hsl(var(--expenses))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">Sin datos de gastos</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
