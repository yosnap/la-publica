
import { useState } from "react";
import { Building2, MapPin, Users, Calendar, Grid, List, Filter, ArrowLeft, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/PageWrapper";
import CompanyProfile from "@/components/CompanyProfile";

const companies = [
  {
    id: 1,
    name: "TechSolutions S.A.",
    description: "Empresa líder en desarrollo de software y consultoría tecnológica",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=60&h=60&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=300&fit=crop",
    location: "Madrid, España",
    foundedYear: "2015",
    website: "www.techsolutions.com",
    phone: "+34 912 345 678",
    email: "contacto@techsolutions.com",
    employees: "50-100",
    industry: "Tecnología",
    services: ["Desarrollo Web", "Consultoría IT", "Apps Móviles"],
    clients: "150+",
    rating: 4.8,
    verified: true
  },
  {
    id: 2,
    name: "Marketing Digital Pro",
    logo: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=100&h=100&fit=crop",
    category: "Marketing",
    description: "Agencia de marketing digital especializada en redes sociales y SEO",
    location: "Barcelona, España",
    website: "www.marketingpro.es",
    email: "info@marketingpro.es",
    phone: "+34 93 987 6543",
    employees: "10-50",
    rating: 4.6,
    services: ["SEO/SEM", "Redes Sociales", "Email Marketing"],
    verified: true,
    foundedYear: "2018",
    industry: "Marketing"
  },
  {
    id: 3,
    name: "Consultoría Empresarial",
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    category: "Consultoría",
    description: "Asesoramiento estratégico para el crecimiento empresarial",
    location: "Valencia, España",
    website: "www.consultoria.es",
    email: "contacto@consultoria.es",
    phone: "+34 96 234 5678",
    employees: "5-10",
    rating: 4.9,
    services: ["Estrategia", "Finanzas", "RRHH"],
    verified: false,
    foundedYear: "2020",
    industry: "Consultoría"
  }
];

export default function Companies() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  console.log("Companies component rendering", { selectedCompany, viewMode });

  if (selectedCompany) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedCompany(null)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Empresas
          </Button>
          <CompanyProfile companyData={selectedCompany} />
        </div>
      </PageWrapper>
    );
  }

  const CompanyCard = ({ company, isGrid }: { company: any, isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedCompany(company)}>
      <CardContent className={`p-6 ${isGrid ? 'h-full' : ''}`}>
        <div className={`flex ${isGrid ? 'flex-col' : 'items-start'} gap-6`}>
          <div className="flex items-start gap-4 flex-1">
            <Avatar className={`${isGrid ? 'h-20 w-20' : 'h-16 w-16'} flex-shrink-0`}>
              <AvatarImage src={company.logo} />
              <AvatarFallback>
                <Building2 className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
                {company.verified && (
                  <Badge className="bg-green-500 text-white ml-2">Verificada</Badge>
                )}
              </div>
              <p className="text-gray-600 mb-3">{company.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {company.services?.map((service: string) => (
                  <Badge key={service} variant="secondary">{service}</Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className={`${isGrid ? 'w-full mt-4' : 'w-80 flex-shrink-0'}`}>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{company.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{company.employees} empleados</span>
              </div>
              {company.foundedYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{company.foundedYear}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{company.website}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="font-medium">{company.rating}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1">Ver Perfil</Button>
              <Button size="sm" variant="outline" className="flex-1">Contactar</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Empresas y Colaboradores</h1>
            <p className="text-gray-600">Descubre empresas verificadas y sus servicios profesionales</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Building2 className="h-4 w-4 mr-2" />
            Registrar Empresa
          </Button>
        </div>

        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
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

        {/* Companies Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} isGrid={viewMode === "grid"} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron empresas</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de la Comunidad</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">150+</div>
                <div className="text-sm text-gray-600">Empresas Registradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">89%</div>
                <div className="text-sm text-gray-600">Empresas Verificadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">25+</div>
                <div className="text-sm text-gray-600">Sectores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.7</div>
                <div className="text-sm text-gray-600">Valoración Media</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
