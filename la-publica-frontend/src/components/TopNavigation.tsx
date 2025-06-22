
import { Bell, Search, MessageSquare, Plus, Menu } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";

export function TopNavigation() {
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
                <DropdownMenuItem className="hover:bg-gray-50 rounded-lg">Mi Perfil</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 rounded-lg">Configuración</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 rounded-lg">Ayuda</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-50 rounded-lg">Cerrar Sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
