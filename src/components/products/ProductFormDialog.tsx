import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCategories, useBrands, useTaxRates, type Product } from "@/hooks/useProducts";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Nombre obligatorio"),
  sku: z.string().optional(),
  ean: z.string().optional(),
  description: z.string().optional(),
  cost_price: z.coerce.number().min(0, "≥ 0"),
  sale_price: z.coerce.number().min(0, "≥ 0"),
  stock_on_hand: z.coerce.number().default(0),
  stock_min: z.coerce.number().optional(),
  reorder_point: z.coerce.number().optional(),
  unit: z.string().default("uds"),
  location: z.string().optional(),
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  tax_rate_id: z.string().optional(),
  track_lots: z.boolean().default(false),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (data: FormValues & { tags?: string[] }) => void;
  loading?: boolean;
}

export function ProductFormDialog({ open, onOpenChange, product, onSubmit, loading }: Props) {
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: taxRates } = useTaxRates();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "", sku: "", ean: "", description: "", cost_price: 0, sale_price: 0,
      stock_on_hand: 0, stock_min: 0, reorder_point: undefined, unit: "uds",
      location: "", category_id: "", brand_id: "", tax_rate_id: "", track_lots: false, tags: "",
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku ?? "",
        ean: product.ean ?? "",
        description: product.description ?? "",
        cost_price: product.cost_price,
        sale_price: product.sale_price,
        stock_on_hand: product.stock_on_hand,
        stock_min: product.stock_min ?? 0,
        reorder_point: product.reorder_point ?? undefined,
        unit: product.unit ?? "uds",
        location: product.location ?? "",
        category_id: product.category_id ?? "",
        brand_id: product.brand_id ?? "",
        tax_rate_id: product.tax_rate_id ?? "",
        track_lots: product.track_lots ?? false,
        tags: product.tags?.join(", ") ?? "",
      });
    } else {
      form.reset({
        name: "", sku: "", ean: "", description: "", cost_price: 0, sale_price: 0,
        stock_on_hand: 0, stock_min: 0, reorder_point: undefined, unit: "uds",
        location: "", category_id: "", brand_id: "", tax_rate_id: "", track_lots: false, tags: "",
      });
    }
  }, [product, open]);

  const handleSubmit = (values: FormValues) => {
    const tags = values.tags
      ? values.tags.split(",").map(t => t.trim()).filter(Boolean)
      : [];
    const { tags: _, category_id, brand_id, tax_rate_id, ...rest } = values;
    onSubmit({
      ...rest,
      category_id: category_id || null,
      brand_id: brand_id || null,
      tax_rate_id: tax_rate_id || null,
      tags,
    } as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="ean" render={({ field }) => (
                <FormItem>
                  <FormLabel>EAN / Código barras</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea rows={2} {...field} /></FormControl>
              </FormItem>
            )} />

            {/* Prices */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="cost_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio coste (€)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="sale_price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio venta (€)</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="tax_rate_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo IVA</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taxRates?.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.name} ({t.rate}%)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            {/* Stock */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField control={form.control} name="stock_on_hand" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock actual</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="stock_min" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock mínimo</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="unit" render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidad</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            {/* Classification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="category_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="brand_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {brands?.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="tags" render={({ field }) => (
              <FormItem>
                <FormLabel>Etiquetas (separadas por coma)</FormLabel>
                <FormControl><Input placeholder="eco, sin gluten, vegano..." {...field} /></FormControl>
              </FormItem>
            )} />

            <FormField control={form.control} name="track_lots" render={({ field }) => (
              <FormItem className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0">Control por lotes / caducidad</FormLabel>
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {product ? "Guardar cambios" : "Crear producto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
