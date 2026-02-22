import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { useSupplierScoring, useSlowMovingProducts, useCustomerSegmentation, useCrossSellRecommendations } from "@/hooks/useRecommendations";
import { Truck, Users, PackageX, ShoppingBag, Star, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const segmentColors: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-800",
  Regular: "bg-blue-100 text-blue-700",
  Ocasional: "bg-muted text-muted-foreground",
  Inactivo: "bg-destructive/10 text-destructive",
};

const dimensionLabels: Record<string, string> = {
  precio: "Precio",
  calidad: "Calidad",
  plazo: "Plazo entrega",
  moq: "MOQ",
  sostenibilidad: "Sostenibilidad",
  cercania: "Cercanía",
  condiciones_pago: "Cond. pago",
  comunicacion: "Comunicación",
};

const Recommendations = () => {
  const { data: supplierScores, isLoading: loadingScoring } = useSupplierScoring();
  const { data: slowMoving, isLoading: loadingSlow } = useSlowMovingProducts();
  const { data: customers, isLoading: loadingCustomers } = useCustomerSegmentation();
  const { data: crossSell, isLoading: loadingCross } = useCrossSellRecommendations();
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);

  const selectedScore = supplierScores?.find((s) => s.id === selectedSupplier);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Recomendaciones e Inteligencia</h1>
        <p className="text-sm text-muted-foreground mt-1">Scoring proveedores, segmentación clientes, alertas y cross-sell</p>
      </div>

      <Tabs defaultValue="scoring">
        <TabsList>
          <TabsTrigger value="scoring" className="gap-1"><Truck className="h-4 w-4" />Scoring Proveedores</TabsTrigger>
          <TabsTrigger value="customers" className="gap-1"><Users className="h-4 w-4" />Clientes RFM</TabsTrigger>
          <TabsTrigger value="slowmoving" className="gap-1"><PackageX className="h-4 w-4" />Slow-Moving</TabsTrigger>
          <TabsTrigger value="crosssell" className="gap-1"><ShoppingBag className="h-4 w-4" />Cross-Sell</TabsTrigger>
        </TabsList>

        {/* ── SUPPLIER SCORING ── */}
        <TabsContent value="scoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border shadow-sm">
              <CardHeader><CardTitle className="text-sm font-medium">Ranking Proveedores</CardTitle></CardHeader>
              <CardContent className="p-0">
                {loadingScoring ? (
                  <div className="p-12 text-center text-muted-foreground">Calculando scoring…</div>
                ) : !supplierScores?.length ? (
                  <div className="p-12 text-center text-muted-foreground">Sin proveedores activos</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Proveedor</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Nivel</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supplierScores.sort((a, b) => b.score - a.score).map((s, i) => (
                        <TableRow
                          key={s.id}
                          className={`cursor-pointer ${selectedSupplier === s.id ? "bg-accent" : ""}`}
                          onClick={() => setSelectedSupplier(s.id)}
                        >
                          <TableCell className="font-mono text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="font-medium">{s.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={s.score} className="w-20 h-2" />
                              <span className="text-sm font-medium">{s.score}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={s.score >= 75 ? "bg-green-100 text-green-700" : s.score >= 50 ? "bg-amber-100 text-amber-700" : "bg-destructive/10 text-destructive"}>
                              {s.score >= 75 ? "Excelente" : s.score >= 50 ? "Aceptable" : "Mejorable"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {s.redFlags.length > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Detail panel */}
            <Card className="border shadow-sm">
              <CardHeader><CardTitle className="text-sm font-medium">Detalle Scoring</CardTitle></CardHeader>
              <CardContent>
                {selectedScore ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-foreground">{selectedScore.score}</div>
                      <p className="text-sm text-muted-foreground">{selectedScore.name}</p>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(selectedScore.dimensions).map(([key, val]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-24 truncate">{dimensionLabels[key] ?? key}</span>
                          <Progress value={val} className="flex-1 h-1.5" />
                          <span className="text-xs font-medium w-8 text-right">{Math.round(val)}</span>
                        </div>
                      ))}
                    </div>
                    {selectedScore.strengths.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Fortalezas</p>
                        {selectedScore.strengths.map((s) => (
                          <div key={s} className="flex items-center gap-1 text-xs text-green-700"><Star className="h-3 w-3" />{s}</div>
                        ))}
                      </div>
                    )}
                    {selectedScore.weaknesses.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Debilidades</p>
                        {selectedScore.weaknesses.map((w) => (
                          <div key={w} className="flex items-center gap-1 text-xs text-amber-700"><Target className="h-3 w-3" />{w}</div>
                        ))}
                      </div>
                    )}
                    {selectedScore.redFlags.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Señales rojas</p>
                        {selectedScore.redFlags.map((r) => (
                          <div key={r} className="text-xs text-destructive">{r}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Selecciona un proveedor para ver el detalle</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── CUSTOMER SEGMENTATION ── */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {["VIP", "Regular", "Ocasional", "Inactivo"].map((seg) => {
              const count = customers?.filter((c) => c.segment === seg).length ?? 0;
              return (
                <Card key={seg} className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <Badge className={segmentColors[seg]}>{seg}</Badge>
                    <div className="text-2xl font-bold mt-2">{count}</div>
                    <p className="text-xs text-muted-foreground">clientes</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              {loadingCustomers ? (
                <div className="p-12 text-center text-muted-foreground">Analizando clientes…</div>
              ) : !customers?.length ? (
                <div className="p-12 text-center text-muted-foreground">Sin clientes registrados</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Segmento</TableHead>
                      <TableHead className="text-right">Compras</TableHead>
                      <TableHead className="text-right">Total gastado</TableHead>
                      <TableHead>Última compra</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.slice(0, 50).map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell><Badge className={segmentColors[c.segment]}>{c.segment}</Badge></TableCell>
                        <TableCell className="text-right">{c.orderCount}</TableCell>
                        <TableCell className="text-right font-medium">{c.totalSpent.toFixed(2)} €</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.lastPurchase ? format(new Date(c.lastPurchase), "dd MMM yyyy", { locale: es }) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SLOW-MOVING ── */}
        <TabsContent value="slowmoving" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PackageX className="h-4 w-4 text-destructive" />
                Productos sin ventas en 180+ días (con stock)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingSlow ? (
                <div className="p-12 text-center text-muted-foreground">Analizando rotación…</div>
              ) : !slowMoving?.length ? (
                <div className="p-12 text-center text-muted-foreground">
                  <PackageX className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p>Todos los productos tienen ventas recientes ✓</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Coste unit.</TableHead>
                      <TableHead className="text-right">Valor inmovilizado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slowMoving.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">{p.sku ?? "—"}</TableCell>
                        <TableCell className="text-right">{Number(p.stock_on_hand)}</TableCell>
                        <TableCell className="text-right">{Number(p.cost_price).toFixed(2)} €</TableCell>
                        <TableCell className="text-right font-medium text-destructive">{p.stockValue.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CROSS-SELL ── */}
        <TabsContent value="crosssell" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-module-sales" />
                Productos frecuentemente comprados juntos
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loadingCross ? (
                <div className="p-12 text-center text-muted-foreground">Analizando patrones…</div>
              ) : !crossSell?.length ? (
                <div className="p-12 text-center text-muted-foreground">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <p>No hay suficientes datos de ventas para detectar patrones</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto A</TableHead>
                      <TableHead>Producto B</TableHead>
                      <TableHead className="text-right">Veces juntos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {crossSell.map((pair, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{pair.nameA}</TableCell>
                        <TableCell className="font-medium">{pair.nameB}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{pair.count}x</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Recommendations;
