import { useState } from "react";
import { BookOpen, Plus, Check, FileSpreadsheet, List, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccountingAccounts, useJournalEntries, useCreateJournalEntry, useConfirmJournalEntry, useLedger, useTrialBalance } from "@/hooks/useAccounting";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  confirmado: "bg-green-100 text-green-700",
  bloqueado: "bg-accounting-light text-accounting",
};

const Accounting = () => {
  const { session: authSession } = useAuth();
  const userId = authSession?.user?.id ?? "";

  const { data: accounts } = useAccountingAccounts();
  const { data: entries, isLoading } = useJournalEntries();
  const createEntry = useCreateJournalEntry();
  const confirmEntry = useConfirmJournalEntry();
  const { data: trialBalance } = useTrialBalance();

  // Ledger state
  const [ledgerAccount, setLedgerAccount] = useState<string>("");
  const { data: ledgerLines } = useLedger(ledgerAccount || undefined);

  // New entry dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entryDesc, setEntryDesc] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<{ account_code: string; debit: number; credit: number; description: string }[]>([
    { account_code: "", debit: 0, credit: 0, description: "" },
    { account_code: "", debit: 0, credit: 0, description: "" },
  ]);

  const totalDebit = lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = lines.reduce((s, l) => s + l.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const addLine = () => setLines([...lines, { account_code: "", debit: 0, credit: 0, description: "" }]);

  const updateLine = (idx: number, field: string, value: any) => {
    const updated = [...lines];
    (updated[idx] as any)[field] = value;
    setLines(updated);
  };

  const handleCreateEntry = () => {
    const validLines = lines.filter((l) => l.account_code && (l.debit > 0 || l.credit > 0));
    createEntry.mutate(
      {
        entry: { description: entryDesc, entry_date: entryDate, created_by: userId },
        lines: validLines,
      },
      {
        onSuccess: () => {
          toast.success("Asiento creado");
          setDialogOpen(false);
          setEntryDesc("");
          setLines([
            { account_code: "", debit: 0, credit: 0, description: "" },
            { account_code: "", debit: 0, credit: 0, description: "" },
          ]);
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleConfirm = (id: string) => {
    confirmEntry.mutate({ id, userId }, { onSuccess: () => toast.success("Asiento confirmado") });
  };

  // Trial balance totals
  const tbTotalDebit = trialBalance?.reduce((s, a) => s + a.debit, 0) ?? 0;
  const tbTotalCredit = trialBalance?.reduce((s, a) => s + a.credit, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contabilidad PGC</h1>
          <p className="text-sm text-muted-foreground mt-1">Plan contable, libro diario, mayor y balance de sumas y saldos</p>
        </div>
        <Button className="gap-2 bg-accounting hover:bg-accounting/90" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />Nuevo asiento
        </Button>
      </div>

      <Tabs defaultValue="journal">
        <TabsList>
          <TabsTrigger value="journal" className="gap-1"><BookOpen className="h-4 w-4" />Libro Diario</TabsTrigger>
          <TabsTrigger value="ledger" className="gap-1"><List className="h-4 w-4" />Mayor</TabsTrigger>
          <TabsTrigger value="trial" className="gap-1"><Calculator className="h-4 w-4" />Balance Sumas y Saldos</TabsTrigger>
          <TabsTrigger value="accounts" className="gap-1"><FileSpreadsheet className="h-4 w-4" />Plan Contable</TabsTrigger>
        </TabsList>

        {/* JOURNAL */}
        <TabsContent value="journal" className="space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-12 text-center text-muted-foreground">Cargando…</div>
              ) : !entries?.length ? (
                <div className="p-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Sin asientos contables</h3>
                  <p className="text-sm text-muted-foreground mt-1">Los asientos se generan automáticamente o puedes crearlos manualmente.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Debe</TableHead>
                      <TableHead className="text-right">Haber</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((e) => {
                      const d = e.journal_entry_lines?.reduce((s: number, l: any) => s + Number(l.debit), 0) ?? 0;
                      const c = e.journal_entry_lines?.reduce((s: number, l: any) => s + Number(l.credit), 0) ?? 0;
                      return (
                        <TableRow key={e.id}>
                          <TableCell className="font-mono text-sm">#{e.entry_number}</TableCell>
                          <TableCell className="text-sm">{format(new Date(e.entry_date), "dd MMM yyyy", { locale: es })}</TableCell>
                          <TableCell>{e.description}</TableCell>
                          <TableCell className="text-right">{d.toFixed(2)} €</TableCell>
                          <TableCell className="text-right">{c.toFixed(2)} €</TableCell>
                          <TableCell>
                            <Badge className={statusColors[e.status] ?? ""}>{e.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {e.status === "borrador" && (
                              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleConfirm(e.id)}>
                                <Check className="h-3 w-3" />Confirmar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEDGER */}
        <TabsContent value="ledger" className="space-y-4">
          <div className="max-w-xs">
            <Label>Seleccionar cuenta</Label>
            <Select value={ledgerAccount} onValueChange={setLedgerAccount}>
              <SelectTrigger><SelectValue placeholder="Elige cuenta..." /></SelectTrigger>
              <SelectContent>
                {accounts?.map((a) => (
                  <SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {ledgerAccount && (
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Mayor: {ledgerAccount} — {accounts?.find((a) => a.code === ledgerAccount)?.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!ledgerLines?.length ? (
                  <div className="p-8 text-center text-muted-foreground">Sin movimientos en esta cuenta</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nº Asiento</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Debe</TableHead>
                        <TableHead className="text-right">Haber</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        let running = 0;
                        return ledgerLines.map((l) => {
                          running += Number(l.debit) - Number(l.credit);
                          const je = l.journal_entries as any;
                          return (
                            <TableRow key={l.id}>
                              <TableCell className="font-mono text-sm">#{je?.entry_number}</TableCell>
                              <TableCell className="text-sm">{je?.entry_date ? format(new Date(je.entry_date), "dd/MM/yyyy") : "—"}</TableCell>
                              <TableCell>{l.description || je?.description}</TableCell>
                              <TableCell className="text-right">{Number(l.debit) > 0 ? Number(l.debit).toFixed(2) + " €" : ""}</TableCell>
                              <TableCell className="text-right">{Number(l.credit) > 0 ? Number(l.credit).toFixed(2) + " €" : ""}</TableCell>
                              <TableCell className={`text-right font-medium ${running < 0 ? "text-destructive" : ""}`}>{running.toFixed(2)} €</TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TRIAL BALANCE */}
        <TabsContent value="trial" className="space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              {!trialBalance?.length ? (
                <div className="p-12 text-center text-muted-foreground">Sin datos contables confirmados</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Debe</TableHead>
                      <TableHead className="text-right">Haber</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trialBalance.map((a) => (
                      <TableRow key={a.code}>
                        <TableCell className="font-mono">{a.code}</TableCell>
                        <TableCell>{a.name}</TableCell>
                        <TableCell className="text-right">{a.debit.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{a.credit.toFixed(2)} €</TableCell>
                        <TableCell className={`text-right font-medium ${a.saldo < 0 ? "text-destructive" : ""}`}>{a.saldo.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-semibold bg-muted/50">
                      <TableCell colSpan={2}>TOTALES</TableCell>
                      <TableCell className="text-right">{tbTotalDebit.toFixed(2)} €</TableCell>
                      <TableCell className="text-right">{tbTotalCredit.toFixed(2)} €</TableCell>
                      <TableCell className="text-right">{(tbTotalDebit - tbTotalCredit).toFixed(2)} €</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CHART OF ACCOUNTS */}
        <TabsContent value="accounts" className="space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="p-0">
              {!accounts?.length ? (
                <div className="p-12 text-center text-muted-foreground">Sin cuentas contables configuradas</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Naturaleza</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono font-medium">{a.code}</TableCell>
                        <TableCell>{a.name}</TableCell>
                        <TableCell><Badge variant="outline">{a.account_type}</Badge></TableCell>
                        <TableCell className="text-sm capitalize">{a.nature}</TableCell>
                        <TableCell>
                          <Badge variant={a.active ? "default" : "secondary"}>{a.active ? "Activa" : "Inactiva"}</Badge>
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

      {/* New entry dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nuevo asiento contable</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha</Label>
                <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
              </div>
              <div>
                <Label>Descripción *</Label>
                <Input value={entryDesc} onChange={(e) => setEntryDesc(e.target.value)} placeholder="Concepto del asiento" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Líneas del asiento</Label>
                <Button variant="outline" size="sm" onClick={addLine} className="gap-1"><Plus className="h-3 w-3" />Línea</Button>
              </div>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuenta</TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead className="text-right">Debe</TableHead>
                      <TableHead className="text-right">Haber</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lines.map((l, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Select value={l.account_code} onValueChange={(v) => updateLine(i, "account_code", v)}>
                            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Cuenta..." /></SelectTrigger>
                            <SelectContent>
                              {accounts?.map((a) => (
                                <SelectItem key={a.code} value={a.code}>{a.code} — {a.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input value={l.description} onChange={(e) => updateLine(i, "description", e.target.value)} placeholder="Concepto" className="w-[150px]" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" className="w-[100px] text-right" value={l.debit || ""} onChange={(e) => updateLine(i, "debit", parseFloat(e.target.value) || 0)} />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" className="w-[100px] text-right" value={l.credit || ""} onChange={(e) => updateLine(i, "credit", parseFloat(e.target.value) || 0)} />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-semibold">
                      <TableCell colSpan={2} className="text-right">Totales:</TableCell>
                      <TableCell className="text-right">{totalDebit.toFixed(2)} €</TableCell>
                      <TableCell className="text-right">{totalCredit.toFixed(2)} €</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              {!isBalanced && totalDebit > 0 && (
                <p className="text-sm text-destructive mt-1">⚠ El asiento no está cuadrado (Diferencia: {(totalDebit - totalCredit).toFixed(2)} €)</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateEntry} disabled={!entryDesc.trim() || !isBalanced}>Crear asiento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Accounting;
