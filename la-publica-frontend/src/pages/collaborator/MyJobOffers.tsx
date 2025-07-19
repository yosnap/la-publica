import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash, Briefcase, MapPin, Calendar, 
  DollarSign, Clock, Eye, EyeOff, Users, ChevronRight,
  Building, CheckCircle, XCircle
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
  getMyJobOffers,
  getJobOffersByCompany,
  createJobOffer,
  updateJobOffer,
  deleteJobOffer,
  type JobOffer,
  type CreateJobOfferData
} from "@/api/jobOffers";
import { getMyCompanies, type Company } from "@/api/companies";
import { getCategoriesTree } from "@/api/categories";

const MyJobOffers = () => {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CreateJobOfferData>({
    companyId: "",
    title: "",
    description: "",
    location: {
      city: "",
      country: "España",
      isRemote: false
    },
    employmentType: "full-time",
    salary: {
      min: 0,
      max: 0,
      currency: "EUR",
      period: "month"
    },
    requirements: [],
    benefits: [],
    skills: [],
    experienceLevel: "mid",
    category: "",
    applicationDeadline: ""
  });

  const [requirementInput, setRequirementInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const employmentTypes = [
    { value: "full-time", label: "Tiempo Completo" },
    { value: "part-time", label: "Tiempo Parcial" },
    { value: "contract", label: "Contrato" },
    { value: "internship", label: "Prácticas" },
    { value: "freelance", label: "Freelance" }
  ];

  const experienceLevels = [
    { value: "entry", label: "Sin experiencia" },
    { value: "junior", label: "Junior (1-2 años)" },
    { value: "mid", label: "Intermedio (3-5 años)" },
    { value: "senior", label: "Senior (5+ años)" },
    { value: "lead", label: "Líder/Directivo" }
  ];

  const salaryPeriods = [
    { value: "hour", label: "Por Hora" },
    { value: "day", label: "Por Día" },
    { value: "month", label: "Por Mes" },
    { value: "year", label: "Por Año" }
  ];

  const loadData = async () => {
    try {
      const [offersResponse, companiesResponse, categoriesResponse] = await Promise.all([
        getMyJobOffers(),
        getMyCompanies(),
        getCategoriesTree("job")
      ]);
      
      setJobOffers(offersResponse.data);
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
      await createJobOffer(formData);
      toast.success("Oferta creada exitosamente");
      setIsCreateOpen(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear la oferta");
    }
  };

  const handleUpdate = async () => {
    if (!editingOffer || !formData.companyId || !formData.title.trim() || !formData.description.trim()) {
      toast.error("La empresa, título y descripción son requeridos");
      return;
    }

    try {
      const { companyId, ...updateData } = formData;
      await updateJobOffer(editingOffer._id, updateData);
      toast.success("Oferta actualizada exitosamente");
      setEditingOffer(null);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar la oferta");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta oferta?")) return;

    try {
      await deleteJobOffer(id);
      toast.success("Oferta eliminada exitosamente");
      await loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar la oferta");
    }
  };

  const resetForm = () => {
    setFormData({
      companyId: "",
      title: "",
      description: "",
      location: {
        city: "",
        country: "España",
        isRemote: false
      },
      employmentType: "full-time",
      salary: {
        min: 0,
        max: 0,
        currency: "EUR",
        period: "month"
      },
      requirements: [],
      benefits: [],
      skills: [],
      experienceLevel: "mid",
      category: "",
      applicationDeadline: ""
    });
    setRequirementInput("");
    setBenefitInput("");
    setSkillInput("");
  };

  const startEdit = (offer: JobOffer) => {
    setEditingOffer(offer);
    setFormData({
      companyId: offer.company._id,
      title: offer.title,
      description: offer.description,
      location: offer.location,
      employmentType: offer.employmentType,
      salary: offer.salary,
      requirements: offer.requirements,
      benefits: offer.benefits || [],
      skills: offer.skills,
      experienceLevel: offer.experienceLevel,
      category: offer.category,
      applicationDeadline: offer.applicationDeadline || ""
    });
  };

  const addRequirement = () => {
    if (requirementInput.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirementInput.trim()]
      });
      setRequirementInput("");
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      setFormData({
        ...formData,
        benefits: [...(formData.benefits || []), benefitInput.trim()]
      });
      setBenefitInput("");
    }
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits?.filter((_, i) => i !== index) || []
    });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  const formatSalary = (salary: JobOffer['salary']) => {
    const { min, max, currency, period } = salary;
    let salaryText = "";
    
    if (min && max) {
      salaryText = `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    } else if (min) {
      salaryText = `Desde ${min.toLocaleString()} ${currency}`;
    } else if (max) {
      salaryText = `Hasta ${max.toLocaleString()} ${currency}`;
    } else {
      salaryText = "Salario a convenir";
    }
    
    if (min || max) {
      const periodText = {
        hour: "por hora",
        day: "por día", 
        month: "por mes",
        year: "por año"
      }[period];
      salaryText += ` ${periodText}`;
    }
    
    return salaryText;
  };

  const getStatusBadge = (offer: JobOffer) => {
    const isExpired = offer.applicationDeadline && new Date(offer.applicationDeadline) < new Date();
    
    if (isExpired) {
      return <Badge variant="destructive">Expirada</Badge>;
    }
    
    return offer.isActive ? (
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
            <h1 className="text-2xl font-bold">Les Meves Ofertes de Treball</h1>
            <p className="text-gray-600">
              Gestiona les ofertes de treball de les teves empreses
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Oferta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nova Oferta</DialogTitle>
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
                    <Label htmlFor="title">Título del Puesto *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Desarrollador Frontend Senior"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe el puesto de trabajo..."
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
                    <Label htmlFor="employmentType">Tipo de Empleo</Label>
                    <Select value={formData.employmentType} onValueChange={(value: any) => setFormData({...formData, employmentType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de empleo" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experienceLevel">Nivel de Experiencia</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value: any) => setFormData({...formData, experienceLevel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nivel de experiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deadline">Fecha Límite</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Ubicación</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        value={formData.location.city}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                        placeholder="Ciudad"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.location.country}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, country: e.target.value}})}
                        placeholder="País"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remote" 
                        checked={formData.location.isRemote}
                        onCheckedChange={(checked) => setFormData({...formData, location: {...formData.location, isRemote: checked as boolean}})}
                      />
                      <label htmlFor="remote" className="text-sm font-medium">
                        Trabajo remoto
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Salario</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Input
                        type="number"
                        value={formData.salary.min || ""}
                        onChange={(e) => setFormData({...formData, salary: {...formData.salary, min: parseInt(e.target.value) || 0}})}
                        placeholder="Mínimo"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={formData.salary.max || ""}
                        onChange={(e) => setFormData({...formData, salary: {...formData.salary, max: parseInt(e.target.value) || 0}})}
                        placeholder="Máximo"
                      />
                    </div>
                    <div>
                      <Select value={formData.salary.currency} onValueChange={(value) => setFormData({...formData, salary: {...formData.salary, currency: value}})}>
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
                    <div>
                      <Select value={formData.salary.period} onValueChange={(value: any) => setFormData({...formData, salary: {...formData.salary, period: value}})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {salaryPeriods.map(period => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                    {formData.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement(index)}>
                        {req} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Beneficios</Label>
                  <div className="flex gap-2">
                    <Input
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      placeholder="Añadir beneficio..."
                      onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                    />
                    <Button type="button" onClick={addBenefit}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits?.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeBenefit(index)}>
                        {benefit} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Habilidades</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Añadir habilidad..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button type="button" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(index)}>
                        {skill} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate}>
                    Crear Oferta
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Job Offers List */}
        {jobOffers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes ofertas de trabajo
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Crea tu primera oferta de trabajo para empezar a recibir candidatos
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Oferta
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobOffers.map(offer => (
              <Card key={offer._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {offer.company.logo ? (
                          <img src={offer.company.logo} alt={offer.company.name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <Building className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{offer.title}</CardTitle>
                        <p className="text-sm text-gray-500">{offer.company.name}</p>
                      </div>
                    </div>
                    {getStatusBadge(offer)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {offer.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {offer.location.isRemote ? "Remoto" : `${offer.location.city}, ${offer.location.country}`}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {employmentTypes.find(t => t.value === offer.employmentType)?.label}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <DollarSign className="h-4 w-4" />
                      {formatSalary(offer.salary)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {offer.applications.length} candidatos
                    </div>
                    
                    {offer.applicationDeadline && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        Límite: {new Date(offer.applicationDeadline).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(offer)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(offer._id)}
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
        {editingOffer && (
          <Dialog open={!!editingOffer} onOpenChange={() => setEditingOffer(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Oferta</DialogTitle>
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
                    <Label htmlFor="edit-title">Título del Puesto *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Desarrollador Frontend Senior"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Descripción *</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe el puesto de trabajo..."
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
                    <Label htmlFor="edit-employmentType">Tipo de Empleo</Label>
                    <Select value={formData.employmentType} onValueChange={(value: any) => setFormData({...formData, employmentType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de empleo" />
                      </SelectTrigger>
                      <SelectContent>
                        {employmentTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-experienceLevel">Nivel de Experiencia</Label>
                    <Select value={formData.experienceLevel} onValueChange={(value: any) => setFormData({...formData, experienceLevel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Nivel de experiencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-deadline">Fecha Límite</Label>
                    <Input
                      id="edit-deadline"
                      type="date"
                      value={formData.applicationDeadline}
                      onChange={(e) => setFormData({...formData, applicationDeadline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Ubicación</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        value={formData.location.city}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                        placeholder="Ciudad"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.location.country}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, country: e.target.value}})}
                        placeholder="País"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="edit-remote" 
                        checked={formData.location.isRemote}
                        onCheckedChange={(checked) => setFormData({...formData, location: {...formData.location, isRemote: checked as boolean}})}
                      />
                      <label htmlFor="edit-remote" className="text-sm font-medium">
                        Trabajo remoto
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Salario</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Input
                        type="number"
                        value={formData.salary.min || ""}
                        onChange={(e) => setFormData({...formData, salary: {...formData.salary, min: parseInt(e.target.value) || 0}})}
                        placeholder="Mínimo"
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        value={formData.salary.max || ""}
                        onChange={(e) => setFormData({...formData, salary: {...formData.salary, max: parseInt(e.target.value) || 0}})}
                        placeholder="Máximo"
                      />
                    </div>
                    <div>
                      <Select value={formData.salary.currency} onValueChange={(value) => setFormData({...formData, salary: {...formData.salary, currency: value}})}>
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
                    <div>
                      <Select value={formData.salary.period} onValueChange={(value: any) => setFormData({...formData, salary: {...formData.salary, period: value}})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {salaryPeriods.map(period => (
                            <SelectItem key={period.value} value={period.value}>
                              {period.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                    {formData.requirements.map((req, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeRequirement(index)}>
                        {req} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Beneficios</Label>
                  <div className="flex gap-2">
                    <Input
                      value={benefitInput}
                      onChange={(e) => setBenefitInput(e.target.value)}
                      placeholder="Añadir beneficio..."
                      onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                    />
                    <Button type="button" onClick={addBenefit}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.benefits?.map((benefit, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeBenefit(index)}>
                        {benefit} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Habilidades</Label>
                  <div className="flex gap-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Añadir habilidad..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button type="button" onClick={addSkill}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(index)}>
                        {skill} <XCircle className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingOffer(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdate}>
                    Actualizar Oferta
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

export default MyJobOffers;