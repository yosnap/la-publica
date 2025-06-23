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

export function TopNavigation() {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <SidebarTrigger className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar miembros, grupos, actividades..."
              className="pl-10 bg-gray-50 border-0 focus:bg-white focus:ring-2 focus:ring-[#4F8FF7]/20 rounded-xl"
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
            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-xl">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </Badge>
            </Button>

            <Button variant="ghost" size="sm" className="relative hover:bg-gray-100 rounded-xl">
              <Bell className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-[#4F8FF7] text-white text-xs flex items-center justify-center">
                7
              </Badge>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white border border-gray-200 rounded-xl shadow-lg" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Jane Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      jane.doe@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/perfil')} className="hover:bg-gray-50 rounded-lg cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/editar-perfil')} className="hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 rounded-lg cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 rounded-lg cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Ayuda</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="hover:bg-gray-50 rounded-lg cursor-pointer text-red-600 focus:text-red-600">
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
