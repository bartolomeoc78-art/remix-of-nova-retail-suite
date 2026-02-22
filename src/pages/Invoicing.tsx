import { useState } from "react";
import { FileText, Filter, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInvoices } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const typeLabels: Record<string, string> = {
  simplificada: "Simplificada",
  completa: "Completa",
  rectificativa: "Rectificativa",
};

const statusColors: Record<string, string> = {
  borrador: "bg-muted text-muted-foreground",
  confirmada: "bg-invoicing-light text-invoicing",
  anulada: "bg-destructive/10 text-destructive",
};

const Invoicing = () => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const filters = {
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const { data: invoices, isLoading } = useInvoices(Object.keys(filters).length > 0 ? filters : undefined);

  const totals = invoices?.reduce(
    (acc, inv) => ({
      subtotal: acc.subtotal + Number(inv.subtotal),
      tax: acc.tax + Number(inv.tax_total),
      total: acc.total + Number(inv.total),
    }),
    { subtotal: 0, tax: 0, total: 0 }
  ) ?? { subtotal: 0, tax: 0, total: 0 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Facturación</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Facturas emitidas, simplificadas y rectificativas
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-invoicing">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Base imponible</p>
            <p className="text-xl font-semibold">{totals.subtotal.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-invoicing">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">IVA repercutido</p>
            <p className="text-xl font-semibold">{totals.tax.toFixed(2)} €</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-invoicing">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total facturado</p>
            <p className="text-xl font-semibold">{totals.total.toFixed(2)} €</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            <SelectItem value="simplificada">Simplificada</SelectItem>
            <SelectItem value="completa">Completa</SelectItem>
            <SelectItem value="rectificativa">Rectificativa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="borrador">Borrador</SelectItem>
            <SelectItem value="confirmada">Confirmada</SelectItem>
            <SelectItem value="anulada">Anulada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando…</div>
          ) : !invoices?.length ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium">Sin facturas</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Las facturas se generan automáticamente con cada venta en el TPV.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Factura</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Base</TableHead>
                  <TableHead className="text-right">IVA</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">{inv.invoice_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {typeLabels[inv.invoice_type] ?? inv.invoice_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{(inv.customers as any)?.name ?? "—"}</TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(inv.issued_at), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">{Number(inv.subtotal).toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{Number(inv.tax_total).toFixed(2)} €</TableCell>
                    <TableCell className="text-right font-medium">{Number(inv.total).toFixed(2)} €</TableCell>
                    <TableCell>
                      <Badge className={statusColors[inv.status] ?? ""}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(inv)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Factura {selectedInvoice?.invoice_number}</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Tipo:</span> {typeLabels[selectedInvoice.invoice_type]}</div>
                <div><span className="text-muted-foreground">Estado:</span> {selectedInvoice.status}</div>
                <div><span className="text-muted-foreground">Cliente:</span> {(selectedInvoice.customers as any)?.name ?? "—"}</div>
                <div><span className="text-muted-foreground">NIF:</span> {(selectedInvoice.customers as any)?.nif ?? "—"}</div>
                <div><span className="text-muted-foreground">Fecha:</span> {format(new Date(selectedInvoice.issued_at), "dd/MM/yyyy")}</div>
                <div><span className="text-muted-foreground">Método pago:</span> {selectedInvoice.payment_method ?? "—"}</div>
              </div>
              <div className="border-t pt-3">
                <h4 className="font-medium mb-2">Líneas</h4>
                {selectedInvoice.invoice_lines?.map((line: any) => (
                  <div key={line.id} className="flex justify-between py-1 border-b last:border-0">
                    <span>{line.description} x{line.quantity}</span>
                    <span>{Number(line.total).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Base imponible</span><span>{Number(selectedInvoice.subtotal).toFixed(2)} €</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">IVA</span><span>{Number(selectedInvoice.tax_total).toFixed(2)} €</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>{Number(selectedInvoice.total).toFixed(2)} €</span></div>
              </div>
              {selectedInvoice.tax_breakdown && Array.isArray(selectedInvoice.tax_breakdown) && selectedInvoice.tax_breakdown.length > 0 && (
                <div className="border-t pt-3">
                  <h4 className="font-medium mb-2">Desglose IVA</h4>
                  {(selectedInvoice.tax_breakdown as any[]).map((tb, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>IVA {tb.rate}%</span>
                      <span>Base: {Number(tb.base).toFixed(2)} € — Cuota: {Number(tb.amount).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoicing;
