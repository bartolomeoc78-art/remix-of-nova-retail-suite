import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/pos": "TPV / Ventas",
  "/products": "Productos",
  "/inventory": "Inventario",
  "/customers": "Clientes",
  "/invoicing": "Facturación",
  "/suppliers": "Proveedores",
  "/cash": "Caja y Bancos",
  "/expenses": "Gastos",
  "/reports": "Informes",
  "/accounting": "Contabilidad",
  "/settings": "Configuración",
};

export function AppLayout() {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "NovaSystem";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-14 border-b flex items-center gap-3 px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="shrink-0" />
            <Separator orientation="vertical" className="h-5" />
            <h2 className="text-sm font-semibold text-foreground truncate">
              {title}
            </h2>
            <div className="ml-auto flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="w-64 pl-9 h-9 bg-secondary border-0 text-sm"
                />
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">A</span>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
