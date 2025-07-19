import { useState, useEffect } from "react";
import { 
  Plus, Edit, Trash, Building, MapPin, Globe, 
  Phone, Mail, Users, Calendar, BadgeCheck, Eye, EyeOff,
  Camera, Upload
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
import { toast } from "sonner";
import {
  getMyCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  type Company,
  type CreateCompanyData
} from "@/api/companies";
import { getCategoriesTree } from "@/api/categories";

const MyCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: "",
    description: "",
    category: "",
    size: "small",
    email: "",
    phone: "",
    website: "",
    location: {
      address: "",
      city: "",
      country: "España"
    },
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: ""
    },
    stats: {
      employees: 0,
      founded: new Date().getFullYear(),
      revenue: ""
    }
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");

  const sizeOptions = [
    { value: "startup", label: "Startup (1-10 empleats)" },
    { value: "small", label: "Petita (11-50 empleats)" },
    { value: "medium", label: "Mitjana (51-200 empleats)" },
    { value: "large", label: "Gran (201-1000 empleats)" },
    { value: "enterprise", label: "Empresa (1000+ empleats)" }
  ];

  const loadCompanies = async () => {
    try {
      const response = await getMyCompanies();
      setCompanies(response.data);
    } catch (error) {
      toast.error("Error al cargar las empresas");
    }
  };

  const loadCategories = async () => {
    try {
      const response = await getCategoriesTree("company");
      setCategories(response.data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadCompanies(), loadCategories()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("El nom i email són requerits");
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Afegir camps de text
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });
      
      // Afegir imatges si existeixen
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (bannerFile) {
        formDataToSend.append('banner', bannerFile);
      }
      
      await createCompany(formDataToSend as any);
      toast.success("Empresa creada exitosament");
      setIsCreateOpen(false);
      resetForm();
      await loadCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al crear l'empresa");
    }
  };

  const handleUpdate = async () => {
    if (!editingCompany || !formData.name.trim() || !formData.email.trim()) {
      toast.error("El nom i email són requerits");
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Afegir camps de text
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      });
      
      // Afegir imatges si existeixen
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }
      if (bannerFile) {
        formDataToSend.append('banner', bannerFile);
      }
      
      await updateCompany(editingCompany._id, formDataToSend as any);
      toast.success("Empresa actualitzada exitosament");
      setEditingCompany(null);
      resetForm();
      await loadCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualitzar l'empresa");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta empresa?")) return;

    try {
      await deleteCompany(id);
      toast.success("Empresa eliminada exitosamente");
      await loadCompanies();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al eliminar la empresa");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      size: "small",
      email: "",
      phone: "",
      website: "",
      location: {
        address: "",
        city: "",
        country: "España"
      },
      socialLinks: {
        linkedin: "",
        twitter: "",
        facebook: ""
      },
      stats: {
        employees: 0,
        founded: new Date().getFullYear(),
        revenue: ""
      }
    });
    setLogoFile(null);
    setLogoPreview("");
    setBannerFile(null);
    setBannerPreview("");
  };

  const startEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      description: company.description,
      category: company.category,
      size: company.size,
      email: company.email,
      phone: company.phone || "",
      website: company.website || "",
      location: company.location,
      socialLinks: company.socialLinks || { linkedin: "", twitter: "", facebook: "" },
      stats: company.stats
    });
    // Reset images first
    setLogoFile(null);
    setLogoPreview("");
    setBannerFile(null);
    setBannerPreview("");
    // Set existing images if available
    if (company.logo) {
      setLogoPreview(company.logo);
    }
    if (company.banner || company.coverImage) {
      setBannerPreview(company.banner || company.coverImage);
    }
  };

  const getVerificationBadge = (status: string) => {
    const badges = {
      verified: { color: "bg-green-500", text: "Verificada", icon: BadgeCheck },
      pending: { color: "bg-yellow-500", text: "Pendiente", icon: Eye },
      rejected: { color: "bg-red-500", text: "Rechazada", icon: EyeOff }
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <Badge className={`${badge.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.text}
      </Badge>
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
            <h1 className="text-2xl font-bold">Mis Empresas</h1>
            <p className="text-gray-600">
              Gestiona tus empresas y mantén actualizada tu información
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nueva Empresa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nova Empresa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Imatges */}
                <div className="space-y-4">
                  <div>
                    <Label>Logo de l'empresa</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                          ) : (
                            <Camera className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setLogoFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLogoPreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Format: JPG, PNG</p>
                        <p>Mida màxima: 5MB</p>
                        <p>Recomanat: 200x200px</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Portada de l'empresa</Label>
                    <div className="mt-2">
                      <div className="relative">
                        <div className="h-32 w-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Fes clic per pujar la portada</p>
                            </div>
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBannerFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setBannerPreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Format: JPG, PNG • Mida màxima: 5MB • Recomanat: 1200x400px
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Empresa *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Corporativo *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe tu empresa..."
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
                    <Label htmlFor="size">Tamaño</Label>
                    <Select value={formData.size} onValueChange={(value: any) => setFormData({...formData, size: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+34 xxx xxx xxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Sitio Web</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Ubicación</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        value={formData.location.address}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                        placeholder="Dirección"
                      />
                    </div>
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
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Redes Sociales</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        value={formData.socialLinks?.linkedin || ""}
                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.socialLinks?.twitter || ""}
                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.socialLinks?.facebook || ""}
                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, facebook: e.target.value}})}
                        placeholder="Facebook URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Estadísticas</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">Empleados</Label>
                      <Input
                        type="number"
                        value={formData.stats.employees}
                        onChange={(e) => setFormData({...formData, stats: {...formData.stats, employees: parseInt(e.target.value) || 0}})}
                        placeholder="Número de empleados"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Año de Fundación</Label>
                      <Input
                        type="number"
                        value={formData.stats.founded}
                        onChange={(e) => setFormData({...formData, stats: {...formData.stats, founded: parseInt(e.target.value) || new Date().getFullYear()}})}
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Ingresos</Label>
                      <Input
                        value={formData.stats.revenue || ""}
                        onChange={(e) => setFormData({...formData, stats: {...formData.stats, revenue: e.target.value}})}
                        placeholder="€1M-5M"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreate}>
                    Crear Empresa
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Companies List */}
        {companies.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No tienes empresas registradas
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Crea tu primera empresa para empezar a ofrecer servicios y oportunidades
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Empresa
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(company => (
              <Card key={company._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <Building className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{company.name}</CardTitle>
                        <p className="text-sm text-gray-500">{company.category}</p>
                      </div>
                    </div>
                    {getVerificationBadge(company.verified.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {company.description}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      {company.location.city}, {company.location.country}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      {sizeOptions.find(s => s.value === company.size)?.label}
                    </div>
                    
                    {company.stats.employees && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {company.stats.employees} empleados • Fundada en {company.stats.founded}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(company)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(company._id)}
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
        {editingCompany && (
          <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Empresa</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Imatges */}
                <div className="space-y-4">
                  <div>
                    <Label>Logo de l'empresa</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                          ) : (
                            <Camera className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setLogoFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setLogoPreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Format: JPG, PNG</p>
                        <p>Mida màxima: 5MB</p>
                        <p>Recomanat: 200x200px</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Portada de l'empresa</Label>
                    <div className="mt-2">
                      <div className="relative">
                        <div className="h-32 w-full rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {bannerPreview ? (
                            <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Fes clic per pujar la portada</p>
                            </div>
                          )}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setBannerFile(file);
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setBannerPreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Format: JPG, PNG • Mida màxima: 5MB • Recomanat: 1200x400px
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Nombre de la Empresa *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email Corporativo *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe tu empresa..."
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
                    <Label htmlFor="edit-size">Tamaño</Label>
                    <Select value={formData.size} onValueChange={(value: any) => setFormData({...formData, size: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phone">Teléfono</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+34 xxx xxx xxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-website">Sitio Web</Label>
                    <Input
                      id="edit-website"
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://www.empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Ubicación</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        value={formData.location.address}
                        onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
                        placeholder="Dirección"
                      />
                    </div>
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
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Redes Sociales</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Input
                        value={formData.socialLinks?.linkedin || ""}
                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, linkedin: e.target.value}})}
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.socialLinks?.twitter || ""}
                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div>
                      <Input
                        value={formData.socialLinks?.facebook || ""}
                        onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, facebook: e.target.value}})}
                        placeholder="Facebook URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Estadísticas</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm">Empleados</Label>
                      <Input
                        type="number"
                        value={formData.stats.employees}
                        onChange={(e) => setFormData({...formData, stats: {...formData.stats, employees: parseInt(e.target.value) || 0}})}
                        placeholder="Número de empleados"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Año de Fundación</Label>
                      <Input
                        type="number"
                        value={formData.stats.founded}
                        onChange={(e) => setFormData({...formData, stats: {...formData.stats, founded: parseInt(e.target.value) || new Date().getFullYear()}})}
                        placeholder="2020"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Ingresos</Label>
                      <Input
                        value={formData.stats.revenue || ""}
                        onChange={(e) => setFormData({...formData, stats: {...formData.stats, revenue: e.target.value}})}
                        placeholder="€1M-5M"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingCompany(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdate}>
                    Actualizar Empresa
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

export default MyCompanies;