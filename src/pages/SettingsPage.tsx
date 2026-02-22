import { useState } from "react";
import { Building2, Percent, FileText, Users, Globe, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const SettingsPage = () => {
  const qc = useQueryClient();

  // Company settings
  const { data: company } = useQuery({
    queryKey: ["company_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("company_settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [companyForm, setCompanyForm] = useState<any>(null);
  const activeCompany = companyForm ?? company;

  const saveCompany = useMutation({
    mutationFn: async (form: any) => {
      if (company?.id) {
        const { error } = await supabase.from("company_settings").update(form).eq("id", company.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("company_settings").insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["company_settings"] }); toast.success("Datos guardados"); },
  });

  // Tax rates
  const { data: taxRates } = useQuery({
    queryKey: ["tax_rates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tax_rates").select("*").order("rate");
      if (error) throw error;
      return data;
    },
  });

  // Invoice series
  const { data: series } = useQuery({
    queryKey: ["invoice_series"],
    queryFn: async () => {
      const { data, error } = await supabase.from("invoice_series").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // User roles
  const { data: userRoles } = useQuery({
    queryKey: ["user_roles_list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*, profiles(full_name)");
      if (error) throw error;
      return data;
    },
  });

  // E-commerce sync events
  const { data: syncEvents } = useQuery({
    queryKey: ["sync_events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ecommerce_sync_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const syncStatusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">Datos de empresa, IVA, series, roles y e-commerce</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="flex-wrap">
          <TabsTrigger value="company" className="gap-1"><Building2 className="h-4 w-4" />Empresa</TabsTrigger>
          <TabsTrigger value="tax" className="gap-1"><Percent className="h-4 w-4" />IVA</TabsTrigger>
          <TabsTrigger value="series" className="gap-1"><FileText className="h-4 w-4" />Series</TabsTrigger>
          <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" />Usuarios</TabsTrigger>
          <TabsTrigger value="ecommerce" className="gap-1"><Globe className="h-4 w-4" />E-commerce</TabsTrigger>
        </TabsList>

        {/* COMPANY */}
        <TabsContent value="company" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-base">Datos de la empresa</CardTitle></CardHeader>
            <CardContent>
              {activeCompany && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label>Nombre</Label>
                    <Input value={activeCompany.name ?? ""} onChange={(e) => setCompanyForm({ ...activeCompany, name: e.target.value })} />
                  </div>
                  <div>
                    <Label>NIF</Label>
                    <Input value={activeCompany.nif ?? ""} onChange={(e) => setCompanyForm({ ...activeCompany, nif: e.target.value })} />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={activeCompany.email ?? ""} onChange={(e) => setCompanyForm({ ...activeCompany, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Teléfono</Label>
                    <Input value={activeCompany.phone ?? ""} onChange={(e) => setCompanyForm({ ...activeCompany, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label>Ciudad</Label>
                    <Input value={activeCompany.city ?? ""} onChange={(e) => setCompanyForm({ ...activeCompany, city: e.target.value })} />
                  </div>
                  <div className="col-span-2">
                    <Label>Dirección</Label>
                    <Input value={activeCompany.address ?? ""} onChange={(e) => setCompanyForm({ ...activeCompany, address: e.target.value })} />
                  </div>
                  <div>
                    <Label>Código postal</Label>
                    <Input value={activeCompany.postal_code ?? ""} onChange={(e) => setCompanyForm({ ...activeCompany, postal_code: e.target.value })} />
                  </div>
                  <div>
                    <Label>Método valoración</Label>
                    <Select value={activeCompany.valuation_method ?? "pmp"} onValueChange={(v) => setCompanyForm({ ...activeCompany, valuation_method: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pmp">PMP (Precio Medio Ponderado)</SelectItem>
                        <SelectItem value="fifo">FIFO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Button className="gap-2" onClick={() => saveCompany.mutate(companyForm ?? activeCompany)}>
                      <Save className="h-4 w-4" />Guardar cambios
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAX RATES */}
        <TabsContent value="tax" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-base">Tipos de IVA configurados</CardTitle></CardHeader>
            <CardContent className="p-0">
              {!taxRates?.length ? (
                <div className="p-8 text-center text-muted-foreground">Sin tipos de IVA</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Tipo (%)</TableHead>
                      <TableHead>Por defecto</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxRates.map((tr) => (
                      <TableRow key={tr.id}>
                        <TableCell className="font-medium">{tr.name}</TableCell>
                        <TableCell className="text-right">{Number(tr.rate)}%</TableCell>
                        <TableCell>{tr.is_default ? <Badge>Sí</Badge> : "—"}</TableCell>
                        <TableCell><Badge variant={tr.active ? "default" : "secondary"}>{tr.active ? "Activo" : "Inactivo"}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* INVOICE SERIES */}
        <TabsContent value="series" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-base">Series de facturación</CardTitle></CardHeader>
            <CardContent className="p-0">
              {!series?.length ? (
                <div className="p-8 text-center text-muted-foreground">Sin series configuradas</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Prefijo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Siguiente nº</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {series.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="font-mono">{s.prefix}</TableCell>
                        <TableCell><Badge variant="outline">{s.invoice_type}</Badge></TableCell>
                        <TableCell className="text-right font-mono">{s.next_number}</TableCell>
                        <TableCell><Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Activa" : "Inactiva"}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* USERS */}
        <TabsContent value="users" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader><CardTitle className="text-base">Usuarios y roles</CardTitle></CardHeader>
            <CardContent className="p-0">
              {!userRoles?.length ? (
                <div className="p-8 text-center text-muted-foreground">Sin usuarios registrados</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Desde</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRoles.map((ur) => (
                      <TableRow key={ur.id}>
                        <TableCell className="font-medium">{(ur.profiles as any)?.full_name ?? ur.user_id.slice(0, 8)}</TableCell>
                        <TableCell><Badge>{ur.role}</Badge></TableCell>
                        <TableCell className="text-sm">{format(new Date(ur.created_at), "dd MMM yyyy", { locale: es })}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-COMMERCE */}
        <TabsContent value="ecommerce" className="space-y-4">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Sincronización E-commerce</CardTitle>
              <p className="text-sm text-muted-foreground">NovaSystem es la fuente de verdad para el stock. Los eventos se procesan vía webhooks.</p>
            </CardHeader>
            <CardContent className="p-0">
              {!syncEvents?.length ? (
                <div className="p-8 text-center text-muted-foreground">Sin eventos de sincronización</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Dirección</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Reintentos</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {syncEvents.map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell className="text-sm">{format(new Date(ev.created_at), "dd/MM HH:mm")}</TableCell>
                        <TableCell><Badge variant="outline">{ev.event_type.replace("_", " ")}</Badge></TableCell>
                        <TableCell className="text-sm">{ev.direction === "inbound" ? "← Entrante" : "→ Saliente"}</TableCell>
                        <TableCell><Badge className={syncStatusColors[ev.status] ?? ""}>{ev.status}</Badge></TableCell>
                        <TableCell className="text-center">{ev.retries}</TableCell>
                        <TableCell className="text-sm text-destructive max-w-[200px] truncate">{ev.error_message ?? "—"}</TableCell>
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

export default SettingsPage;
