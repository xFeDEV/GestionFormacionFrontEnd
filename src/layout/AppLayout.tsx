import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { NotificationProvider } from "../context/NotificationContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { navItems } from "./AppSidebar";

// Crear el mapa de títulos para búsqueda rápida
const routeTitles = new Map<string, string>();
navItems.forEach((item) => {
  if (item.path) routeTitles.set(item.path, item.name);
  if (item.subItems) {
    item.subItems.forEach((subItem) => {
      if (subItem.path) routeTitles.set(subItem.path, subItem.name);
    });
  }
});

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { pathname } = useLocation();

  useEffect(() => {
    const title = routeTitles.get(pathname);
    if (title) {
      document.title = `${title} | Gestión Formación`;
    } else {
      // Título por defecto para la página principal o rutas no encontradas
      document.title = "Dashboard | Gestión Formación";
    }
  }, [pathname]);

  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <LayoutContent />
      </NotificationProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
