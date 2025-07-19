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
  MapPin, 
  Building, 
  Calendar,
  Euro,
  Clock,
  Users,
  Briefcase,
  Camera,
  AlertTriangle
} from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";
import { createJobOffer, updateJobOffer, getJobOfferById } from "@/api/jobOffers";
import { getMyCompanies } from "@/api/companies";
import { getCategoriesTree } from "@/api/categories";
import { uploadFile } from "@/api/uploads";
import { useUserProfile } from "@/hooks/useUser";

// Form validation schema
const jobOfferSchema = z.object({
  company: z.string().min(1, "Selecciona una empresa"),
  title: z.string().min(5, "El títol ha de tenir almenys 5 caràcters").max(200, "El títol no pot superar els 200 caràcters"),
  description: z.string().min(50, "La descripció ha de tenir almenys 50 caràcters").max(5000, "La descripció no pot superar els 5000 caràcters"),
  category: z.string().min(1, "Selecciona una categoria"),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance']),
  experienceLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead']),
  location: z.object({
    city: z.string().min(2, "La ciutat és obligatòria"),
    country: z.string().min(2, "El país és obligatori"),
    isRemote: z.boolean().default(false)
  }),
  salary: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
    currency: z.string().default('EUR'),
    period: z.enum(['hour', 'day', 'month', 'year']).default('year')
  }).optional(),
  applicationDeadline: z.string().optional(),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([])
});

type JobOfferFormData = z.infer<typeof jobOfferSchema>;

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

export default function JobOfferForm() {
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
  
  // Form management
  const [requirements, setRequirements] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState("");
  const [newBenefit, setNewBenefit] = useState("");
  const [newSkill, setNewSkill] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<JobOfferFormData>({
    resolver: zodResolver(jobOfferSchema),
    defaultValues: {
      company: "",
      title: "",
      description: "",
      category: "",
      employmentType: "full-time",
      experienceLevel: "mid",
      location: {
        city: "",
        country: "Espanya",
        isRemote: false
      },
      salary: {
        currency: "EUR",
        period: "year"
      },
      requirements: [],
      benefits: [],
      skills: []
    }
  });

  // Check authorization
  useEffect(() => {
    if (user && user.role !== 'colaborador') {
      toast.error('Només els col·laboradors poden gestionar ofertes de treball');
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

  // Load job offer data for editing
  useEffect(() => {
    if (isEditing && id && companies.length > 0) {
      loadJobOffer();
    }
  }, [isEditing, id, companies]);

  const loadInitialData = async () => {
    try {
      const [companiesRes, categoriesRes] = await Promise.all([
        getMyCompanies({ limit: 100 }),
        getCategoriesTree('job')
      ]);
      
      setCompanies(companiesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al carregar les dades');
    }
  };

  const loadJobOffer = async () => {
    try {
      setLoading(true);
      const response = await getJobOfferById(id!);
      const jobOffer = response.data;

      // Check if user owns this job offer's company
      const ownsCompany = companies.some(company => 
        company._id === jobOffer.company._id
      );

      if (!ownsCompany) {
        toast.error('No tens permisos per editar aquesta oferta');
        navigate('/colaborador/ofertas');
        return;
      }

      // Set form values
      form.reset({
        company: jobOffer.company._id,
        title: jobOffer.title,
        description: jobOffer.description,
        category: jobOffer.category,
        employmentType: jobOffer.employmentType,
        experienceLevel: jobOffer.experienceLevel,
        location: jobOffer.location,
        salary: jobOffer.salary || { currency: 'EUR', period: 'year' },
        applicationDeadline: jobOffer.applicationDeadline ? 
          new Date(jobOffer.applicationDeadline).toISOString().split('T')[0] : "",
        requirements: jobOffer.requirements || [],
        benefits: jobOffer.benefits || [],
        skills: jobOffer.skills || []
      });

      // Set arrays
      setRequirements(jobOffer.requirements || []);
      setBenefits(jobOffer.benefits || []);
      setSkills(jobOffer.skills || []);

      // Set image
      if (jobOffer.image) {
        setCurrentImage(jobOffer.image);
        setImagePreview(getImageUrl(jobOffer.image));
      }

    } catch (error) {
      console.error('Error loading job offer:', error);
      toast.error('Error al carregar l\'oferta de treball');
      navigate('/colaborador/ofertas');
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
      formData.append('type', 'job-offer');

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

  const addBenefit = () => {
    if (newBenefit.trim() && !benefits.includes(newBenefit.trim())) {
      const updated = [...benefits, newBenefit.trim()];
      setBenefits(updated);
      form.setValue('benefits', updated);
      setNewBenefit("");
    }
  };

  const removeBenefit = (index: number) => {
    const updated = benefits.filter((_, i) => i !== index);
    setBenefits(updated);
    form.setValue('benefits', updated);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      form.setValue('skills', updated);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    const updated = skills.filter((_, i) => i !== index);
    setSkills(updated);
    form.setValue('skills', updated);
  };

  const onSubmit = async (data: JobOfferFormData) => {
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
        requirements,
        benefits,
        skills,
        salary: data.salary?.min || data.salary?.max ? data.salary : undefined,
        applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined
      };

      if (isEditing) {
        await updateJobOffer(id!, formData);
        toast.success('Oferta de treball actualitzada correctament');
      } else {
        await createJobOffer(formData);
        toast.success('Oferta de treball creada correctament');
      }

      navigate('/colaborador/ofertas');
    } catch (error: any) {
      console.error('Error saving job offer:', error);
      toast.error(error.response?.data?.message || 'Error al guardar l\'oferta de treball');
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
            onClick={() => navigate('/colaborador/ofertas')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Oferta de Treball' : 'Nova Oferta de Treball'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica la informació de l\'oferta' : 'Crea una nova oferta de treball per a la teva empresa'}
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
                  <Briefcase className="h-5 w-5" />
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
                      <FormLabel>Títol de l'Oferta *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="p.ex. Desenvolupador Frontend React" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
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

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripció *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descriu l'oferta de treball, responsabilitats, requisits, etc."
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
                  <Label>Imatge Destacada</Label>
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
                          Afegeix una imatge per fer més atractiva l'oferta
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

            {/* Employment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Detalls de l'Ocupació
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Employment Type */}
                  <FormField
                    control={form.control}
                    name="employmentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipus de Contracte *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Temps Complet</SelectItem>
                            <SelectItem value="part-time">Temps Parcial</SelectItem>
                            <SelectItem value="contract">Contracte</SelectItem>
                            <SelectItem value="internship">Pràctiques</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Experience Level */}
                  <FormField
                    control={form.control}
                    name="experienceLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nivell d'Experiència *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="entry">Sense Experiència</SelectItem>
                            <SelectItem value="junior">Junior (1-2 anys)</SelectItem>
                            <SelectItem value="mid">Intermedi (3-5 anys)</SelectItem>
                            <SelectItem value="senior">Senior (5+ anys)</SelectItem>
                            <SelectItem value="lead">Lead/Manager</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Application Deadline */}
                <FormField
                  control={form.control}
                  name="applicationDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Límit de Candidatures</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Ubicació
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* City */}
                  <FormField
                    control={form.control}
                    name="location.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciutat *</FormLabel>
                        <FormControl>
                          <Input placeholder="Barcelona" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Country */}
                  <FormField
                    control={form.control}
                    name="location.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl>
                          <Input placeholder="Espanya" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Remote Work */}
                <FormField
                  control={form.control}
                  name="location.isRemote"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Treball remot disponible</FormLabel>
                        <p className="text-sm text-gray-600">
                          Marca aquesta opció si es pot treballar de manera remota
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Salari (Opcional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Min Salary */}
                  <FormField
                    control={form.control}
                    name="salary.min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salari Mínim</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="30000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Max Salary */}
                  <FormField
                    control={form.control}
                    name="salary.max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salari Màxim</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="50000"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Currency */}
                  <FormField
                    control={form.control}
                    name="salary.currency"
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

                  {/* Period */}
                  <FormField
                    control={form.control}
                    name="salary.period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Període</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hour">Per Hora</SelectItem>
                            <SelectItem value="day">Per Dia</SelectItem>
                            <SelectItem value="month">Per Mes</SelectItem>
                            <SelectItem value="year">Per Any</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </CardContent>
            </Card>

            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requisits</CardTitle>
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
                    {requirements.map((requirement, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {requirement}
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

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Beneficis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Afegir benefici..."
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                  />
                  <Button type="button" onClick={addBenefit} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {benefits.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {benefits.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {benefit}
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
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

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Habilitats Requerides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Afegir habilitat..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <Button type="button" onClick={addSkill} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
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
                onClick={() => navigate('/colaborador/ofertas')}
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
                  isEditing ? 'Actualitzar Oferta' : 'Crear Oferta'
                )}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </PageWrapper>
  );
}