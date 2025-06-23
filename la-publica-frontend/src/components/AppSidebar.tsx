import { Home, Users, MessageSquare, Settings, User, Calendar, Bell, Search, MessageCircle, Building, Briefcase, Megaphone, HelpCircle, ExternalLink } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Mi Perfil",
    url: "/perfil",
    icon: User,
  },
  {
    title: "Grupos",
    url: "/groups",
    icon: Users,
  },
  {
    title: "Mensajes",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Foros",
    url: "/forums",
    icon: MessageCircle,
  },
];

const businessItems = [
  {
    title: "Empresas y Colaboradores",
    url: "/companies",
    icon: Building,
  },
  {
    title: "Ofertas",
    url: "/offers",
    icon: Briefcase,
  },
  {
    title: "Anuncios",
    url: "/announcements",
    icon: Megaphone,
  },
  {
    title: "Asesoramiento",
    url: "/consulting",
    icon: HelpCircle,
  },
  {
    title: "Enlaces de Interés",
    url: "/links",
    icon: ExternalLink,
  },
];

const quickActions = [
  {
    title: "Buscar",
    icon: Search,
  },
  {
    title: "Notificaciones",
    icon: Bell,
  },
  {
    title: "Calendario",
    icon: Calendar,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-gray-200 bg-white" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center">
          <div className="w-8 h-8 bg-[#4F8FF7] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">LP</span>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h2 className="text-lg font-semibold text-gray-900">La pública</h2>
            <p className="text-xs text-gray-500">Comunidad Social</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Navegación Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`${
                      location.pathname === item.url 
                        ? 'bg-[#4F8FF7] text-white hover:bg-[#4F8FF7]/90' 
                        : 'hover:bg-gray-100 text-gray-700'
                    } rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center`}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 px-3 py-2">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Empresas y Negocios
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`${
                      location.pathname === item.url 
                        ? 'bg-[#4F8FF7] text-white hover:bg-[#4F8FF7]/90' 
                        : 'hover:bg-gray-100 text-gray-700'
                    } rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center`}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 px-3 py-2">
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Acciones Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton 
                    className="hover:bg-gray-100 text-gray-700 rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center"
                    tooltip={action.title}
                  >
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <action.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">{action.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Configuración
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  className={`${
                    location.pathname === "/settings" 
                      ? 'bg-[#4F8FF7] text-white hover:bg-[#4F8FF7]/90' 
                      : 'hover:bg-gray-100 text-gray-700'
                  } rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:justify-center`}
                  tooltip="Configuración"
                >
                  <Link to="/settings" className="flex items-center space-x-3 px-3 py-2">
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">Configuración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-gray-900 truncate">
              John Doe
            </p>
            <p className="text-xs text-gray-500 truncate">
              john@example.com
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
