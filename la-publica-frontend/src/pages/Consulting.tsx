
import { useState } from "react";
import { HelpCircle, Star, Clock, Users, Award, Filter, Calendar, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageWrapper } from "@/components/PageWrapper";

const consultingServices = [
  {
    id: 1,
    title: "Consultoría Estratégica Empresarial",
    consultant: "María Rodríguez",
    consultantAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
    company: "Consultoría Empresarial",
    description: "Desarrollo de estrategias de crecimiento y optimización de procesos empresariales para mejorar la rentabilidad.",
    category: "Estrategia",
    duration: "2-4 semanas",
    price: "€150/hora",
    rating: 4.9,
    reviews: 87,
    completedProjects: 124,
    specialties: ["Análisis Financiero", "Planificación Estratégica", "Optimización de Procesos"],
    availability: "Disponible",
    languages: ["Español", "Inglés"]
  },
  {
    id: 2,
    title: "Asesoramiento en Transformación Digital",
    consultant: "Carlos López",
    consultantAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face",
    company: "TechSolutions S.A.",
    description: "Guía integral para la digitalización de procesos empresariales y adopción de nuevas tecnologías.",
    category: "Tecnología",
    duration: "1-3 meses",
    price: "€125/hora",
    rating: 4.7,
    reviews: 56,
    completedProjects: 89,
    specialties: ["Cloud Computing", "Automatización", "CRM Implementation"],
    availability: "Ocupado hasta Febrero",
    languages: ["Español", "Inglés", "Francés"]
  },
  {
    id: 3,
    title: "Consultoría en Marketing Digital y SEO",
    consultant: "Ana Martínez",
    consultantAvatar: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=60&h=60&fit=crop&crop=face",
    company: "Marketing Digital Pro",
    description: "Estrategias personalizadas de marketing digital, SEO y optimización de conversiones.",
    category: "Marketing",
    duration: "4-8 semanas",
    price: "€100/hora",
    rating: 4.8,
    reviews: 103,
    completedProjects: 156,
    specialties: ["SEO/SEM", "Google Analytics", "Social Media Strategy"],
    availability: "Disponible",
    languages: ["Español", "Inglés"]
  },
  {
    id: 4,
    title: "Asesoría Legal para Startups",
    consultant: "David García",
    consultantAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face",
    company: "García & Asociados",
    description: "Asesoramiento legal especializado en constitución de empresas, contratos y propiedad intelectual.",
    category: "Legal",
    duration: "Según necesidad",
    price: "€200/hora",
    rating: 4.6,
    reviews: 42,
    completedProjects: 78,
    specialties: ["Derecho Mercantil", "Propiedad Intelectual", "Contratos"],
    availability: "Disponible con cita previa",
    languages: ["Español", "Inglés"]
  }
];

export default function Consulting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  const categories = ["all", "Estrategia", "Tecnología", "Marketing", "Legal"];

  const ConsultingCard = ({ service, isGrid }: { service: any, isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className={`p-6 ${isGrid ? 'h-full flex flex-col' : ''}`}>
        <div className={`flex ${isGrid ? 'flex-col' : 'flex-col lg:flex-row items-start'} gap-6`}>
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <Avatar className={`${isGrid ? 'h-20 w-20' : 'h-16 w-16'} flex-shrink-0`}>
              <AvatarImage src={service.consultantAvatar} />
              <AvatarFallback>{service.consultant[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-primary cursor-pointer break-words">
                {service.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="text-gray-600 font-medium break-words">{service.consultant}</p>
                <span className="text-gray-400">•</span>
                <p className="text-gray-600 break-words">{service.company}</p>
              </div>
              
              <p className="text-gray-600 mb-4 break-words">{service.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {service.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs break-words">
                    {specialty}
                  </Badge>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current flex-shrink-0" />
                  <span className="font-medium">{service.rating}</span>
                  <span>({service.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="break-words">{service.completedProjects} proyectos</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="break-words">{service.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="break-words">{service.languages.join(", ")}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${isGrid ? 'w-full mt-auto' : 'w-full lg:w-64 flex-shrink-0'}`}>
            <div className="mb-4">
              <Badge className="mb-2">{service.category}</Badge>
              <div className="text-lg font-bold text-primary break-words">{service.price}</div>
              <Badge 
                className={
                  service.availability.includes("Disponible") 
                    ? "bg-green-500 text-white mt-2" 
                    : "bg-yellow-500 text-white mt-2"
                }
              >
                {service.availability}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">Solicitar Consultoría</Button>
              <Button size="sm" variant="outline" className="flex-1">Ver Perfil Completo</Button>
            </div>
            {!isGrid && (
              <Button variant="ghost" size="sm" className="w-full mt-2">
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Reunión
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        { /* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 break-words">Servicios de Asesoramiento</h1>
            <p className="text-gray-600 break-words">Encuentra expertos para consultoría especializada</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 flex-shrink-0">
            <HelpCircle className="h-4 w-4 mr-2" />
            Ofrecer Consultoría
          </Button>
        </div>

        { /* Search, Filters and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 overflow-hidden">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Buscar servicios de consultoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48 flex-shrink-0">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.slice(1).map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger className="w-full lg:w-48 flex-shrink-0">
              <SelectValue placeholder="Disponibilidad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Cualquier disponibilidad</SelectItem>
              <SelectItem value="available">Disponible ahora</SelectItem>
              <SelectItem value="scheduled">Con cita previa</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        { /* Consulting Services */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
          {consultingServices.map((service) => (
            <ConsultingCard key={service.id} service={service} isGrid={viewMode === "grid"} />
          ))}
        </div>

        { /* Load More */}
        <div className="text-center">
          <Button variant="outline">Cargar más servicios</Button>
        </div>
      </div>
    </PageWrapper>
  );
}
