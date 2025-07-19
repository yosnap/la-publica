import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash, Palette, Save, X, Tag, Layers, 
  Building, Briefcase, Megaphone, HelpCircle, Code, Lightbulb, 
  BookOpen, Calendar, Users, TrendingUp, Heart, Trophy, 
  Music, Zap, Globe, Laptop, Shield, Cpu, Smartphone, 
  Target, UserCheck, DollarSign, Monitor, Server, Settings,
  Image, Award, Search, Calculator, Clipboard, Camera, Video,
  Edit as EditIcon, Wrench, Scale, CheckCircle, PiggyBank
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getCategories,
  getCategoriesTree,
  getCategoryStats,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryData,
  type CategoryStats
} from "@/api/categories";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("company");
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
    color: "#3B82F6",
    icon: "Tag",
    type: "company",
    parentCategory: undefined,
    order: 0
  });

  const iconOptions = [
    { name: "Tag", icon: Tag },
    { name: "Layers", icon: Layers },
    { name: "Building", icon: Building },
    { name: "Briefcase", icon: Briefcase },
    { name: "Megaphone", icon: Megaphone },
    { name: "HelpCircle", icon: HelpCircle },
    { name: "Code", icon: Code },
    { name: "Lightbulb", icon: Lightbulb },
    { name: "BookOpen", icon: BookOpen },
    { name: "Calendar", icon: Calendar },
    { name: "Users", icon: Users },
    { name: "TrendingUp", icon: TrendingUp },
    { name: "Heart", icon: Heart },
    { name: "Trophy", icon: Trophy },
    { name: "Music", icon: Music },
    { name: "Zap", icon: Zap },
    { name: "Globe", icon: Globe },
    { name: "Laptop", icon: Laptop },
    { name: "Shield", icon: Shield },
    { name: "Cpu", icon: Cpu },
    { name: "Smartphone", icon: Smartphone },
    { name: "Target", icon: Target },
    { name: "UserCheck", icon: UserCheck },
    { name: "DollarSign", icon: DollarSign },
    { name: "Monitor", icon: Monitor },
    { name: "Server", icon: Server },
    { name: "Settings", icon: Settings },
    { name: "Image", icon: Image },
    { name: "Award", icon: Award },
    { name: "Search", icon: Search },
    { name: "Calculator", icon: Calculator },
    { name: "Clipboard", icon: Clipboard },
    { name: "Camera", icon: Camera },
    { name: "Video", icon: Video },
    { name: "Edit", icon: EditIcon },
    { name: "Wrench", icon: Wrench },
    { name: "Scale", icon: Scale },
    { name: "CheckCircle", icon: CheckCircle },
    { name: "PiggyBank", icon: PiggyBank }
  ];

  const typeOptions = [
    { value: "company", label: "Empresas" },
    { value: "job", label: "Ofertas de Trabajo" },
    { value: "announcement", label: "Anuncios" },
    { value: "advisory", label: "Asesorías" },
    { value: "blog", label: "Blogs" }
  ];

  const loadCategories = async () => {
    try {
      const response = await getCategories({ type: selectedType });
      setCategories(response.data);
    } catch (error) {
      toast.error("Error en carregar les categories");
    }
  };

  const loadStats = async () => {
    try {
      const response = await getCategoryStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error en carregar estadístiques:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCategories(), loadStats()]);
      setLoading(false);
    };
    loadData();
  }, [selectedType]);

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error("El nom és requerit");
      return;
    }

    try {
      await createCategory({
        ...formData,
        type: selectedType as any,
        parentCategory: formData.parentCategory || undefined
      });
      toast.success("Categoria creada exitosament");
      setIsCreateOpen(false);
      resetForm();
      await loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error en crear la categoria");
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error("El nom és requerit");
      return;
    }

    try {
      await updateCategory(editingCategory._id, {
        ...formData,
        parentCategory: formData.parentCategory || undefined
      });
      toast.success("Categoría actualizada exitosamente");
      setEditingCategory(null);
      resetForm();
      await loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar la categoría");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return;

    try {
      await deleteCategory(id);
      toast.success("Categoría eliminada exitosamente");
      await loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar la categoría");
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await updateCategory(category._id, {
        isActive: !category.isActive
      });
      toast.success(`Categoría ${category.isActive ? 'desactivada' : 'activada'} exitosamente`);
      await loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cambiar el estado");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      color: "#3B82F6",
      icon: "Tag",
      type: selectedType as any,
      parentCategory: undefined,
      order: 0
    });
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#3B82F6",
      icon: category.icon || "Tag",
      type: category.type,
      parentCategory: category.parentCategory || undefined,
      order: category.order
    });
  };

  const getIconComponent = (iconName: string) => {
    const iconOption = iconOptions.find(option => option.name === iconName);
    return iconOption ? iconOption.icon : Tag;
  };

  const parentCategories = categories.filter(cat => !cat.parentCategory);
  const getSubcategories = (parentId: string) => 
    categories.filter(cat => cat.parentCategory === parentId);

  const getTypeStats = (type: string) => {
    return stats.find(s => s._id === type);
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Gestión de Categorías</h1>
            <p className="text-gray-600">
              Administra las categorías para empresas, ofertas de trabajo, anuncios y asesorías
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear Nueva Categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nombre de la categoría"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="parent">Categoría Padre (opcional)</Label>
                  <Select value={formData.parentCategory || ""} onValueChange={(value) => setFormData({...formData, parentCategory: value || undefined})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría padre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin categoría padre</SelectItem>
                      {parentCategories.filter(cat => cat.type === formData.type).map(category => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción de la categoría"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="order">Orden</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Icono</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2 max-h-32 overflow-y-auto">
                    {iconOptions.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <Button
                          key={option.name}
                          variant={formData.icon === option.name ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, icon: option.name})}
                          className="h-10 w-10 p-0"
                        >
                          <IconComponent className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {typeOptions.map(type => {
            const typeStats = getTypeStats(type.value);
            return (
              <Card key={type.value}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{type.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{typeStats?.total || 0}</div>
                  <div className="text-xs text-gray-500">
                    {typeStats?.active || 0} activas, {typeStats?.inactive || 0} inactivas
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          <Label className="text-sm font-medium self-center">Tipo:</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {typeOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Categories List */}
        <div className="space-y-4">
          {parentCategories.map(category => {
            const IconComponent = getIconComponent(category.icon || "Tag");
            const subcategories = getSubcategories(category._id);
            
            return (
              <Card key={category._id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg text-white"
                        style={{ backgroundColor: category.color }}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description && (
                          <p className="text-sm text-gray-600">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      <Switch
                        checked={category.isActive}
                        onCheckedChange={() => handleToggleActive(category)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {subcategories.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Subcategorías:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {subcategories.map(subcat => {
                          const SubIconComponent = getIconComponent(subcat.icon || "Tag");
                          return (
                            <div key={subcat._id} className="flex items-center gap-2 p-2 border rounded">
                              <div 
                                className="p-1 rounded text-white"
                                style={{ backgroundColor: subcat.color }}
                              >
                                <SubIconComponent className="h-3 w-3" />
                              </div>
                              <span className="text-sm">{subcat.name}</span>
                              <div className="ml-auto flex items-center gap-1">
                                <Switch
                                  checked={subcat.isActive}
                                  onCheckedChange={() => handleToggleActive(subcat)}
                                  className="scale-75"
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEdit(subcat)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(subcat._id)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Edit Dialog */}
        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nombre</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nombre de la categoría"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-type">Tipo</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-parent">Categoría Padre (opcional)</Label>
                  <Select value={formData.parentCategory || ""} onValueChange={(value) => setFormData({...formData, parentCategory: value || undefined})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría padre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin categoría padre</SelectItem>
                      {parentCategories.filter(cat => cat.type === formData.type && cat._id !== editingCategory._id).map(category => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción de la categoría"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-color">Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="edit-color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-16 h-10"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-order">Orden</Label>
                    <Input
                      id="edit-order"
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label>Icono</Label>
                  <div className="grid grid-cols-8 gap-2 mt-2 max-h-32 overflow-y-auto">
                    {iconOptions.map(option => {
                      const IconComponent = option.icon;
                      return (
                        <Button
                          key={option.name}
                          variant={formData.icon === option.name ? "default" : "outline"}
                          size="sm"
                          onClick={() => setFormData({...formData, icon: option.name})}
                          className="h-10 w-10 p-0"
                        >
                          <IconComponent className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingCategory(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdate}>
                    Actualizar Categoría
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageWrapper>
  );
};

export default Categories;