import { Card, CardContent } from "@/components/ui/card";
import { Edit2, User, Image as ImageIcon } from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ProfileEditSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const sidebarItems: SidebarItem[] = [
  { id: "edit", label: "Editar", icon: Edit2 },
  { id: "profile-photo", label: "Foto de Perfil", icon: User },
  { id: "cover-photo", label: "Foto de Portada", icon: ImageIcon }
];

export const ProfileEditSidebar = ({ activeTab, onTabChange }: ProfileEditSidebarProps) => {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-0">
        <div className="space-y-0">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-4 text-left transition-colors ${
                activeTab === item.id 
                  ? "bg-[#4F8FF7] text-white" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};