import { useState } from "react";
import { Users, Plus, Search, Trash2, Building2, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, type Customer,
} from "@/hooks/useCustomers";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";

const Customers = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: customers, isLoading } = useCustomers(debouncedSearch);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout((window as any).__custSearchTimer);
    (window as any).__custSearchTimer = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const handleCreate = () => { setEditing(null); setFormOpen(true); };
  const handleEdit = (c: Customer) => { setEditing(c); setFormOpen(true); };

  const handleSubmit = async (data: any) => {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, ...data });
        toast({ title: "Cliente actualizado" });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: "Cliente creado" });
      }
      setFormOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({ title: "Cliente eliminado" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {customers?.length ?? 0} clientes activos
          </p>
        </div>
        <Button className="gap-2 bg-module-customers hover:bg-module-customers/90" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, NIF o email..."
          className="pl-9"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : customers && customers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>NIF</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Ciudad</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEdit(c)}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${c.is_business ? "bg-module-suppliers-light" : "bg-module-customers-light"}`}>
                          {c.is_business ? <Building2 className="h-4 w-4 text-module-suppliers" /> : <User className="h-4 w-4 text-module-customers" />}
                        </div>
                        <span className="font-medium">{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.nif || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.phone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{c.city || "—"}</TableCell>
                    <TableCell>
                      {c.is_business ? (
                        <Badge className="bg-module-suppliers-light text-module-suppliers border-0 text-xs">B2B</Badge>
                      ) : (
                        <Badge className="bg-module-customers-light text-module-customers border-0 text-xs">B2C</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-module-customers-light flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-module-customers" />
              </div>
              <h3 className="text-lg font-medium">Sin clientes registrados</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Los clientes son opcionales. Puedes vender sin registrar cliente.
              </p>
              <Button className="mt-4 gap-2 bg-module-customers hover:bg-module-customers/90" onClick={handleCreate}>
                <Plus className="h-4 w-4" />
                Crear cliente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomerFormDialog
        open={formOpen} onOpenChange={setFormOpen} customer={editing}
        onSubmit={handleSubmit} loading={createMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cliente?</AlertDialogTitle>
            <AlertDialogDescription>El cliente se desactivará del sistema.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
