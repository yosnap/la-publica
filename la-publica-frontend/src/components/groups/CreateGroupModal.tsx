import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, X, Upload, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { createGroup, fetchGroupCategories, type GroupCategory } from "@/api/groups";
import apiClient from "@/api/client";

const createGroupSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(500, "La descripción no puede exceder 500 caracteres"),
  category: z.string().min(1, "Debes seleccionar una categoría"),
  privacy: z.enum(["public", "private"]),
  location: z.string().optional(),
  website: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

interface CreateGroupModalProps {
  children: React.ReactNode;
  onGroupCreated?: () => void;
}

export const CreateGroupModal = ({ children, onGroupCreated }: CreateGroupModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<GroupCategory[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      privacy: "public",
    },
  });

  const privacy = watch("privacy");

   // Cargar categorías al abrir el modal
  useEffect(() => {
    if (open) {
      fetchGroupCategories()
        .then((response) => {
          if (response.success) {
            setCategories(response.data);
          }
        })
        .catch((error) => {
          console.error("Error loading categories:", error);
          toast.error("Error al cargar las categorías");
        });
    }
  }, [open]);

   // Manejar selección de imagen principal
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no puede ser mayor a 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

   // Manejar selección de imagen de portada
  const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La imagen no puede ser mayor a 5MB");
        return;
      }
      setSelectedCoverImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setCoverImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

   // Agregar tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase()) && tags.length < 5) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag("");
    }
  };

   // Eliminar tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

   // Agregar regla
  const addRule = () => {
    if (newRule.trim() && rules.length < 10) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

   // Eliminar regla
  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

   // Subir imagen
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await apiClient.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.imageUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

   // Manejar envío del formulario
  const onSubmit = async (data: CreateGroupForm) => {
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      let coverImageUrl = null;

       // Subir imagen principal si existe
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) {
          toast.error("Error al subir la imagen principal");
          return;
        }
      }

       // Subir imagen de portada si existe
      if (selectedCoverImage) {
        coverImageUrl = await uploadImage(selectedCoverImage);
        if (!coverImageUrl) {
          toast.error("Error al subir la imagen de portada");
          return;
        }
      }

       // Crear el grupo
      const groupData = {
        ...data,
        tags,
        rules,
        image: imageUrl,
        coverImage: coverImageUrl,
        website: data.website || undefined,
        location: data.location || undefined,
      };

      const response = await createGroup(groupData);
      if (response.success) {
        toast.success("Grupo creado exitosamente");
        handleClose();
        onGroupCreated?.();
      }
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Error al crear el grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

   // Cerrar modal y limpiar formulario
  const handleClose = () => {
    setOpen(false);
    reset();
    setTags([]);
    setRules([]);
    setNewTag("");
    setNewRule("");
    setSelectedImage(null);
    setImagePreview(null);
    setSelectedCoverImage(null);
    setCoverImagePreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nou Grup</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          { /* Información básica */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del grupo *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ex: Desenvolupadors React Catalunya"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción *</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Descriu de què tracta el teu grup i quin tipus de contingut es compartirà..."
                className="mt-1 min-h-[100px]"
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">Categoría *</Label>
              <Select onValueChange={(value) => setValue("category", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>
          </div>

          { /* Privacidad */}
          <div className="space-y-3">
            <Label>Privacidad</Label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setValue("privacy", "public")}
                className={`flex items-center space-x-2 p-3 border rounded-lg ${
                  privacy === "public" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <Globe className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Público</div>
                  <div className="text-sm text-gray-500">Cualquiera puede ver y unirse al grupo</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue("privacy", "private")}
                className={`flex items-center space-x-2 p-3 border rounded-lg ${
                  privacy === "private" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                }`}
              >
                <Lock className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">Privado</div>
                  <div className="text-sm text-gray-500">Solo miembros pueden ver el contenido</div>
                </div>
              </button>
            </div>
          </div>

          { /* Tags */}
          <div className="space-y-3">
            <Label>Tags (máximo 5)</Label>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Afegir etiqueta..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1"
              />
              <Button type="button" onClick={addTag} disabled={tags.length >= 5}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          { /* Reglas */}
          <div className="space-y-3">
            <Label>Reglas del grupo (máximo 10)</Label>
            <div className="flex space-x-2">
              <Input
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Afegir regla..."
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRule())}
                className="flex-1"
              />
              <Button type="button" onClick={addRule} disabled={rules.length >= 10}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {rules.length > 0 && (
              <div className="space-y-2">
                {rules.map((rule, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">{index + 1}.</span>
                    <span className="text-sm flex-1">{rule}</span>
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          { /* Información adicional */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                {...register("location")}
                placeholder="Ex: Barcelona, Catalunya"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="website">Sitio web</Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://exemple.com"
                className="mt-1"
              />
              {errors.website && (
                <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>
              )}
            </div>
          </div>

          { /* Imágenes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Imagen del grupo</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="group-image"
                />
                <label
                  htmlFor="group-image"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Subir imagen</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div>
              <Label>Imagen de portada</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  id="cover-image"
                />
                <label
                  htmlFor="cover-image"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  {coverImagePreview ? (
                    <img
                      src={coverImagePreview}
                      alt="Cover Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Subir portada</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>

          { /* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Grupo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};