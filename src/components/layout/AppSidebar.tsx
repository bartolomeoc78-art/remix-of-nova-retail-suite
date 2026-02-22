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
  Bot,
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
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
};

const mainNav: NavItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard, color: "text-module-sales", bgColor: "bg-module-sales-light" },
  { title: "TPV / Ventas", url: "/pos", icon: ShoppingCart, color: "text-module-sales", bgColor: "bg-module-sales-light" },
  { title: "Productos", url: "/products", icon: Package, color: "text-module-products", bgColor: "bg-module-products-light" },
  { title: "Inventario", url: "/inventory", icon: Warehouse, color: "text-module-inventory", bgColor: "bg-module-inventory-light" },
  { title: "Clientes", url: "/customers", icon: Users, color: "text-module-customers", bgColor: "bg-module-customers-light" },
];

const managementNav: NavItem[] = [
  { title: "Facturación", url: "/invoicing", icon: FileText, color: "text-module-invoicing", bgColor: "bg-module-invoicing-light" },
  { title: "Proveedores", url: "/suppliers", icon: Truck, color: "text-module-suppliers", bgColor: "bg-module-suppliers-light" },
  { title: "Caja y Bancos", url: "/cash", icon: Landmark, color: "text-module-cash", bgColor: "bg-module-cash-light" },
  { title: "Gastos", url: "/expenses", icon: Receipt, color: "text-module-expenses", bgColor: "bg-module-expenses-light" },
];

const reportsNav: NavItem[] = [
  { title: "Informes", url: "/reports", icon: BarChart3, color: "text-module-reports", bgColor: "bg-module-reports-light" },
  { title: "Contabilidad", url: "/accounting", icon: BookOpen, color: "text-module-accounting", bgColor: "bg-module-accounting-light" },
  { title: "Asistentes IA", url: "/assistants", icon: Bot, color: "text-module-products", bgColor: "bg-module-products-light" },
  { title: "Configuración", url: "/settings", icon: Settings, color: "text-muted-foreground", bgColor: "bg-secondary" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const renderItems = (items: NavItem[]) =>
    items.map((item) => {
      const isActive = location.pathname === item.url;
      return (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={isActive}>
            <NavLink
              to={item.url}
              end={item.url === "/"}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-accent group ${
                isActive ? `${item.bgColor}` : ""
              }`}
              activeClassName=""
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? `${item.bgColor}` : "bg-transparent group-hover:bg-secondary"
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? item.color : "text-muted-foreground group-hover:" + item.color}`} />
              </div>
              {!collapsed && (
                <span className={isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}>
                  {item.title}
                </span>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">N</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-semibold text-foreground tracking-tight">
                NovaSystem
              </h1>
              <p className="text-[11px] text-muted-foreground">Gestión integral</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">{renderItems(mainNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">{renderItems(managementNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-3 mb-1">
            Reportes
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">{renderItems(reportsNav)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed && (
          <p className="text-[10px] text-muted-foreground/50 text-center">
            NovaSystem v1.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
