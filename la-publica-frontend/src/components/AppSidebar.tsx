import { useState, useEffect } from "react";
import { Home, Users, MessageSquare, Settings, User, Calendar, Bell, Search, MessageCircle, Building, Briefcase, Megaphone, HelpCircle, ExternalLink, Shield, Tag, PanelLeftClose, PanelLeft, Moon, Sun, Database, Layers, HardDrive, BookOpen } from "lucide-react";
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
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/utils/getImageUrl";
import { useUserProfile } from "@/hooks/useUser";

const menuItems = [
  {
    title: "Tauler",
    url: "/",
    icon: Home,
  },
  {
    title: "El Meu Perfil",
    url: "/perfil",
    icon: User,
  },
  {
    title: "Miembros",
    url: "/miembros",
    icon: Users,
  },
  {
    title: "Grups",
    url: "/groups",
    icon: Users,
  },
  {
    title: "Missatges",
    url: "/messages",
    icon: MessageSquare,
  },
  {
    title: "Fòrums",
    url: "/forums",
    icon: MessageCircle,
  },
  {
    title: "Blogs",
    url: "/blogs",
    icon: BookOpen,
  },
  {
    title: "Anuncis",
    url: "/announcements",
    icon: Megaphone,
  },
];

const businessItems = [
  {
    title: "Empreses i Col·laboradors",
    url: "/companies",
    icon: Building,
  },
  {
    title: "Ofertes",
    url: "/ofertes",
    icon: Briefcase,
  },
  {
    title: "Assessorament",
    url: "/assessorament",
    icon: HelpCircle,
  },
  {
    title: "Enllaços d'Interès",
    url: "/links",
    icon: ExternalLink,
  },
];

const collaboratorItems = [
  {
    title: "Les Meves Empreses",
    url: "/colaborador/empresas",
    icon: Building,
  },
  {
    title: "Les Meves Ofertes",
    url: "/colaborador/ofertas",
    icon: Briefcase,
  },
  {
    title: "Les Meves Assessories",
    url: "/colaborador/asesorias",
    icon: HelpCircle,
  },
];

const quickActions = [
  {
    title: "Cercar",
    icon: Search,
  },
  {
    title: "Notificacions",
    icon: Bell,
  },
  {
    title: "Calendari",
    icon: Calendar,
  },
];

const adminItems = [
  {
    title: "Panell d'Administració",
    url: "/admin",
    icon: Shield,
  },
  {
    title: "Categories de Grups",
    url: "/admin/group-categories",
    icon: Tag,
  },
  {
    title: "Categories de Fòrums",
    url: "/admin/forum-categories",
    icon: MessageCircle,
  },
  {
    title: "Categories Globals",
    url: "/admin/categories",
    icon: Layers,
  },
  {
    title: "Moderació de Fòrums",
    url: "/admin/forum-moderation",
    icon: MessageCircle,
  },
  {
    title: "Còpia de Seguretat",
    url: "/admin/platform-backup",
    icon: Database,
  },
  {
    title: "Backup Granular",
    url: "/admin/granular-backup",
    icon: HardDrive,
  },
  {
    title: "Gestió de Dades",
    url: "/admin/data-management",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  // Usar el hook centralizado para los datos del usuario
  const { user } = useUserProfile();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { state } = useSidebar();

  useEffect(() => {
     // Cargar preferencia de modo oscuro
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Sidebar className="border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700" collapsible="icon" style={{ "--sidebar-width-icon": "4rem" } as React.CSSProperties}>
      <SidebarHeader className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#4F8FF7] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">LP</span>
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">La pública</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Comunitat Social</p>
            </div>
          </div>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 group-data-[collapsible=icon]:px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Navegació Principal
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
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    } rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto`}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
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
          <SidebarGroupLabel className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Empreses i Negocis
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
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    } rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto`}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
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
          <SidebarGroupLabel className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
            Acciones Rápidas
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickActions.map((action) => (
                <SidebarMenuItem key={action.title}>
                  <SidebarMenuButton 
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
                    tooltip={action.title}
                  >
                    <div className="flex items-center space-x-3 px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
                      <action.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium group-data-[collapsible=icon]:hidden">{action.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sección para colaboradores */}
        {user?.role === 'colaborador' && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
              Mi Gestión
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {collaboratorItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`${
                        location.pathname === item.url 
                          ? 'bg-[#4F8FF7] text-white hover:bg-[#4F8FF7]/90' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      } rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto`}
                      tooltip={item.title}
                    >
                      <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="font-medium group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        { /* Sección de Administración - Solo para admins */}
        {isAdmin && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>Administración</span>
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`${
                        location.pathname === item.url 
                          ? 'bg-[#4F8FF7] text-white hover:bg-[#4F8FF7]/90' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
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
        )}

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider mb-2 group-data-[collapsible=icon]:hidden">
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
                  } rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto`}
                  tooltip="Configuració"
                >
                  <Link to="/settings" className="flex items-center space-x-3 px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
                    <Settings className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium group-data-[collapsible=icon]:hidden">Configuració</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={toggleDarkMode}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl mb-1 h-12 group-data-[collapsible=icon]:w-14 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-auto"
                  tooltip={isDarkMode ? "Mode Clar" : "Mode Fosc"}
                >
                  <div className="flex items-center space-x-3 px-3 py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:space-x-0">
                    {isDarkMode ? (
                      <Sun className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <Moon className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span className="font-medium group-data-[collapsible=icon]:hidden">
                      {isDarkMode ? "Mode Clar" : "Mode Fosc"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={getImageUrl(user?.profilePicture)} />
            <AvatarFallback>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
