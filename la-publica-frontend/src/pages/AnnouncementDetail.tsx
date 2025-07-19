import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Tag, Eye, MapPin, Phone, Mail, MessageCircle, Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageWrapper } from "@/components/PageWrapper";
import { getAnnouncementById, deleteAnnouncement, getAllAnnouncements } from "@/api/announcements";
import { useUserProfile } from "@/hooks/useUser";
import { getImageUrl } from "@/utils/getImageUrl";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function AnnouncementDetail() {
  const { slugId } = useParams<{ slugId: string }>();
  const navigate = useNavigate();
  const { user } = useUserProfile();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const { updateAnnouncementMappings, getAnnouncementIdBySlug } = useAnnouncementSlugMapping();

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!slugId) {
        navigate('/announcements');
        return;
      }

      try {
        setLoading(true);
        
        // Primer, obtenir tots els anuncis per actualitzar el mapeig
        const allAnnouncementsResponse = await getAllAnnouncements();
        if (!allAnnouncementsResponse.success) {
          navigate('/announcements');
          return;
        }
        
        updateAnnouncementMappings(allAnnouncementsResponse.data);
        
        // Obtenir l'ID de l'anunci utilitzant el slug
        const announcementId = getAnnouncementIdBySlug(slugId);
        if (!announcementId) {
          toast.error('No s\'ha trobat l\'anunci');
          navigate('/announcements');
          return;
        }
        
        const response = await getAnnouncementById(announcementId);
        if (response.success) {
          setAnnouncement(response.data);
        } else {
          toast.error('No s\'ha trobat l\'anunci');
          navigate('/announcements');
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
        toast.error('Error al carregar l\'anunci');
        navigate('/announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [slugId, navigate]);

  const handleDelete = async () => {
    if (!announcement || !window.confirm('Estàs segur que vols eliminar aquest anunci?')) {
      return;
    }

    try {
      const response = await deleteAnnouncement(announcement._id);
      if (response.success) {
        toast.success('Anunci eliminat correctament');
        navigate('/announcements');
      } else {
        toast.error('Error al eliminar l\'anunci');
      }
    } catch (error) {
      toast.error('Error al eliminar l\'anunci');
    }
  };

  const formatDate = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diff = now.getTime() - posted.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "Avui";
    if (days === 1) return "Ahir";
    if (days < 7) return `Fa ${days} dies`;
    if (days < 30) return `Fa ${Math.floor(days / 7)} setmanes`;
    return posted.toLocaleDateString('ca-ES');
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/announcements')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar als Anuncis
          </Button>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!announcement) {
    return (
      <PageWrapper>
        <div className="space-y-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/announcements')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar als Anuncis
          </Button>
          <div className="text-center py-8">
            <p className="text-gray-500">No s'ha trobat l'anunci</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isOwner = user && user._id === announcement.author._id;

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header de navegació */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/announcements')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar als Anuncis
          </Button>
          
          {isOwner && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate(`/announcements/${announcement._id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </div>
          )}
        </div>

        {/* Contingut principal */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={getImageUrl(announcement.author.profilePicture)} />
                  <AvatarFallback>
                    {announcement.author.firstName?.[0]}{announcement.author.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {announcement.title}
                  </h1>
                  <p className="text-gray-600 font-medium">
                    {announcement.author.firstName} {announcement.author.lastName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Descripció */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Descripció</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {announcement.description}
              </p>
            </div>

            {/* Preu */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Preu</h3>
              <div className="text-2xl font-bold text-primary">
                {announcement.type === "offer" 
                  ? announcement.price ? `€${announcement.price}` : 'Preu a consultar'
                  : announcement.budget 
                    ? `€${announcement.budget.min} - €${announcement.budget.max}`
                    : 'Pressupost a definir'
                }
              </div>
            </div>

            {/* Metadades */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Informació</h3>
                <div className="space-y-3">
                  {announcement.category && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Categoria:</span>
                      <Badge variant="secondary">{announcement.category.name}</Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Publicat:</span>
                    <span>{formatDate(announcement.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Visualitzacions:</span>
                    <span>{announcement.views}</span>
                  </div>
                  {announcement.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Ubicació:</span>
                      <span>
                        {typeof announcement.location === 'string' 
                          ? announcement.location 
                          : `${announcement.location.city}, ${announcement.location.country}${announcement.location.allowRemote ? ' (Remot disponible)' : ''}`
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacte */}
              {announcement.contact && !isOwner && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contacte</h3>
                  <div className="space-y-3">
                    {announcement.contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <a href={`mailto:${announcement.contact.email}`} className="text-primary hover:underline">
                          {announcement.contact.email}
                        </a>
                      </div>
                    )}
                    {announcement.contact.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <a href={`tel:${announcement.contact.phone}`} className="text-primary hover:underline">
                          {announcement.contact.phone}
                        </a>
                      </div>
                    )}
                    {announcement.contact.whatsapp && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        <a 
                          href={`https://wa.me/${announcement.contact.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          WhatsApp: {announcement.contact.whatsapp}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botons d'acció per a no propietaris */}
            {!isOwner && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-3">Interessat?</h3>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => window.open(`mailto:${announcement.contact?.email || announcement.author.firstName}`, '_blank')}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Correu
                  </Button>
                  {announcement.contact?.phone && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`tel:${announcement.contact.phone}`, '_blank')}
                      className="flex-1"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Trucar
                    </Button>
                  )}
                  {announcement.contact?.whatsapp && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`https://wa.me/${announcement.contact.whatsapp.replace(/\D/g, '')}`, '_blank')}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}