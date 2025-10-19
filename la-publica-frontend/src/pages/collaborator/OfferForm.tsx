import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import {
  Tag,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  FileText,
  Image,
  Video,
  ArrowLeft,
  Plus,
  Trash2,
  Building,
  AlertTriangle
} from "lucide-react";
import { createOffer, updateOffer, getOfferById, type CreateOfferData } from "@/api/offers";
import { uploadFile } from "@/api/uploads";
import { getMyCompanies, getCompanies, type Company } from "@/api/companies";
import { getCategories, type Category } from "@/api/categories";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProfile } from "@/hooks/useUser";

// Schema de validación
const offerSchema = z.object({
  title: z.string().min(3, "El títol ha de tenir almenys 3 caràcters").max(200, "El títol no pot excedir 200 caràcters"),
  description: z.string().min(10, "La descripció ha de tenir almenys 10 caràcters").max(5000, "La descripció no pot excedir 5000 caràcters"),
  company: z.string().min(1, "Has de seleccionar una empresa"),
  category: z.string().optional(),
  originalPrice: z.number().min(0.01, "El preu original ha de ser major que 0"),
  discountedPrice: z.number().min(0, "El preu amb descompte no pot ser negatiu").optional().or(z.literal(0)),
  startDate: z.string().min(1, "La data d'inici és obligatòria"),
  endDate: z.string().min(1, "La data de fi és obligatòria"),
  stock: z.number().int().min(1, "L'stock ha de ser almenys 1"),
  included: z.array(z.string()).min(1, "Has d'afegir almenys un element inclòs"),
  notIncluded: z.array(z.string()).default([]),
  usageInstructions: z.string().max(2000).optional(),
  mainImage: z.string().url("La imatge principal és obligatòria"),
  gallery: z.array(z.string().url()).default([]),
  videoUrl: z.string().url("URL de vídeo invàlida").optional().or(z.literal("")),
}).refine(
  (data) => {
    // Solo validar si hay precio con descuento
    if (data.discountedPrice && data.discountedPrice > 0) {
      return data.discountedPrice < data.originalPrice;
    }
    return true;
  },
  {
    message: "El preu amb descompte ha de ser menor que el preu original",
    path: ["discountedPrice"],
  }
).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  {
    message: "La data de fi ha de ser posterior a la data d'inici",
    path: ["endDate"],
  }
);

type OfferFormData = z.infer<typeof offerSchema>;

export default function OfferForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserProfile();
  const isEditing = !!id;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [noCompanies, setNoCompanies] = useState(false);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [companySearchValue, setCompanySearchValue] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
    reset
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      company: "",
      category: "",
      included: [""],
      notIncluded: [],
      gallery: [],
      mainImage: "",
      videoUrl: ""
    }
  });

  // @ts-ignore - useFieldArray con arrays de strings primitivos
  const {
    fields: includedFields,
    remove: removeIncluded
  } = useFieldArray({
    control,
    name: "included"
  });

  // @ts-ignore - useFieldArray con arrays de strings primitivos
  const {
    fields: notIncludedFields,
    remove: removeNotIncluded
  } = useFieldArray({
    control,
    name: "notIncluded"
  });

  const loadUserCompanies = async () => {
    try {
      setLoadingCompanies(true);
      console.log('Cargando empresas... isAdmin:', isAdmin);

      // Si es admin, cargar todas las empresas. Si no, solo las del usuario
      const response = isAdmin
        ? await getCompanies({ limit: 1000 }) // Cargar todas para admin
        : await getMyCompanies(); // Solo las del usuario para colaboradores

      console.log('Respuesta de empresas:', response);

      // El endpoint de getCompanies retorna "data", mientras que getMyCompanies retorna "companies"
      const companiesList = response.success
        ? (response.data || response.companies || [])
        : [];

      console.log('Empresas cargadas:', companiesList);
      setCompanies(companiesList);
      setNoCompanies(companiesList.length === 0);

      // Si solo tiene una empresa, seleccionarla automáticamente (solo para colaboradores)
      if (!isAdmin && companiesList.length === 1) {
        setValue('company', companiesList[0]._id);
      }
    } catch (error) {
      console.error('Error carregant empreses:', error);
      toast.error('Error al carregar les empreses');
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Cargar empresas del colaborador
  useEffect(() => {
    if (user) {
      loadUserCompanies();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  // Cargar categorías de ofertas promocionales
  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await getCategories({ type: 'promotional_offer' });
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      toast.error('Error al cargar les categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const watchMainImage = watch("mainImage");
  const watchGallery = watch("gallery");
  const watchOriginalPrice = watch("originalPrice");
  const watchDiscountedPrice = watch("discountedPrice");

  // Calcular porcentaje de descuento
  const discountPercentage = watchOriginalPrice && watchDiscountedPrice
    ? Math.round(((watchOriginalPrice - watchDiscountedPrice) / watchOriginalPrice) * 100)
    : 0;

  // Cargar oferta si es edición
  useEffect(() => {
    if (isEditing && id) {
      loadOffer();
    }
  }, [id]);

  const loadOffer = async () => {
    try {
      setLoadingData(true);
      const response = await getOfferById(id!);

      if (response.success) {
        const offer = response.offer;
        reset({
          title: offer.title,
          description: offer.description,
          company: offer.company?._id || offer.company,
          category: offer.category?._id || offer.category || "",
          originalPrice: offer.originalPrice,
          discountedPrice: offer.discountedPrice,
          startDate: new Date(offer.startDate).toISOString().split('T')[0],
          endDate: new Date(offer.endDate).toISOString().split('T')[0],
          stock: offer.stock,
          included: offer.included,
          notIncluded: offer.notIncluded,
          usageInstructions: offer.usageInstructions || "",
          mainImage: offer.mainImage,
          gallery: offer.gallery || [],
          videoUrl: offer.videoUrl || ""
        });
      }
    } catch (error: any) {
      console.error('Error al carregar l\'oferta:', error);
      toast.error('Error al carregar l\'oferta');
      navigate('/colaborador/les-meves-ofertes');
    } finally {
      setLoadingData(false);
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Només es permeten imatges');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imatge no pot superar 5MB');
      return;
    }

    try {
      setUploadingMainImage(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadFile(formData);

      if (response.success) {
        setValue("mainImage", response.data.filePath);
        toast.success('Imatge pujada correctament');
      }
    } catch (error: any) {
      console.error('Error al pujar la imatge:', error);
      toast.error(error.response?.data?.message || 'Error al pujar la imatge');
    } finally {
      setUploadingMainImage(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validar número de imágenes (max 5)
    const currentGalleryLength = watchGallery?.length || 0;
    if (currentGalleryLength + files.length > 5) {
      toast.error('Màxim 5 imatges a la galeria');
      return;
    }

    try {
      setUploadingGallery(true);
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar tipo
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no és una imatge vàlida`);
          continue;
        }

        // Validar tamaño
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} supera els 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await uploadFile(formData);

        if (response.success) {
          uploadedUrls.push(response.data.filePath);
        }
      }

      if (uploadedUrls.length > 0) {
        const currentGallery = watchGallery || [];
        setValue("gallery", [...currentGallery, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'imatge pujada' : 'imatges pujades'}`);
      }
    } catch (error: any) {
      console.error('Error al pujar les imatges:', error);
      toast.error('Error al pujar les imatges');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const currentGallery = watchGallery || [];
    const newGallery = currentGallery.filter((_, i) => i !== index);
    setValue("gallery", newGallery);
  };

  const onSubmit = async (data: OfferFormData) => {
    try {
      setLoading(true);

      // Filtrar campos vacíos en los arrays
      const cleanData = {
        ...data,
        included: data.included.filter(item => item.trim() !== ""),
        notIncluded: data.notIncluded.filter(item => item.trim() !== ""),
        videoUrl: data.videoUrl?.trim() || undefined,
        usageInstructions: data.usageInstructions?.trim() || "",
        gallery: data.gallery || []
      } as CreateOfferData;

      if (isEditing && id) {
        // Actualizar oferta existente
        const response = await updateOffer(id, cleanData);

        if (response.success) {
          toast.success('Oferta actualitzada correctament');
          // Redirigir según el rol
          if (isAdmin) {
            navigate('/admin/ofertes');
          } else {
            navigate('/colaborador/les-meves-ofertes');
          }
        }
      } else {
        // Crear nueva oferta
        const response = await createOffer(cleanData);

        if (response.success) {
          toast.success('Oferta creada correctament');
          // Redirigir según el rol
          if (isAdmin) {
            navigate('/admin/ofertes');
          } else {
            navigate('/colaborador/les-meves-ofertes');
          }
        }
      }
    } catch (error: any) {
      console.error('Error al guardar l\'oferta:', error);
      const errorMessage = error.response?.data?.message || 'Error al guardar l\'oferta';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to={isAdmin ? '/admin/ofertes' : '/colaborador/les-meves-ofertes'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isAdmin ? 'Tornar a ofertes' : 'Tornar a les meves ofertes'}
            </Link>
          </Button>

          <h1 className="text-3xl font-bold mb-2">
            {isEditing ? 'Editar Oferta' : 'Crear Nova Oferta Promocional'}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? 'Modifica els detalls de la teva oferta'
              : 'Crea una oferta amb descompte per atraure més clients'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Informació Bàsica
              </CardTitle>
              <CardDescription>
                Dades generals de l'oferta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Título */}
              <div>
                <Label htmlFor="title">
                  Títol de l'oferta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="Ex: Assessoria empresarial amb 40% de descompte"
                />
                {errors.title && (
                  <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <Label htmlFor="description">
                  Descripció <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Descriu detalladament la teva oferta..."
                  rows={6}
                />
                {errors.description && (
                  <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selector de Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Empresa
              </CardTitle>
              <CardDescription>
                Selecciona l'empresa a la qual pertany aquesta oferta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {noCompanies && !isAdmin ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-yellow-900">
                        No tens cap empresa creada
                      </p>
                      <p className="text-sm text-yellow-700">
                        Per crear ofertes promocionals, primer necessites tenir una empresa. Les ofertes sempre estan associades a una empresa per identificar qui les ofereix.
                      </p>
                      <div className="flex gap-2">
                        <Button asChild variant="default" size="sm">
                          <Link to="/colaborador/empresa/crear">
                            <Plus className="h-4 w-4 mr-2" />
                            Crear la Meva Empresa
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/colaborador/empreses">
                            Veure Empreses
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : noCompanies && isAdmin ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-blue-900">
                        No hi ha empreses disponibles
                      </p>
                      <p className="text-sm text-blue-700">
                        No existeixen empreses en el sistema. Els colaboradors han de crear les seves empreses abans de poder crear ofertes.
                      </p>
                      <p className="text-xs text-blue-600">
                        Com a administrador, pots gestionar empreses des del panell d'administració, però no pots crear ofertes sense empreses existents.
                      </p>
                    </div>
                  </div>
                </div>
              ) : loadingCompanies ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="company">
                    Empresa <span className="text-red-500">*</span>
                  </Label>

                  {/* Combobox con búsqueda para admins o lista larga */}
                  {isAdmin || companies.length > 5 ? (
                    <Popover open={companySearchOpen} onOpenChange={setCompanySearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={companySearchOpen}
                          className="w-full justify-between"
                        >
                          {watch("company")
                            ? companies.find((c) => c._id === watch("company"))?.name
                            : "Selecciona una empresa..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                        <Command>
                          <CommandInput
                            placeholder="Cerca empresa..."
                            value={companySearchValue}
                            onValueChange={setCompanySearchValue}
                          />
                          <CommandList>
                            <CommandEmpty>No s'ha trobat cap empresa.</CommandEmpty>
                            <CommandGroup>
                              {companies
                                .filter((company) =>
                                  company.name
                                    .toLowerCase()
                                    .includes(companySearchValue.toLowerCase())
                                )
                                .map((company) => (
                                  <CommandItem
                                    key={company._id}
                                    value={company.name}
                                    onSelect={() => {
                                      setValue("company", company._id);
                                      setCompanySearchOpen(false);
                                      setCompanySearchValue("");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        watch("company") === company._id
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {company.name}
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    /* Select simple para pocos elementos */
                    <select
                      id="company"
                      {...register("company")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={companies.length === 1}
                    >
                      <option value="">Selecciona una empresa</option>
                      {companies.map((company) => (
                        <option key={company._id} value={company._id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {errors.company && (
                    <p className="text-sm text-red-500 mt-1">{errors.company.message}</p>
                  )}
                  {!isAdmin && companies.length === 1 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selecció automàtica (només tens una empresa)
                    </p>
                  )}
                  {isAdmin && (
                    <p className="text-sm text-gray-500 mt-1">
                      Com a administrador pots seleccionar qualsevol empresa ({companies.length} disponibles)
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categoría */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categoria
              </CardTitle>
              <CardDescription>
                Selecciona una categoria per a l'oferta (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={loadingCategories}
                >
                  <option value="">Sense categoria</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <p className="text-sm text-gray-500 mt-1">Carregant categories...</p>
                )}
                {!loadingCategories && categories.length === 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    No hi ha categories disponibles. Contacta amb l'administrador per crear-ne.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Preus i Descompte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Precio original */}
                <div>
                  <Label htmlFor="originalPrice">
                    Preu Original (€) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    {...register("originalPrice", { valueAsNumber: true })}
                    placeholder="100.00"
                  />
                  {errors.originalPrice && (
                    <p className="text-sm text-red-500 mt-1">{errors.originalPrice.message}</p>
                  )}
                </div>

                {/* Precio con descuento */}
                <div>
                  <Label htmlFor="discountedPrice">
                    Preu amb Descompte (€) <span className="text-gray-400 text-sm">(opcional)</span>
                  </Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    step="0.01"
                    {...register("discountedPrice", { valueAsNumber: true })}
                    placeholder="Deixa buit si no hi ha descompte"
                  />
                  {errors.discountedPrice && (
                    <p className="text-sm text-red-500 mt-1">{errors.discountedPrice.message}</p>
                  )}
                </div>
              </div>

              {/* Mostrar porcentaje de descuento calculado */}
              {discountPercentage > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-lg font-semibold text-green-900">
                    Descompte: <span className="text-2xl">{discountPercentage}%</span>
                  </p>
                  <p className="text-sm text-green-700">
                    Els clients estalviaran {watchOriginalPrice && watchDiscountedPrice ? (watchOriginalPrice - watchDiscountedPrice).toFixed(2) : '0.00'}€
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Fechas y Stock */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Dates i Disponibilitat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Fecha inicio */}
                <div>
                  <Label htmlFor="startDate">
                    Data d'inici <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                {/* Fecha fin */}
                <div>
                  <Label htmlFor="endDate">
                    Data de fi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
                  )}
                </div>

                {/* Stock */}
                <div>
                  <Label htmlFor="stock">
                    Places disponibles <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    {...register("stock", { valueAsNumber: true })}
                    placeholder="50"
                  />
                  {errors.stock && (
                    <p className="text-sm text-red-500 mt-1">{errors.stock.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Qué incluye */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Què Inclou
              </CardTitle>
              <CardDescription>
                Afegeix els elements o serveis inclosos en l'oferta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {includedFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`included.${index}` as const)}
                    placeholder="Ex: Gestió de xarxes socials"
                  />
                  {includedFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeIncluded(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {errors.included && (
                <p className="text-sm text-red-500">{errors.included.message}</p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentIncluded = watch("included") || [];
                  setValue("included", [...currentIncluded, ""]);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Afegir element
              </Button>
            </CardContent>
          </Card>

          {/* Qué NO incluye */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Què NO Inclou
              </CardTitle>
              <CardDescription>
                Opcional: Especifica què NO està inclòs per evitar malentesos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notIncludedFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    {...register(`notIncluded.${index}` as const)}
                    placeholder="Ex: Impressió de materials"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeNotIncluded(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const currentNotIncluded = watch("notIncluded") || [];
                  setValue("notIncluded", [...currentNotIncluded, ""]);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Afegir element
              </Button>
            </CardContent>
          </Card>

          {/* Instrucciones de uso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Instruccions d'Ús
              </CardTitle>
              <CardDescription>
                Com els clients poden utilitzar aquesta oferta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("usageInstructions")}
                placeholder="Ex: Després de la compra, us contactarem en un termini de 24 hores..."
                rows={4}
              />
              {errors.usageInstructions && (
                <p className="text-sm text-red-500 mt-1">{errors.usageInstructions.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Imágenes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Imatges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Imagen principal */}
              <div>
                <Label htmlFor="mainImage">
                  Imatge Principal <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2 space-y-3">
                  {watchMainImage && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={watchMainImage}
                        alt="Imatge principal"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="mainImage"
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    disabled={uploadingMainImage}
                  />
                  {uploadingMainImage && (
                    <p className="text-sm text-blue-600">Pujant imatge...</p>
                  )}
                </div>
                {errors.mainImage && (
                  <p className="text-sm text-red-500 mt-1">{errors.mainImage.message}</p>
                )}
              </div>

              <Separator />

              {/* Galería */}
              <div>
                <Label htmlFor="gallery">
                  Galeria d'Imatges (màxim 5)
                </Label>
                <div className="mt-2 space-y-3">
                  {watchGallery && watchGallery.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {watchGallery.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Galeria ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeGalleryImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <Input
                    id="gallery"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery || (watchGallery?.length || 0) >= 5}
                  />
                  {uploadingGallery && (
                    <p className="text-sm text-blue-600">Pujant imatges...</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Vídeo Promocional
              </CardTitle>
              <CardDescription>
                URL de YouTube o Vimeo (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                {...register("videoUrl")}
                placeholder="https://youtube.com/watch?v=..."
              />
              {errors.videoUrl && (
                <p className="text-sm text-red-500 mt-1">{errors.videoUrl.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/colaborador/les-meves-ofertes')}
            >
              Cancel·lar
            </Button>
            <Button type="submit" disabled={loading || noCompanies}>
              {loading ? 'Guardant...' : isEditing ? 'Actualitzar Oferta' : 'Crear Oferta'}
            </Button>
          </div>
        </form>
      </div>
    </PageWrapper>
  );
}
