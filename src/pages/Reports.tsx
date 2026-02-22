import { useState } from "react";
import { BarChart3, Download, TrendingUp, Package, Users, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
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

const Reports = () => {
  // Sales by payment method
  const { data: salesByMethod } = useQuery({
    queryKey: ["report_sales_by_method"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("payment_method, total")
        .eq("status", "completada");
      if (error) throw error;
      const map = new Map<string, number>();
      for (const s of data ?? []) {
        map.set(s.payment_method, (map.get(s.payment_method) ?? 0) + Number(s.total));
      }
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    },
  });

  // Top products
  const { data: topProducts } = useQuery({
    queryKey: ["report_top_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sale_lines")
        .select("product_id, quantity, total, products(name)");
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

  // Sales last 30 days
  const { data: sales30d } = useQuery({
    queryKey: ["report_sales_30d"],
    queryFn: async () => {
      const from = subDays(new Date(), 29);
      const { data, error } = await supabase
        .from("sales")
        .select("total, created_at")
        .gte("created_at", startOfDay(from).toISOString())
        .eq("status", "completada");
      if (error) throw error;
      const byDay = new Map<string, number>();
      for (let i = 0; i < 30; i++) {
        byDay.set(format(subDays(new Date(), 29 - i), "yyyy-MM-dd"), 0);
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
    },
  });

  // Expenses by category
  const { data: expensesByCategory } = useQuery({
    queryKey: ["report_expenses_category"],
    queryFn: async () => {
      const { data, error } = await supabase.from("expenses").select("category, total");
      if (error) throw error;
      const map = new Map<string, number>();
      for (const e of data ?? []) {
        map.set(e.category, (map.get(e.category) ?? 0) + Number(e.total));
      }
      return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    },
  });

  const totalSales = sales30d?.reduce((s, d) => s + d.total, 0) ?? 0;
  const totalExpenses = expensesByCategory?.reduce((s, e) => s + e.value, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Informes</h1>
          <p className="text-sm text-muted-foreground mt-1">Análisis de ventas, productos, gastos y rendimiento</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-sales">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Ventas (30 días)</p>
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
              <CardHeader><CardTitle className="text-sm">Ventas últimos 30 días</CardTitle></CardHeader>
              <CardContent>
                {sales30d && sales30d.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={sales30d}>
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
            <CardHeader><CardTitle className="text-sm">Top 10 productos por facturación</CardTitle></CardHeader>
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
            <CardHeader><CardTitle className="text-sm">Gastos por categoría</CardTitle></CardHeader>
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
