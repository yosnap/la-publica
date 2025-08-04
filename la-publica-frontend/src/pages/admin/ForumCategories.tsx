import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash, Palette, Save, X, MessageSquare, MessageCircle, 
  Users, HelpCircle, Code, Lightbulb, BookOpen, Calendar, 
  Briefcase, UserPlus, Hash, TrendingUp, Heart, Trophy, 
  Music, Zap, Globe 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/PageWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  fetchForumCategories,
  createForumCategory,
  updateForumCategory,
  deleteForumCategory,
  type ForumCategory
} from "@/api/forumCategories";

const ForumCategories = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<ForumCategory | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#10B981",
    icon: "MessageSquare"
  });

  const iconOptions = [
    { name: "MessageSquare", icon: MessageSquare },
    { name: "MessageCircle", icon: MessageCircle },
    { name: "Users", icon: Users },
    { name: "HelpCircle", icon: HelpCircle },
    { name: "Code", icon: Code },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "BookOpen", icon: BookOpen },
    { name: "Calendar", icon: Calendar },
    { name: "Briefcase", icon: Briefcase },
    { name: "UserPlus", icon: UserPlus },
    { name: "Hash", icon: Hash },
    { name: "TrendingUp", icon: TrendingUp },
    { name: "Heart", icon: Heart },
    { name: "Trophy", icon: Trophy },
    { name: "Music", icon: Music },
    { name: "Zap", icon: Zap },
    { name: "Globe", icon: Globe }
  ];

  const colorPresets = [
    "#10B981", "#4F8FF7", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetchForumCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await createForumCategory(formData);
      if (response.success) {
        toast.success("Categoría creada exitosamente");
        setIsCreateOpen(false);
        resetForm();
        loadCategories();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear la categoría");
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;
    
    try {
      const response = await updateForumCategory(editingCategory._id, formData);
      if (response.success) {
        toast.success("Categoría actualizada exitosamente");
        setEditingCategory(null);
        resetForm();
        loadCategories();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar la categoría");
    }
  };

  const handleToggleActive = async (category: ForumCategory) => {
    try {
      const response = await updateForumCategory(category._id, {
        ...category,
        isActive: !category.isActive
      });
      if (response.success) {
        toast.success(`Categoría ${category.isActive ? 'desactivada' : 'activada'} exitosamente`);
        loadCategories();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar la categoría");
    }
  };

  const handleDelete = async (category: ForumCategory) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return;
    
    try {
      const response = await deleteForumCategory(category._id);
      if (response.success) {
        toast.success("Categoría eliminada exitosamente");
        loadCategories();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar la categoría");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "#10B981",
      icon: "MessageSquare"
    });
  };

  const openEditModal = (category: ForumCategory) => {
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#10B981",
      icon: category.icon || "MessageSquare"
    });
    setEditingCategory(category);
  };

  const closeEditModal = () => {
    setEditingCategory(null);
    resetForm();
  };

  if (loading) {
    return (
      <PageWrapper title="Categorías de Foros">
        <div className="text-center">Cargando categorías...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Categorías de Foros">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Gestión de Categorías de Foros</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Administra las categorías disponibles para los foros de la plataforma
            </p>
          </div>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Nueva Categoría</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre de la categoría"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción de la categoría"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    {colorPresets.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-12 h-8 p-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Icono</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {iconOptions.map((iconOption) => {
                      const IconComponent = iconOption.icon;
                      return (
                        <button
                          key={iconOption.name}
                          type="button"
                          className={`p-3 rounded-lg border text-center flex flex-col items-center space-y-1 transition-colors ${
                            formData.icon === iconOption.name 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                              : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300'
                          }`}
                          onClick={() => setFormData({ ...formData, icon: iconOption.name })}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span className="text-xs">{iconOption.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate}>
                    Crear Categoría
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category._id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: category.color }}
                    >
                      {(() => {
                        const iconOption = iconOptions.find(opt => opt.name === category.icon);
                        if (iconOption) {
                          const IconComponent = iconOption.icon;
                          return <IconComponent className="h-5 w-5" />;
                        }
                        return <MessageSquare className="h-5 w-5" />;
                      })()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openEditModal(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {category.description || "Sin descripción"}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Icono: {category.icon}
                  </div>
                  <Switch
                    checked={category.isActive}
                    onCheckedChange={() => handleToggleActive(category)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        { /* Modal de Edición */}
        <Dialog open={!!editingCategory} onOpenChange={closeEditModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Categoría</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre de la categoría"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción de la categoría"
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Color</Label>
                <div className="flex items-center space-x-2 mt-2">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-8 p-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Icono</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {iconOptions.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.name}
                        type="button"
                        className={`p-3 rounded-lg border text-center flex flex-col items-center space-y-1 transition-colors ${
                          formData.icon === iconOption.name 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                            : 'border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300'
                        }`}
                        onClick={() => setFormData({ ...formData, icon: iconOption.name })}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-xs">{iconOption.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={closeEditModal}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdate}>
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
};

export default ForumCategories;