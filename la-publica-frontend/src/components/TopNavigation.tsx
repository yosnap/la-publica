import { Bell, Search, MessageSquare, Plus, Menu, User, Edit, Settings, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import apiClient from "@/api/client";
import { getImageUrl } from '@/utils/getImageUrl';

export function TopNavigation() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/users/profile');
        if (response.data.success) {
          setUser(response.data.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
     // Eliminar el token del localStorage
    localStorage.removeItem('authToken');
     // Redirigir al login
    navigate('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <SidebarTrigger className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </SidebarTrigger>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1 /2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
            <Input
              placeholder="Buscar miembros, grupos, actividades..."
              className="pl-10 bg-gray-50 dark:bg-gray-700 border-0 focus:bg-white dark:focus:bg-gray-600 focus:ring-2 focus:ring-[#4F8FF7]/20 rounded-xl text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="default"
            size="sm"
            className="bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white rounded-xl"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Crear Post</span>
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>

            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">
              <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-[#4F8FF7] text-white text-xs flex items-center justify-center">
                7
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getImageUrl(user?.profilePicture)} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')} className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/editar-perfil')} className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Ayuda</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
