import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  HelpCircle, 
  Building, 
  Calendar,
  Euro,
  Clock,
  Users,
  Globe,
  Phone,
  Video,
  Mail,
  MessageSquare,
  Camera,
  Star,
  Languages
} from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";
import { createAdvisory, updateAdvisory, getAdvisoryById } from "@/api/advisories";
import { getMyCompanies } from "@/api/companies";
import { getCategoriesTree } from "@/api/categories";
import { uploadFile } from "@/api/uploads";
import { useUserProfile } from "@/hooks/useUser";

// Form validation schema
const advisorySchema = z.object({
  company: z.string().min(1, "Selecciona una empresa"),
  title: z.string().min(5, "El títol ha de tenir almenys 5 caràcters").max(200, "El títol no pot superar els 200 caràcters"),
  description: z.string().min(50, "La descripció ha de tenir almenys 50 caràcters").max(2000, "La descripció no pot superar els 2000 caràcters"),
  category: z.string().min(1, "Selecciona una categoria"),
  subcategory: z.string().optional(),
  format: z.enum(['video', 'phone', 'in-person', 'email', 'chat']),
  pricing: z.object({
    type: z.enum(['free', 'paid', 'consultation']),
    hourlyRate: z.number().min(0).optional(),
    sessionRate: z.number().min(0).optional(),
    currency: z.string().default('EUR'),
    sessionDuration: z.number().min(15).default(60)
  }),
  availability: z.object({
    timezone: z.string().default('Europe/Madrid'),
    advanceBooking: z.number().min(1).default(24),
    schedule: z.array(z.object({
      dayOfWeek: z.number().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      available: z.boolean().default(true)
    })).default([])
  }),
  expertise: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([])
});

type AdvisoryFormData = z.infer<typeof advisorySchema>;

interface Company {
  _id: string;
  name: string;
  verified: { status: string };
}

interface Category {
  _id: string;
  name: string;
  children?: Category[];
}

export default function AdvisoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserProfile();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImage, setCurrentImage] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Form management for arrays
  const [expertise, setExpertise] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);
  const [newExpertise, setNewExpertise] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newRequirement, setNewRequirement] = useState("");
  
  // Schedule management
  const [schedule, setSchedule] = useState([
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', available: true }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', available: true }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', available: true }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', available: true }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', available: true }, // Friday
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', available: false }, // Saturday
    { dayOfWeek: 0, startTime: '09:00', endTime: '14:00', available: false }, // Sunday
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AdvisoryFormData>({
    resolver: zodResolver(advisorySchema),
    defaultValues: {
      company: "",
      title: "",
      description: "",
      category: "",
      subcategory: "",
      format: "video",
      pricing: {
        type: "consultation",
        currency: "EUR",
        sessionDuration: 60
      },
      availability: {
        timezone: "Europe/Madrid",
        advanceBooking: 24,
        schedule: []
      },
      expertise: [],
      languages: [],
      requirements: []
    }
  });

  // Check authorization
  useEffect(() => {
    if (user && user.role !== 'colaborador') {
      toast.error('Només els col·laboradors poden gestionar assessoraments');
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    if (user?.role === 'colaborador') {
      loadInitialData();
    }
  }, [user]);

  // Load advisory data for editing
  useEffect(() => {
    if (isEditing && id && companies.length > 0) {
      loadAdvisory();
    }
  }, [isEditing, id, companies]);

  const loadInitialData = async () => {
    try {
      const [companiesRes, categoriesRes] = await Promise.all([
        getMyCompanies({ limit: 100 }),
        getCategoriesTree('advisory')
      ]);
      
      setCompanies(companiesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al carregar les dades');
    }
  };

  const loadAdvisory = async () => {
    try {
      setLoading(true);
      const response = await getAdvisoryById(id!);
      const advisory = response.data;

      // Check if user owns this advisory's company
      const ownsCompany = companies.some(company => 
        company._id === advisory.company._id
      );

      if (!ownsCompany) {
        toast.error('No tens permisos per editar aquest assessorament');
        navigate('/colaborador/asesorias');
        return;
      }

      // Set form values
      form.reset({
        company: advisory.company._id,
        title: advisory.title,
        description: advisory.description,
        category: advisory.category,
        subcategory: advisory.subcategory || "",
        format: advisory.format,
        pricing: advisory.pricing,
        availability: advisory.availability,
        expertise: advisory.expertise || [],
        languages: advisory.languages || [],
        requirements: advisory.requirements || []
      });

      // Set arrays
      setExpertise(advisory.expertise || []);
      setLanguages(advisory.languages || []);
      setRequirements(advisory.requirements || []);
      setSchedule(advisory.availability?.schedule || schedule);

      // Set image
      if (advisory.image) {
        setCurrentImage(advisory.image);
        setImagePreview(getImageUrl(advisory.image));
      }

    } catch (error) {
      console.error('Error loading advisory:', error);
      toast.error('Error al carregar l\'assessorament');
      navigate('/colaborador/asesorias');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Només es permeten imatges');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imatge no pot superar els 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return currentImage || null;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('type', 'advisory');

      const response = await uploadFile(formData);
      return response.data.filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al pujar la imatge');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setCurrentImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Array management helpers
  const addExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      const updated = [...expertise, newExpertise.trim()];
      setExpertise(updated);
      form.setValue('expertise', updated);
      setNewExpertise("");
    }
  };

  const removeExpertise = (index: number) => {
    const updated = expertise.filter((_, i) => i !== index);
    setExpertise(updated);
    form.setValue('expertise', updated);
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      const updated = [...languages, newLanguage.trim()];
      setLanguages(updated);
      form.setValue('languages', updated);
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    const updated = languages.filter((_, i) => i !== index);
    setLanguages(updated);
    form.setValue('languages', updated);
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !requirements.includes(newRequirement.trim())) {
      const updated = [...requirements, newRequirement.trim()];
      setRequirements(updated);
      form.setValue('requirements', updated);
      setNewRequirement("");
    }
  };

  const removeRequirement = (index: number) => {
    const updated = requirements.filter((_, i) => i !== index);
    setRequirements(updated);
    form.setValue('requirements', updated);
  };

  const updateSchedule = (dayIndex: number, field: string, value: any) => {
    const updated = [...schedule];
    updated[dayIndex] = { ...updated[dayIndex], [field]: value };
    setSchedule(updated);
    form.setValue('availability.schedule', updated);
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    return days[dayOfWeek];
  };

  const onSubmit = async (data: AdvisoryFormData) => {
    try {
      setLoading(true);

      // Upload image if there's a new one
      let imagePath = currentImage;
      if (imageFile) {
        imagePath = await uploadImage();
        if (!imagePath && imageFile) {
          return; // Upload failed
        }
      }

      // Prepare data
      const formData = {
        ...data,
        image: imagePath || undefined,
        expertise,
        languages,
        requirements,
        availability: {
          ...data.availability,
          schedule: schedule.filter(s => s.available)
        }
      };

      if (isEditing) {
        await updateAdvisory(id!, formData);
        toast.success('Assessorament actualitzat correctament');
      } else {
        await createAdvisory(formData);
        toast.success('Assessorament creat correctament');
      }

      navigate('/colaborador/asesorias');
    } catch (error: any) {
      console.error('Error saving advisory:', error);
      toast.error(error.response?.data?.message || 'Error al guardar l\'assessorament');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'colaborador') {
    return null;
  }

  if (loading && isEditing) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/colaborador/asesorias')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Assessorament' : 'Nou Assessorament'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica la informació del servei' : 'Crea un nou servei d\'assessorament per a la teva empresa'}
            </p>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Informació Bàsica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Company Selection */}
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una empresa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company._id} value={company._id}>
                              <div className="flex items-center gap-2">
                                {company.name}
                                {company.verified.status === 'verified' && (
                                  <Badge variant="secondary" className="text-xs">Verificada</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Títol del Servei *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="p.ex. Consultoria en Transformació Digital" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategoria</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Especialització específica" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripció *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descriu el teu servei d'assessorament, què ofereixes, la teva experiència..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Image Upload */}
                <div className="space-y-3">
                  <Label>Imatge del Servei</Label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Vista prèvia"
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Afegeix una imatge per destacar el teu servei
                        </p>
                      </div>
                    )}
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {imagePreview ? 'Canviar Imatge' : 'Pujar Imatge'}
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Detalls del Servei
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Format */}
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Format de l'Assessorament *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4" />
                              Videoconferència
                            </div>
                          </SelectItem>
                          <SelectItem value="phone">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Telèfon
                            </div>
                          </SelectItem>
                          <SelectItem value="in-person">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Presencial
                            </div>
                          </SelectItem>
                          <SelectItem value="email">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </div>
                          </SelectItem>
                          <SelectItem value="chat">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              Chat
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Session Duration */}
                <FormField
                  control={form.control}
                  name="pricing.sessionDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durada de la Sessió (minuts) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="15"
                          step="15"
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Preus i Tarifes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Pricing Type */}
                <FormField
                  control={form.control}
                  name="pricing.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipus de Tarifa *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Gratuït</SelectItem>
                          <SelectItem value="paid">De Pagament</SelectItem>
                          <SelectItem value="consultation">Consulta Prèvia</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Pricing Fields - only show for paid services */}
                {form.watch('pricing.type') === 'paid' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="pricing.hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarifa per Hora</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="50"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.sessionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tarifa per Sessió</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0"
                              placeholder="80"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pricing.currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Moneda</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Disponibilitat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="availability.timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona Horària</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Europe/Madrid">Europa/Madrid (CET)</SelectItem>
                            <SelectItem value="Europe/London">Europa/London (GMT)</SelectItem>
                            <SelectItem value="America/New_York">Amèrica/Nova York (EST)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability.advanceBooking"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reserva amb Antelació (hores)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1"
                            placeholder="24"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Weekly Schedule */}
                <div>
                  <Label className="text-base font-medium mb-3 block">Horari Setmanal</Label>
                  <div className="space-y-3">
                    {schedule.map((day, index) => (
                      <div key={day.dayOfWeek} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-20">
                          <Checkbox
                            checked={day.available}
                            onCheckedChange={(checked) => 
                              updateSchedule(index, 'available', !!checked)
                            }
                          />
                          <Label className="ml-2 text-sm font-medium">
                            {getDayName(day.dayOfWeek)}
                          </Label>
                        </div>
                        
                        {day.available && (
                          <>
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={day.startTime}
                                onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                                className="w-32"
                              />
                              <span className="text-gray-500">a</span>
                              <Input
                                type="time"
                                value={day.endTime}
                                onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                                className="w-32"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Expertise */}
            <Card>
              <CardHeader>
                <CardTitle>Àrees d'Expertesa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Afegir àrea d'expertesa..."
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                  />
                  <Button type="button" onClick={addExpertise} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((exp, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {exp}
                        <button
                          type="button"
                          onClick={() => removeExpertise(index)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Idiomes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Afegir idioma..."
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  />
                  <Button type="button" onClick={addLanguage} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {lang}
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requisits per als Clients</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Afegir requisit..."
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <Button type="button" onClick={addRequirement} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {req}
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex justify-end space-x-4 pb-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/colaborador/asesorias')}
                disabled={loading}
              >
                Cancel·lar
              </Button>
              <Button 
                type="submit" 
                disabled={loading || uploadingImage}
                className="min-w-[120px]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardant...
                  </>
                ) : (
                  isEditing ? 'Actualitzar Servei' : 'Crear Servei'
                )}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </PageWrapper>
  );
}