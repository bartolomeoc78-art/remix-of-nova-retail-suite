import { useState } from "react";
import { Landmark, DollarSign, Plus, ArrowDownCircle, ArrowUpCircle, X, Banknote, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useOpenCashSession, useCashSessions, useCashMovements, useOpenCash, useCloseCash, useAddCashMovement, useBankAccounts, useBankMovements } from "@/hooks/useCash";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const moveTypeLabels: Record<string, string> = {
  apertura: "Apertura",
  venta: "Venta",
  retiro: "Retiro",
  gasto: "Gasto",
  cierre: "Cierre",
  ajuste: "Ajuste",
};

const moveTypeColors: Record<string, string> = {
  apertura: "bg-blue-100 text-blue-700",
  venta: "bg-green-100 text-green-700",
  retiro: "bg-amber-100 text-amber-700",
  gasto: "bg-red-100 text-red-700",
  cierre: "bg-muted text-muted-foreground",
  ajuste: "bg-purple-100 text-purple-700",
};

const Cash = () => {
  const { session: authSession } = useAuth();
  const userId = authSession?.user?.id ?? "";

  const { data: openSession } = useOpenCashSession();
  const { data: allSessions } = useCashSessions();
  const { data: movements } = useCashMovements(openSession?.id);
  const openCash = useOpenCash();
  const closeCash = useCloseCash();
  const addMovement = useAddCashMovement();

  const [openDialog, setOpenDialog] = useState<"open" | "close" | "movement" | null>(null);
  const [openingAmount, setOpeningAmount] = useState("0");
  const [countedAmount, setCountedAmount] = useState("");
  const [differenceNotes, setDifferenceNotes] = useState("");
  const [moveType, setMoveType] = useState<string>("retiro");
  const [moveAmount, setMoveAmount] = useState("");
  const [moveDesc, setMoveDesc] = useState("");

  // Banks
  const { data: bankAccounts } = useBankAccounts();
  const [selectedBank, setSelectedBank] = useState<string>("");
  const { data: bankMovements } = useBankMovements(selectedBank || undefined);

  const handleOpenCash = () => {
    openCash.mutate({ opening_amount: parseFloat(openingAmount) || 0, userId }, {
      onSuccess: () => { toast.success("Caja abierta"); setOpenDialog(null); },
    });
  };

  const handleCloseCash = () => {
    if (!openSession) return;
    closeCash.mutate({
      sessionId: openSession.id,
      countedAmount: parseFloat(countedAmount) || 0,
      expectedAmount: Number(openSession.expected_amount),
      differenceNotes,
      userId,
    }, {
      onSuccess: () => { toast.success("Caja cerrada"); setOpenDialog(null); },
    });
  };

  const handleAddMovement = () => {
    if (!openSession || !moveAmount) return;
    addMovement.mutate({
      session_id: openSession.id,
      move_type: moveType as any,
      amount: parseFloat(moveAmount),
      description: moveDesc || null,
      user_id: userId,
    }, {
      onSuccess: () => { toast.success("Movimiento registrado"); setOpenDialog(null); setMoveAmount(""); setMoveDesc(""); },
    });
  };

  const expected = Number(openSession?.expected_amount ?? 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Caja y Bancos</h1>
          <p className="text-sm text-muted-foreground mt-1">Sesiones de caja, movimientos y cuentas bancarias</p>
        </div>
        <div className="flex gap-2">
          {openSession ? (
            <>
              <Button variant="outline" className="gap-2" onClick={() => setOpenDialog("movement")}>
                <Plus className="h-4 w-4" />Movimiento
              </Button>
              <Button variant="destructive" className="gap-2" onClick={() => { setCountedAmount(""); setDifferenceNotes(""); setOpenDialog("close"); }}>
                <X className="h-4 w-4" />Cerrar caja
              </Button>
            </>
          ) : (
            <Button className="gap-2 bg-cash hover:bg-cash/90" onClick={() => { setOpeningAmount("0"); setOpenDialog("open"); }}>
              <DollarSign className="h-4 w-4" />Abrir caja
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="cash">
        <TabsList>
          <TabsTrigger value="cash" className="gap-1"><Banknote className="h-4 w-4" />Caja</TabsTrigger>
          <TabsTrigger value="banks" className="gap-1"><Building2 className="h-4 w-4" />Bancos</TabsTrigger>
        </TabsList>

        <TabsContent value="cash" className="space-y-4">
          {/* Active session summary */}
          {openSession && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-cash">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Apertura</p>
                  <p className="text-xl font-semibold">{Number(openSession.opening_amount).toFixed(2)} €</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Esperado en caja</p>
                  <p className="text-xl font-semibold">{expected.toFixed(2)} €</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-sales">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">Movimientos</p>
                  <p className="text-xl font-semibold">{movements?.length ?? 0}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Movements of open session */}
          {openSession && movements && movements.length > 0 && (
            <Card className="border shadow-sm">
              <CardHeader><CardTitle className="text-base">Movimientos sesión actual</CardTitle></CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="text-sm">{format(new Date(m.created_at), "HH:mm")}</TableCell>
                        <TableCell><Badge className={moveTypeColors[m.move_type] ?? ""}>{moveTypeLabels[m.move_type] ?? m.move_type}</Badge></TableCell>
                        <TableCell className="text-sm">{m.description ?? "—"}</TableCell>
                        <TableCell className="text-right font-medium">
                          {m.move_type === "retiro" || m.move_type === "gasto" ? "-" : ""}{Number(m.amount).toFixed(2)} €
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Historical sessions */}
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-base">Historial de sesiones</CardTitle></CardHeader>
            <CardContent className="p-0">
              {!allSessions?.length ? (
                <div className="p-12 text-center">
                  <Landmark className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Sin sesiones</h3>
                  <p className="text-sm text-muted-foreground mt-1">Abre tu primera sesión de caja.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha apertura</TableHead>
                      <TableHead className="text-right">Apertura</TableHead>
                      <TableHead className="text-right">Esperado</TableHead>
                      <TableHead className="text-right">Contado</TableHead>
                      <TableHead className="text-right">Diferencia</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSessions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-sm">{format(new Date(s.opened_at), "dd MMM yyyy HH:mm", { locale: es })}</TableCell>
                        <TableCell className="text-right">{Number(s.opening_amount).toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{s.expected_amount != null ? Number(s.expected_amount).toFixed(2) + " €" : "—"}</TableCell>
                        <TableCell className="text-right">{s.counted_amount != null ? Number(s.counted_amount).toFixed(2) + " €" : "—"}</TableCell>
                        <TableCell className={`text-right font-medium ${s.difference && Number(s.difference) !== 0 ? "text-destructive" : ""}`}>
                          {s.difference != null ? Number(s.difference).toFixed(2) + " €" : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.status === "abierta" ? "default" : "secondary"}>
                            {s.status === "abierta" ? "Abierta" : "Cerrada"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="banks" className="space-y-4">
          {!bankAccounts?.length ? (
            <Card className="border shadow-sm">
              <CardContent className="p-12 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Sin cuentas bancarias</h3>
                <p className="text-sm text-muted-foreground mt-1">Configura tus cuentas bancarias en ajustes.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex gap-2">
                {bankAccounts.map((ba) => (
                  <Button key={ba.id} variant={selectedBank === ba.id ? "default" : "outline"} onClick={() => setSelectedBank(ba.id)} className="gap-2">
                    <Building2 className="h-4 w-4" />{ba.name}
                    <Badge variant="secondary" className="ml-1">{Number(ba.balance).toFixed(2)} €</Badge>
                  </Button>
                ))}
              </div>
              {selectedBank && (
                <Card className="border shadow-sm">
                  <CardContent className="p-0">
                    {!bankMovements?.length ? (
                      <div className="p-8 text-center text-muted-foreground">Sin movimientos bancarios</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead className="text-right">Importe</TableHead>
                            <TableHead>Conciliado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bankMovements.map((bm) => (
                            <TableRow key={bm.id}>
                              <TableCell className="text-sm">{bm.value_date ? format(new Date(bm.value_date), "dd/MM/yyyy") : format(new Date(bm.created_at), "dd/MM/yyyy")}</TableCell>
                              <TableCell>{bm.description ?? "—"}</TableCell>
                              <TableCell className={`text-right font-medium ${Number(bm.amount) < 0 ? "text-destructive" : "text-green-600"}`}>
                                {Number(bm.amount).toFixed(2)} €
                              </TableCell>
                              <TableCell><Badge variant={bm.reconciled ? "default" : "outline"}>{bm.reconciled ? "Sí" : "No"}</Badge></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Open cash dialog */}
      <Dialog open={openDialog === "open"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Abrir caja</DialogTitle></DialogHeader>
          <div>
            <Label>Importe de apertura (€)</Label>
            <Input type="number" step="0.01" value={openingAmount} onChange={(e) => setOpeningAmount(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
            <Button onClick={handleOpenCash}>Abrir caja</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close cash dialog */}
      <Dialog open={openDialog === "close"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cerrar caja — Arqueo</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Importe esperado</Label>
              <Input disabled value={expected.toFixed(2) + " €"} />
            </div>
            <div>
              <Label>Importe contado (€)</Label>
              <Input type="number" step="0.01" value={countedAmount} onChange={(e) => setCountedAmount(e.target.value)} placeholder="0.00" />
            </div>
            {countedAmount && parseFloat(countedAmount) !== expected && (
              <div className="p-3 bg-destructive/10 rounded-md">
                <p className="text-sm font-medium text-destructive">
                  Descuadre: {(parseFloat(countedAmount) - expected).toFixed(2)} €
                </p>
                <Label className="mt-2">Explicación del descuadre *</Label>
                <Textarea value={differenceNotes} onChange={(e) => setDifferenceNotes(e.target.value)} rows={2} placeholder="Motivo del descuadre..." />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleCloseCash} disabled={!countedAmount || (parseFloat(countedAmount) !== expected && !differenceNotes.trim())}>
              Cerrar caja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add movement dialog */}
      <Dialog open={openDialog === "movement"} onOpenChange={() => setOpenDialog(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar movimiento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tipo</Label>
              <Select value={moveType} onValueChange={setMoveType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="retiro">Retiro</SelectItem>
                  <SelectItem value="gasto">Gasto</SelectItem>
                  <SelectItem value="ajuste">Ajuste (+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Importe (€)</Label>
              <Input type="number" step="0.01" value={moveAmount} onChange={(e) => setMoveAmount(e.target.value)} />
            </div>
            <div>
              <Label>Descripción</Label>
              <Input value={moveDesc} onChange={(e) => setMoveDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(null)}>Cancelar</Button>
            <Button onClick={handleAddMovement} disabled={!moveAmount}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cash;
