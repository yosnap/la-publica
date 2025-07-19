
import { useState, useEffect } from "react";
import { Building2, MapPin, Users, Calendar, Grid, List, Filter, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/PageWrapper";
import { getCompanies, Company } from "@/api/companies";
import { useUserProfile } from "@/hooks/useUser";
import { useNavigate } from "react-router-dom";


// Funció per crear URL amigable en català
const createFriendlyUrl = (name: string, id: string) => {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar accents
    .replace(/[^a-z0-9\s-]/g, '') // Només lletres, números, espais i guions
    .replace(/\s+/g, '-') // Espais a guions
    .replace(/-+/g, '-') // Múltiples guions a un sol
    .trim();
  return `/empresa/${slug}-${id}`;
};

export default function Companies() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  // Usar el hook centralizado para los datos del usuario
  const { user: currentUser } = useUserProfile();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setCompaniesLoading(true);
        const response = await getCompanies();
        if (response.success) {
          setCompanies(response.data);
        } else {
          console.error('Error fetching companies:', response.error);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setCompaniesLoading(false);
      }
    };
    fetchCompanies();
  }, []);



  const CompanyCard = ({ company, isGrid }: { company: Company, isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
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
                <h3 className="text-xl font-semibold text-gray-900 hover:text-primary cursor-pointer" 
                    onClick={() => navigate(createFriendlyUrl(company.name, company._id))}>
                  {company.name}
                </h3>
                {company.verified.status === 'verified' && (
                  <Badge className="bg-green-500 text-white ml-2">Verificada</Badge>
                )}
              </div>
              <p className="text-gray-600 mb-3">{company.description}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">{company.category}</Badge>
                <Badge variant="secondary">{company.size}</Badge>
              </div>
            </div>
          </div>
          
          <div className={`${isGrid ? 'w-full mt-4' : 'w-80 flex-shrink-0'}`}>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{company.location.city}, {company.location.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{company.stats.employees || 'N/A'} empleats</span>
              </div>
              {company.stats.founded && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{company.stats.founded}</span>
                </div>
              )}
              {company.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{company.website}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={() => navigate(createFriendlyUrl(company.name, company._id))}
              >
                Veure Perfil
              </Button>
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
        { /* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Empreses i Col·laboradors</h1>
            <p className="text-gray-600">Descobreix empreses verificades i els seus serveis professionals</p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              if (currentUser?.role === 'colaborador') {
                window.location.href = '/colaborador/empresas';
              } else {
                alert('Només els col·laboradors poden registrar empreses');
              }
            }}
          >
            <Building2 className="h-4 w-4 mr-2" />
            {currentUser?.role === 'colaborador' ? 'Gestionar Les Meves Empreses' : 'Registrar Empresa'}
          </Button>
        </div>

        { /* Search and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <Input
                placeholder="Cercar empreses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtres
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

        { /* Companies Grid/List */}
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {companiesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => (
              <CompanyCard key={company._id} company={company} isGrid={viewMode === "grid"} />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No s'han trobat empreses</p>
            </div>
          )}
        </div>

        { /* Stats Section */}
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadístiques de la Comunitat</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">150+</div>
                <div className="text-sm text-gray-600">Empreses Registrades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">89%</div>
                <div className="text-sm text-gray-600">Empreses Verificades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">25+</div>
                <div className="text-sm text-gray-600">Sectors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">4.7</div>
                <div className="text-sm text-gray-600">Valoració Mitjana</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
