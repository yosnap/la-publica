import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Palette, Save, X } from "lucide-react";
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
  fetchGroupCategories,
  createGroupCategory,
  updateGroupCategory,
  deleteGroupCategory,
  type GroupCategory
} from "@/api/groups";

const GroupCategories = () => {
  const [categories, setCategories] = useState<GroupCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<GroupCategory | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#4F8FF7",
    icon: "Users"
  });

  const iconOptions = [
    "Users", "Code", "Briefcase", "TrendingUp", "Palette", 
    "DollarSign", "BookOpen", "Heart", "Trophy", "Music", 
    "Microscope", "Rocket", "Camera", "Globe", "Zap"
  ];

  const colorPresets = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6366F1"
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetchGroupCategories();
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
      const response = await createGroupCategory(formData);
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
      const response = await updateGroupCategory(editingCategory._id, formData);
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

  const handleToggleActive = async (category: GroupCategory) => {
    try {
      const response = await updateGroupCategory(category._id, {
        isActive: !category.isActive
      });
      if (response.success) {
        toast.success(category.isActive ? "Categoría desactivada" : "Categoría activada");
        loadCategories();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al cambiar el estado");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta categoría?")) return;
    
    try {
      const response = await deleteGroupCategory(id);
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
      color: "#4F8FF7",
      icon: "Users"
    });
  };

  const startEdit = (category: GroupCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#4F8FF7",
      icon: category.icon || "Users"
    });
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    resetForm();
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        { /* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categorías de Grupos</h1>
            <p className="text-gray-600">Administra las categorías disponibles para los grupos</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Tecnología"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción de la categoría..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-20 h-10"
                    />
                    <div className="flex space-x-1">
                      {colorPresets.map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded border-2 border-gray-200"
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData({ ...formData, color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Icono</Label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    {iconOptions.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
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

        { /* Lista de categorías */}
        {loading ? (
          <div className="text-center py-8">Cargando categorías...</div>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category._id} className="shadow-sm">
                <CardContent className="p-6">
                  {editingCategory?._id === category._id ? (
                     // Modo edición
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Color</Label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="color"
                              value={formData.color}
                              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                              className="w-full h-10"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label>Descripción</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={cancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleUpdate}>
                          <Save className="h-4 w-4 mr-1" />
                          Guardar
                        </Button>
                      </div>
                    </div>
                  ) : (
                     // Modo vista
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: category.color + '20' }}
                        >
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold">{category.name}</h3>
                            {!category.isActive && (
                              <Badge variant="secondary">Inactiva</Badge>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-600">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
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
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default GroupCategories;