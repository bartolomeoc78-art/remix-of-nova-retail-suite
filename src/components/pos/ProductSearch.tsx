import { useState, useRef, useEffect } from "react";
import { Search, Barcode } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";
import type { CartItem } from "@/hooks/usePOS";

type Props = {
  onSelect: (product: CartItem["product"]) => void;
};

export function ProductSearch({ onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products } = useProducts(debouncedSearch);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (product: CartItem["product"]) => {
    onSelect(product);
    setSearch("");
    setDebouncedSearch("");
    inputRef.current?.focus();
  };

  // Auto-select if EAN exact match (barcode scanner)
  useEffect(() => {
    if (debouncedSearch.length >= 8 && products?.length === 1) {
      const p = products[0];
      if (p.ean === debouncedSearch || p.sku === debouncedSearch) {
        handleSelect(p as any);
      }
    }
  }, [products, debouncedSearch]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);

  return (
    <div className="flex flex-col h-full">
      <div className="relative mb-3">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Escanear código de barras o buscar producto..."
          className="pl-9 h-11 text-base border-0 bg-secondary rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Barcode className="absolute right-3 top-3 h-4 w-4 text-muted-foreground/50" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {search.trim() && products && products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {products.map((p: any) => (
              <button
                key={p.id}
                onClick={() => handleSelect(p)}
                className="flex flex-col items-start p-3 rounded-xl border bg-card hover:bg-accent hover:border-module-sales/30 transition-all text-left group"
              >
                <span className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-module-sales">
                  {p.name}
                </span>
                <span className="text-xs text-muted-foreground mt-1">{p.sku || p.ean || "—"}</span>
                <div className="flex items-center justify-between w-full mt-2">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(p.sale_price)}
                  </span>
                  <span className={`text-xs ${p.stock_on_hand <= (p.stock_min ?? 0) ? "text-module-expenses font-medium" : "text-muted-foreground"}`}>
                    {p.stock_on_hand} uds
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : search.trim() && products?.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No se encontraron productos
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-module-sales-light flex items-center justify-center mb-4">
              <Barcode className="h-8 w-8 text-module-sales" />
            </div>
            <h3 className="text-lg font-medium text-foreground">Listo para vender</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Escanea un código de barras o escribe para buscar productos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
