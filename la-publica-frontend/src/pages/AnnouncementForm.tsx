import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import { Megaphone, TrendingUp, TrendingDown, DollarSign, MapPin, Phone, Mail, MessageCircle, ArrowLeft } from "lucide-react";
import { createAnnouncement, updateAnnouncement, getAnnouncementById } from "@/api/announcements";
import { getCategories } from "@/api/categories";
import { Skeleton } from "@/components/ui/skeleton";

// Schema de validación
const announcementSchema = z.object({
  type: z.enum(["offer", "demand"]),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres").max(100, "El título no puede exceder 100 caracteres"),
  description: z.string().min(20, "La descripción debe tener al menos 20 caracteres").max(1000, "La descripción no puede exceder 1000 caracteres"),
  category: z.string().optional(),
  price: z.number().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  location: z.string().optional(),
  contactEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function AnnouncementForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [categories, setCategories] = useState<any[]>([]);
  const [type, setType] = useState<"offer" | "demand">("offer");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      type: "offer",
      contactEmail: "",
      contactPhone: "",
      contactWhatsapp: ""
    }
  });

  const watchType = watch("type");

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories({ type: 'announcement', active: true });
        if (response.success) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };
    loadCategories();
  }, []);

  // Cargar anuncio si es edición
  useEffect(() => {
    if (isEditing) {
      loadAnnouncement();
    }
  }, [id]);

  const loadAnnouncement = async () => {
    try {
      setLoadingData(true);
      const response = await getAnnouncementById(id!);
      if (response.success) {
        const announcement = response.data;
        reset({
          type: announcement.type,
          title: announcement.title,
          description: announcement.description,
          category: announcement.category?._id,
          price: announcement.price,
          budgetMin: announcement.budget?.min,
          budgetMax: announcement.budget?.max,
          location: announcement.location,
          contactEmail: announcement.contact?.email || "",
          contactPhone: announcement.contact?.phone || "",
          contactWhatsapp: announcement.contact?.whatsapp || ""
        });
        setType(announcement.type);
      }
    } catch (error) {
      toast.error('Error al cargar el anuncio');
      navigate('/announcements');
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (data: AnnouncementFormData) => {
    try {
      setLoading(true);

      const announcementData: any = {
        type: data.type,
        title: data.title,
        description: data.description,
        location: data.location,
        contact: {}
      };

      // Agregar categoría si existe
      if (data.category) {
        announcementData.category = data.category;
      }

      // Agregar precio o presupuesto según el tipo
      if (data.type === "offer" && data.price) {
        announcementData.price = data.price;
      } else if (data.type === "demand" && (data.budgetMin || data.budgetMax)) {
        announcementData.budget = {
          min: data.budgetMin || 0,
          max: data.budgetMax || 0
        };
      }

      // Agregar información de contacto
      if (data.contactEmail) announcementData.contact.email = data.contactEmail;
      if (data.contactPhone) announcementData.contact.phone = data.contactPhone;
      if (data.contactWhatsapp) announcementData.contact.whatsapp = data.contactWhatsapp;

      let response;
      if (isEditing) {
        response = await updateAnnouncement(id!, announcementData);
      } else {
        response = await createAnnouncement(announcementData);
      }

      if (response.success) {
        toast.success(isEditing ? 'Anuncio actualizado correctamente' : 'Anuncio publicado correctamente');
        navigate('/announcements');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar el anuncio');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <PageWrapper>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/announcements')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Anuncios
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Megaphone className="h-6 w-6" />
              {isEditing ? 'Editar Anuncio' : 'Publicar Nuevo Anuncio'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Tipo de anuncio */}
              <div className="space-y-3">
                <Label>Tipo de Anuncio</Label>
                <RadioGroup
                  value={watchType}
                  onValueChange={(value) => {
                    setValue("type", value as "offer" | "demand");
                    setType(value as "offer" | "demand");
                  }}
                >
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=checked]:border-primary">
                      <RadioGroupItem value="offer" id="offer" />
                      <Label htmlFor="offer" className="cursor-pointer flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Oferta - Ofreces un servicio
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 data-[state=checked]:border-primary">
                      <RadioGroupItem value="demand" id="demand" />
                      <Label htmlFor="demand" className="cursor-pointer flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-blue-500" />
                        Demanda - Buscas un servicio
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Título del Anuncio *</Label>
                <Input
                  id="title"
                  placeholder={type === "offer" ? "Ej: Servicios de diseño gráfico profesional" : "Ej: Busco desarrollador web freelance"}
                  {...register("title")}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe detalladamente tu oferta o lo que estás buscando..."
                  rows={6}
                  {...register("description")}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select 
                  value={watch("category")} 
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Precio o Presupuesto */}
              {type === "offer" ? (
                <div className="space-y-2">
                  <Label htmlFor="price">Precio (€)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="Ej: 500"
                      {...register("price", { valueAsNumber: true })}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Deja vacío si el precio es a consultar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Presupuesto (€)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Mínimo"
                        {...register("budgetMin", { valueAsNumber: true })}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="Máximo"
                        {...register("budgetMax", { valueAsNumber: true })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">Deja vacío si el presupuesto es a definir</p>
                </div>
              )}

              {/* Ubicación */}
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Ej: Madrid, España"
                    {...register("location")}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Información de contacto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Información de Contacto</h3>
                <p className="text-sm text-gray-500">
                  Proporciona al menos una forma de contacto. Esta información será visible solo para usuarios interesados.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="tu@email.com"
                      {...register("contactEmail")}
                      className={`pl-10 ${errors.contactEmail ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactPhone"
                      placeholder="+34 600 000 000"
                      {...register("contactPhone")}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactWhatsapp">WhatsApp</Label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactWhatsapp"
                      placeholder="+34 600 000 000"
                      {...register("contactWhatsapp")}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/announcements')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Guardando..." : isEditing ? "Actualizar Anuncio" : "Publicar Anuncio"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}