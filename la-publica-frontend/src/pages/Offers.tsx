import { useState, useEffect } from "react";
import { Briefcase, MapPin, Calendar, DollarSign, Grid, List, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PageWrapper } from "@/components/PageWrapper";
import { Link } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUser";
import { getJobOffers, type JobOffer } from "@/api/jobOffers";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";

export default function Offers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const { user } = useUserProfile();
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobOffers();
  }, []);

  const loadJobOffers = async () => {
    try {
      setLoading(true);
      const response = await getJobOffers({ limit: 50 });
      setJobOffers(response.data);
    } catch (error: any) {
      console.error('Error loading job offers:', error);
      if (error.response?.status === 403) {
        toast.error('No tens permisos per veure les ofertes de treball');
      } else {
        toast.error('Error al carregar les ofertes de treball');
      }
    } finally {
      setLoading(false);
    }
  };

  const OfferCard = ({ offer, isGrid }: { offer: JobOffer, isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className={`p-6 ${isGrid ? 'h-full' : ''}`}>
        <div className={`flex ${isGrid ? 'flex-col' : 'items-start'} gap-6`}>
          <div className="flex items-start gap-4 flex-1">
            <Avatar className={`${isGrid ? 'h-16 w-16' : 'h-12 w-12'} flex-shrink-0`}>
              <AvatarImage src={offer.company.logo ? getImageUrl(offer.company.logo) : undefined} />
              <AvatarFallback>
                <Briefcase className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary cursor-pointer">
                {offer.title}
              </h3>
              <p className="text-gray-600 font-medium mb-2">{offer.company.name}</p>
              <p className="text-gray-600 mb-4">{offer.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {offer.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{offer.location.city}, {offer.location.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{new Date(offer.createdAt).toLocaleDateString('ca-ES')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{offer.employmentType}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${isGrid ? 'w-full mt-4' : 'w-48 flex-shrink-0'}`}>
            <div className="mb-4">
              <div className="text-lg font-bold text-primary mb-2">
                {offer.salary.min && offer.salary.max ? 
                  `${offer.salary.min}-${offer.salary.max} ${offer.salary.currency}/${offer.salary.period}` :
                  'Salari a consultar'
                }
              </div>
              <Badge className="mb-4">{offer.category}</Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1" asChild>
                <Link to={`/ofertes/${offer._id}`}>Veure Oferta</Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1">Aplicar-se</Button>
            </div>
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ofertes de Treball</h1>
            <p className="text-gray-600">Troba oportunitats laborals en empreses verificades</p>
          </div>
          {user?.role === 'colaborador' && (
            <Button className="bg-primary hover:bg-primary/90" asChild>
              <Link to="/colaborador/ofertas/create">
                <Briefcase className="h-4 w-4 mr-2" />
                Publicar Oferta
              </Link>
            </Button>
          )}
        </div>

        { /* Search and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1">
              <Input
                placeholder="Cercar ofertes de treball..."
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

        { /* Offers Grid/List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : jobOffers.length > 0 ? (
          <div className={`grid gap-6 ${viewMode === "grid" ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {jobOffers.map((offer) => (
              <OfferCard key={offer._id} offer={offer} isGrid={viewMode === "grid"} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hi ha ofertes disponibles
            </h3>
            <p className="text-gray-600 mb-4">
              Encara no s'han publicat ofertes de treball.
            </p>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}