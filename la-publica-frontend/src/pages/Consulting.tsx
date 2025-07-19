import { useState, useEffect } from "react";
import { HelpCircle, Star, Clock, Users, Award, Filter, Calendar, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageWrapper } from "@/components/PageWrapper";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUser";
import { getAdvisories, type Advisory } from "@/api/advisories";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";

export default function Consulting() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const { user } = useUserProfile();
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ["all", "Estratègia", "Tecnologia", "Màrqueting", "Legal"];

  useEffect(() => {
    loadAdvisories();
  }, []);

  const loadAdvisories = async () => {
    try {
      setLoading(true);
      const response = await getAdvisories({ limit: 50 });
      setAdvisories(response.data);
    } catch (error: any) {
      console.error('Error loading advisories:', error);
      if (error.response?.status === 403) {
        toast.error('No tens permisos per veure els serveis d\'assessorament');
      } else {
        toast.error('Error al carregar els serveis d\'assessorament');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatPricing = (pricing: Advisory['pricing']) => {
    if (pricing.type === 'free') {
      return 'Gratuït';
    }
    
    if (pricing.type === 'consultation') {
      return 'Consulta prèvia';
    }

    const parts = [];
    if (pricing.hourlyRate) {
      parts.push(`${pricing.hourlyRate} ${pricing.currency}/hora`);
    }
    if (pricing.sessionRate) {
      parts.push(`${pricing.sessionRate} ${pricing.currency}/sessió`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'Preus a consultar';
  };

  const ServiceCard = ({ service, isGrid }: { service: Advisory; isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className={`p-6 ${isGrid ? 'h-full' : ''}`}>
        <div className={`flex ${isGrid ? 'flex-col' : 'items-start'} gap-6`}>
          <div className="flex items-start gap-4 flex-1">
            <Avatar className={`${isGrid ? 'h-16 w-16' : 'h-12 w-12'} flex-shrink-0`}>
              <AvatarImage src={service.company.logo ? getImageUrl(service.company.logo) : undefined} />
              <AvatarFallback>
                <HelpCircle className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {service.title}
              </h3>
              <p className="text-gray-600 font-medium mb-2">{service.company.name}</p>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {service.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {service.expertise.slice(0, 3).map((exp, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {exp}
                  </Badge>
                ))}
                {service.expertise.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{service.expertise.length - 3}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>
                    {service.stats.averageRating > 0 ? 
                      `${service.stats.averageRating.toFixed(1)} (${service.reviews.length})` : 
                      'Sense valoracions'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{service.stats.completedSessions} sessions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.pricing.sessionDuration} min</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${isGrid ? 'w-full mt-4' : 'w-48 flex-shrink-0'}`}>
            <div className="mb-4">
              <div className="text-lg font-bold text-primary mb-2">
                {formatPricing(service.pricing)}
              </div>
              <Badge 
                variant={service.isActive ? "default" : "secondary"}
                className={
                  service.isActive 
                    ? "bg-green-500 text-white" 
                    : "bg-yellow-500 text-white mt-2"
                }
              >
                {service.isActive ? 'Disponible' : 'No disponible'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" asChild>
                <Link to={`/assessorament/${service._id}`}>Sol·licitar Consultoría</Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1">Veure Perfil Complet</Button>
            </div>
            {!isGrid && (
              <Button variant="ghost" size="sm" className="w-full mt-2">
                <Calendar className="h-4 w-4 mr-2" />
                Programar Reunió
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
            <h1 className="text-2xl font-bold text-gray-900 break-words">Serveis d'Assessorament</h1>
            <p className="text-gray-600 break-words">Troba experts per a consultoria especialitzada</p>
          </div>
          {user?.role === 'colaborador' && (
            <Button className="bg-primary hover:bg-primary/90 flex-shrink-0" asChild>
              <Link to="/colaborador/asesorias/create">
                <HelpCircle className="h-4 w-4 mr-2" />
                Oferir Consultoría
              </Link>
            </Button>
          )}
        </div>

        { /* Search, Filters and View Controls */}
        <div className="flex flex-col lg:flex-row gap-4 overflow-hidden">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Cercar serveis de consultoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full lg:w-48 flex-shrink-0">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Totes les categories</SelectItem>
              {categories.slice(1).map((category) => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
            <SelectTrigger className="w-full lg:w-48 flex-shrink-0">
              <SelectValue placeholder="Disponibilitat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Qualsevol disponibilitat</SelectItem>
              <SelectItem value="available">Disponible ara</SelectItem>
              <SelectItem value="scheduled">Amb cita prèvia</SelectItem>
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

        { /* Services Grid/List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : advisories.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === "grid" ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {advisories.map((service) => (
              <ServiceCard key={service._id} service={service} isGrid={viewMode === "grid"} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hi ha serveis disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              Encara no s'han publicat serveis d'assessorament.
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}