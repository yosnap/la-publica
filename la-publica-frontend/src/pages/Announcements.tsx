import { useState, useEffect } from "react";
import { Megaphone, Calendar, Tag, Eye, TrendingUp, TrendingDown, Grid, List, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageWrapper } from "@/components/PageWrapper";
import { useNavigate } from "react-router-dom";
import { getAllAnnouncements } from "@/api/announcements";
import { Skeleton } from "@/components/ui/skeleton";
import { getImageUrl } from "@/utils/getImageUrl";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/useUser";
import { useAnnouncementSlugMapping } from "@/hooks/useSlugMapping";

interface Announcement {
  _id: string;
  type: 'offer' | 'demand';
  title: string;
  description: string;
  category?: {
    _id: string;
    name: string;
  };
  price?: number;
  budget?: {
    min: number;
    max: number;
  };
  location?: string | {
    city: string;
    country: string;
    allowRemote?: boolean;
  };
  active: boolean;
  featured: boolean;
  views: number;
  contact?: {
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function Announcements() {
  const navigate = useNavigate();
  const { user } = useUserProfile();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const { updateAnnouncementMappings, getAnnouncementUrlByTitle } = useAnnouncementSlugMapping();

  // Cargar anuncios
  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAllAnnouncements();
      if (response.success) {
        setAnnouncements(response.data);
        updateAnnouncementMappings(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar los anuncios');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar anuncios
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === "all") return matchesSearch;
    if (activeFilter === "offers") return matchesSearch && announcement.type === "offer";
    if (activeFilter === "demands") return matchesSearch && announcement.type === "demand";
    return matchesSearch;
  });

  const offerAnnouncements = announcements.filter(a => a.type === "offer");
  const demandAnnouncements = announcements.filter(a => a.type === "demand");

  // Formatear fecha
  const formatDate = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diff = now.getTime() - posted.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Avui";
    if (days === 1) return "Ahir";
    if (days < 7) return `Fa ${days} dies`;
    if (days < 30) return `Fa ${Math.floor(days / 7)} setmanes`;
    return posted.toLocaleDateString('es-ES');
  };

  const AnnouncementCard = ({ announcement, isGrid }: { announcement: Announcement, isGrid: boolean }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(getAnnouncementUrlByTitle(announcement.title))}>
      <CardContent className={`p-6 ${isGrid ? 'h-full' : ''}`}>
        <div className={`flex ${isGrid ? 'flex-col' : 'items-start'} gap-6`}>
          <div className="flex items-start gap-4 flex-1">
            <Avatar className={`${isGrid ? 'h-16 w-16' : 'h-12 w-12'} flex-shrink-0`}>
              <AvatarImage src={getImageUrl(announcement.author.profilePicture)} />
              <AvatarFallback>
                {announcement.author.firstName?.[0]}{announcement.author.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-primary">
                  {announcement.title}
                </h3>
                <div className="flex items-center gap-2 ml-2">
                  {announcement.featured && (
                    <Badge className="bg-yellow-500 text-white">Destacat</Badge>
                  )}
                  <Badge className={announcement.type === "offer" ? "bg-green-500 text-white" : "bg-blue-500 text-white"}>
                    {announcement.type === "offer" ? (
                      <><TrendingUp className="h-3 w-3 mr-1" /> Oferta</>
                    ) : (
                      <><TrendingDown className="h-3 w-3 mr-1" /> Demanda</>
                    )}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-2">
                {announcement.author.firstName} {announcement.author.lastName}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {announcement.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                {announcement.category && (
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>{announcement.category.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(announcement.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{announcement.views} visualitzacions</span>
                </div>
                {announcement.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {typeof announcement.location === 'string' 
                        ? announcement.location 
                        : `${announcement.location.city}, ${announcement.location.country}`
                      }
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-lg font-bold text-primary">
                {announcement.type === "offer" 
                  ? announcement.price ? `€${announcement.price}` : 'Preu a consultar'
                  : announcement.budget 
                    ? `€${announcement.budget.min} - €${announcement.budget.max}`
                    : 'Pressupost a definir'
                }
              </div>
            </div>
          </div>
          
          {!isGrid && (
            <div className="w-48 flex-shrink-0">
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(getAnnouncementUrlByTitle(announcement.title));
                  }}
                >
                  Veure Detalls
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Anuncis</h1>
            <p className="text-gray-600 dark:text-gray-400">Ofertes i demandes de serveis d'usuaris</p>
          </div>
          {user?.role === 'user' && (
            <Button 
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate('/announcements/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Publicar Anunci
            </Button>
          )}
        </div>

        {/* Search and Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <Input
              placeholder="Cercar anuncis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Ofertes Actives</p>
                <p className="text-lg font-bold">{offerAnnouncements.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Demandes</p>
                <p className="text-lg font-bold">{demandAnnouncements.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Toggle and Filter Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs value={activeFilter} onValueChange={setActiveFilter} className="flex-1">
            <TabsList className="grid w-full grid-cols-3 max-w-md bg-white dark:bg-gray-800 border">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Tots
              </TabsTrigger>
              <TabsTrigger value="offers" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Ofertes ({offerAnnouncements.length})
              </TabsTrigger>
              <TabsTrigger value="demands" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                Demandes ({demandAnnouncements.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
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

        {/* Content */}
        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Megaphone className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No s'han trobat anuncis</p>
              {user?.role === 'user' && (
                <Button 
                  className="mt-4"
                  onClick={() => navigate('/announcements/new')}
                >
                  Publicar el primer anunci
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredAnnouncements.map((announcement) => (
              <AnnouncementCard key={announcement._id} announcement={announcement} isGrid={viewMode === "grid"} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}