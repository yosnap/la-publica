import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash, HelpCircle, MapPin, Calendar, 
  DollarSign, Clock, Eye, EyeOff, Users, Star,
  Building, CheckCircle, XCircle, Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  getMyAdvisories,
  createAdvisory,
  updateAdvisory,
  deleteAdvisory,
  type Advisory,
  type CreateAdvisoryData
} from "@/api/advisories";
import { getMyCompanies, type Company } from "@/api/companies";
import { getCategoriesTree } from "@/api/categories";

const MyAdvisories = () => {
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAdvisory, setEditingAdvisory] = useState<Advisory | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAdvisoryData>({
    companyId: "",
    title: "",
    description: "",
    category: "",
    subcategory: "",
    expertise: [],
    pricing: {
      type: "consultation",
      currency: "EUR",
      sessionDuration: 60
    },
    availability: {
      schedule: [
        { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", available: true },
        { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", available: false },
        { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", available: false }
      ],
      timezone: "Europe/Madrid",
      advanceBooking: 24
    },
    format: "video",
    languages: ["es"]
  });

  const [expertiseInput, setExpertiseInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  const pricingTypes = [
    { value: "free", label: "Gratuito" },
    { value: "paid", label: "Pagado" },
    { value: "consultation", label: "Consulta inicial gratuita" }
  ];

  const formats = [
    { value: "video", label: "Videollamada" },
    { value: "phone", label: "Llamada telefónica" },
    { value: "in-person", label: "Presencial" },
    { value: "email", label: "Email" },
    { value: "chat", label: "Chat" }
  ];

  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  const loadData = async () => {
    try {
      const [advisoriesResponse, companiesResponse, categoriesResponse] = await Promise.all([
        getMyAdvisories(),
        getMyCompanies(),
        getCategoriesTree("advisory")
      ]);
      
      setAdvisories(advisoriesResponse.data);
      setCompanies(companiesResponse.data);
      setCategories(categoriesResponse.data);
    } catch (error) {
      toast.error("Error al cargar los datos");
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await loadData();
      setLoading(false);
    };
    loadInitialData();
  }, []);

  const handleCreate = async () => {
    if (!formData.companyId || !formData.title.trim() || !formData.description.trim()) {
      toast.error("La empresa, título y descripción son requeridos");
      return;
    }

    try {
      await createAdvisory(formData);
      toast.success("Asesoría creada exitosamente");
      setIsCreateOpen(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear la asesoría");
    }
  };

  const handleUpdate = async () => {
    if (!editingAdvisory || !formData.companyId || !formData.title.trim() || !formData.description.trim()) {
      toast.error("La empresa, título y descripción son requeridos");
      return;
    }

    try {
      const { companyId, ...updateData } = formData;
      await updateAdvisory(editingAdvisory._id, updateData);
      toast.success("Asesoría actualizada exitosamente");
      setEditingAdvisory(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar la asesoría");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta asesoría?")) return;

    try {
      await deleteAdvisory(id);
      toast.success("Asesoría eliminada exitosamente");
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar la asesoría");
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: "",
      title: "",
      description: "",
      category: "",
      subcategory: "",
      expertise: [],
      pricing: {
        type: "consultation",
        currency: "EUR",
        sessionDuration: 60
      },
      availability: {
        schedule: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", available: true },
          { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", available: true },
          { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", available: true },
          { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", available: true },
          { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", available: true },
          { dayOfWeek: 6, startTime: "09:00", endTime: "17:00", available: false },
          { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", available: false }
        ],
        timezone: "Europe/Madrid",
        advanceBooking: 24
      },
      format: "video",
      languages: ["es"]
    });
    setExpertiseInput("");
    setRequirementInput("");
    setLanguageInput("");
  };

  const startEdit = (advisory: Advisory) => {
    setEditingAdvisory(advisory);
    setFormData({
      companyId: advisory.company._id,
      title: advisory.title,
      description: advisory.description,
      category: advisory.category,
      subcategory: advisory.subcategory,
      expertise: advisory.expertise,
      pricing: advisory.pricing,
      availability: advisory.availability,
      format: advisory.format,
      languages: advisory.languages,
      requirements: advisory.requirements || []
    });
  };

  const addExpertise = () => {
    if (expertiseInput.trim()) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, expertiseInput.trim()]
      });
      setExpertiseInput("");
    }
  };

  const removeExpertise = (index: number) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index)
    });
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData({
        ...formData,
        requirements: [...(formData.requirements || []), requirementInput.trim()]
      });
      setRequirementInput("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements?.filter((_, i) => i !== index) || []
    });
  };

  const addLanguage = () => {
    if (languageInput.trim()) {
      setFormData({
        ...formData,
        languages: [...formData.languages, languageInput.trim()]
      });
      setLanguageInput("");
    }
  };

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index)
    });
  };

  const updateSchedule = (dayIndex: number, field: string, value: any) => {
    const newSchedule = [...formData.availability.schedule];
    newSchedule[dayIndex] = { ...newSchedule[dayIndex], [field]: value };
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        schedule: newSchedule
      }
    });
  };

  const formatPricing = (pricing: Advisory['pricing']) => {
    if (pricing.type === 'free') return "Gratuito";
    if (pricing.type === 'consultation') return "Consulta inicial gratuita";
    
    let price = "";
    if (pricing.hourlyRate) {
      price = `${pricing.hourlyRate} ${pricing.currency}/hora`;
    } else if (pricing.sessionRate) {
      price = `${pricing.sessionRate} ${pricing.currency}/sesión`;
    }
    
    return price;
  };

  const getStatusBadge = (advisory: Advisory) => {
    return advisory.isActive ? (
      <Badge variant="default" className="bg-green-500">Activa</Badge>
    ) : (
      <Badge variant="secondary">Inactiva</Badge>
    );
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
            <h1 className="text-2xl font-bold">Les Meves Assessories</h1>
            <p className="text-gray-600">
              Gestiona els teus serveis d'assessoria i consultoria
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Asesoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nueva Asesoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Empresa *</Label>
                    <Select value={formData.companyId} onValueChange={(value) => setFormData({...formData, companyId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(company => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="title">Título del Servicio *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Consultoría en Marketing Digital"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe tu servicio de asesoría..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category._id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="subcategory">Subcategoría</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory || ""}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      placeholder="Subcategoría específica"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="format">Formato</Label>
                    <Select value={formData.format} onValueChange={(value: any) => setFormData({...formData, format: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Formato de asesoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sessionDuration">Duración de Sesión (min)</Label>
                    <Input
                      id="sessionDuration"
                      type="number"
                      value={formData.pricing.sessionDuration}
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, sessionDuration: parseInt(e.target.value) || 60}})}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Precios</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="pricingType">Tipo</Label>
                      <Select value={formData.pricing.type} onValueChange={(value: any) => setFormData({...formData, pricing: {...formData.pricing, type: value}})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pricingTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="hourlyRate">Tarifa por Hora</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={formData.pricing.hourlyRate || ""}
                        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, hourlyRate: parseInt(e.target.value) || undefined}})}
                        placeholder="50"
                        disabled={formData.pricing.type === 'free'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="sessionRate">Tarifa por Sesión</Label>
                      <Input
                        id="sessionRate"
                        type="number"
                        value={formData.pricing.sessionRate || ""}
                        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, sessionRate: parseInt(e.target.value) || undefined}})}
                        placeholder="100"
                        disabled={formData.pricing.type === 'free'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Moneda</Label>
                      <Select value={formData.pricing.currency} onValueChange={(value) => setFormData({...formData, pricing: {...formData.pricing, currency: value}})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Disponibilidad</Label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="timezone">Zona Horaria</Label>
                      <Input
                        id="timezone"
                        value={formData.availability.timezone}
                        onChange={(e) => setFormData({...formData, availability: {...formData.availability, timezone: e.target.value}})}
                        placeholder="Europe/Madrid"
                      />
                    </div>
                    <div>
                      <Label htmlFor="advanceBooking">Reserva Anticipada (horas)</Label>
                      <Input
                        id="advanceBooking"
                        type="number"
                        value={formData.availability.advanceBooking}
                        onChange={(e) => setFormData({...formData, availability: {...formData.availability, advanceBooking: parseInt(e.target.value) || 24}})}
                        placeholder="24"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Horarios por Día</Label>
                    {formData.availability.schedule.map((day, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-24">
                          <Checkbox
                            checked={day.available}
                            onCheckedChange={(checked) => updateSchedule(index, 'available', checked)}
                          />
                          <span className="ml-2 text-sm font-medium">{dayNames[day.dayOfWeek]}</span>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="time"
                            value={day.startTime}
                            onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                            disabled={!day.available}
                            className="w-32"
                          />
                          <span className="self-center">-</span>
                          <Input
                            type="time"
                            value={day.endTime}
                            onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                            disabled={!day.available}
                            className="w-32"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Áreas de Experiencia</Label>
                  <div className="flex gap-2">
                    <Input
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      placeholder="Añadir área de experiencia..."
                      onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                    />
                    <Button type="button" onClick={addExpertise}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((exp, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeExpertise(index)}>
                        {exp} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Idiomas</Label>
                  <div className="flex gap-2">
                    <Input
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      placeholder="Añadir idioma..."
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                    />
                    <Button type="button" onClick={addLanguage}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((lang, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeLanguage(index)}>
                        {lang} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Requisitos</Label>
                  <div className="flex gap-2">
                    <Input
                      value={requirementInput}
                      onChange={(e) => setRequirementInput(e.target.value)}
                      placeholder="Añadir requisito..."
                      onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                    />
                    <Button type="button" onClick={addRequirement}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.requirements?.map((req, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement(index)}>
                        {req} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate}>
                    Crear Asesoría
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Advisories List */}
        {advisories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes servicios de asesoría
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Crea tu primer servicio de asesoría para empezar a ofrecer consultoría
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Asesoría
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advisories.map(advisory => (
              <Card key={advisory._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {advisory.company.logo ? (
                          <img src={advisory.company.logo} alt={advisory.company.name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <Building className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{advisory.title}</CardTitle>
                        <p className="text-sm text-gray-500">{advisory.company.name}</p>
                      </div>
                    </div>
                    {getStatusBadge(advisory)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {advisory.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Globe className="h-4 w-4" />
                      {formats.find(f => f.value === advisory.format)?.label}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {advisory.pricing.sessionDuration} min por sesión
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <DollarSign className="h-4 w-4" />
                      {formatPricing(advisory.pricing)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {advisory.bookings.length} reservas
                    </div>
                    
                    {advisory.stats.averageRating > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {advisory.stats.averageRating.toFixed(1)} ({advisory.reviews.length} reseñas)
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {advisory.expertise.slice(0, 3).map((exp, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {exp}
                        </Badge>
                      ))}
                      {advisory.expertise.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{advisory.expertise.length - 3} más
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(advisory)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(advisory._id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        {editingAdvisory && (
          <Dialog open={!!editingAdvisory} onOpenChange={() => setEditingAdvisory(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Asesoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-company">Empresa *</Label>
                    <Select value={formData.companyId} onValueChange={(value) => setFormData({...formData, companyId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(company => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-title">Título del Servicio *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Consultoría en Marketing Digital"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Descripción *</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe tu servicio de asesoría..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category._id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-subcategory">Subcategoría</Label>
                    <Input
                      id="edit-subcategory"
                      value={formData.subcategory || ""}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      placeholder="Subcategoría específica"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-format">Formato</Label>
                    <Select value={formData.format} onValueChange={(value: any) => setFormData({...formData, format: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Formato de asesoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map(format => (
                          <SelectItem key={format.value} value={format.value}>
                            {format.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-sessionDuration">Duración de Sesión (min)</Label>
                    <Input
                      id="edit-sessionDuration"
                      type="number"
                      value={formData.pricing.sessionDuration}
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, sessionDuration: parseInt(e.target.value) || 60}})}
                      placeholder="60"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Precios</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="edit-pricingType">Tipo</Label>
                      <Select value={formData.pricing.type} onValueChange={(value: any) => setFormData({...formData, pricing: {...formData.pricing, type: value}})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {pricingTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-hourlyRate">Tarifa por Hora</Label>
                      <Input
                        id="edit-hourlyRate"
                        type="number"
                        value={formData.pricing.hourlyRate || ""}
                        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, hourlyRate: parseInt(e.target.value) || undefined}})}
                        placeholder="50"
                        disabled={formData.pricing.type === 'free'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-sessionRate">Tarifa por Sesión</Label>
                      <Input
                        id="edit-sessionRate"
                        type="number"
                        value={formData.pricing.sessionRate || ""}
                        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, sessionRate: parseInt(e.target.value) || undefined}})}
                        placeholder="100"
                        disabled={formData.pricing.type === 'free'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-currency">Moneda</Label>
                      <Select value={formData.pricing.currency} onValueChange={(value) => setFormData({...formData, pricing: {...formData.pricing, currency: value}})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Áreas de Experiencia</Label>
                  <div className="flex gap-2">
                    <Input
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      placeholder="Añadir área de experiencia..."
                      onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                    />
                    <Button type="button" onClick={addExpertise}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((exp, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeExpertise(index)}>
                        {exp} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Idiomas</Label>
                  <div className="flex gap-2">
                    <Input
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      placeholder="Añadir idioma..."
                      onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                    />
                    <Button type="button" onClick={addLanguage}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((lang, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeLanguage(index)}>
                        {lang} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingAdvisory(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdate}>
                    Actualizar Asesoría
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

export default MyAdvisories;