import {
  LayoutDashboard,
  Package,
  Warehouse,
  ShoppingCart,
  Users,
  FileText,
  Truck,
  Landmark,
  Receipt,
  BarChart3,
  BookOpen,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "TPV / Ventas", url: "/pos", icon: ShoppingCart },
  { title: "Productos", url: "/products", icon: Package },
  { title: "Inventario", url: "/inventory", icon: Warehouse },
  { title: "Clientes", url: "/customers", icon: Users },
];

const managementNav = [
  { title: "Facturación", url: "/invoicing", icon: FileText },
  { title: "Proveedores", url: "/suppliers", icon: Truck },
  { title: "Caja y Bancos", url: "/cash", icon: Landmark },
  { title: "Gastos", url: "/expenses", icon: Receipt },
];

const reportsNav = [
  { title: "Informes", url: "/reports", icon: BarChart3 },
  { title: "Contabilidad", url: "/accounting", icon: BookOpen },
  { title: "Configuración", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderItems = (items: typeof mainNav) =>
    items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild isActive={location.pathname === item.url}>
          <NavLink
            to={item.url}
            end={item.url === "/"}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-semibold text-sidebar-foreground tracking-tight">
                NovaSystem
              </h1>
              <p className="text-[11px] text-muted-foreground">Gestión integral</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground px-3">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(mainNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground px-3">
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(managementNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground px-3">
            Reportes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(reportsNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground text-center">
            NovaSystem v1.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
