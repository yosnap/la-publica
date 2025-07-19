import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building,
  Calendar,
  Euro,
  Clock,
  Users,
  HelpCircle,
  CheckCircle,
  Star,
  Share2,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  AlertTriangle,
  Edit,
  Video,
  MessageSquare,
  Languages,
  Award,
  BookOpen,
  Timer
} from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";
import { getAdvisoryById } from "@/api/advisories";
import { useUserProfile } from "@/hooks/useUser";

interface Advisory {
  _id: string;
  title: string;
  description: string;
  image?: string;
  company: {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    verified: { status: 'verified' | 'pending' | 'rejected' };
    website?: string;
    email?: string;
    phone?: string;
    owner: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  category: string;
  subcategory?: string;
  expertise: string[];
  pricing: {
    type: 'free' | 'paid' | 'consultation';
    hourlyRate?: number;
    sessionRate?: number;
    currency: string;
    sessionDuration: number;
  };
  availability: {
    schedule: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      available: boolean;
    }[];
    timezone: string;
    advanceBooking: number;
  };
  format: 'video' | 'phone' | 'in-person' | 'email' | 'chat';
  languages: string[];
  requirements?: string[];
  isActive: boolean;
  bookings: string[];
  reviews: {
    user: string;
    rating: number;
    comment?: string;
    createdAt: string;
  }[];
  stats: {
    totalBookings: number;
    averageRating: number;
    completedSessions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdvisoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserProfile();
  
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    if (id) {
      loadAdvisory();
    }
  }, [id]);

  const loadAdvisory = async () => {
    try {
      setLoading(true);
      const response = await getAdvisoryById(id!);
      setAdvisory(response.data);
    } catch (error: any) {
      console.error('Error loading advisory:', error);
      if (error.response?.status === 404) {
        toast.error('Assessorament no trobat');
      } else {
        toast.error('Error al carregar l\'assessorament');
      }
      navigate('/assessorament');
    } finally {
      setLoading(false);
    }
  };

  const formatFormat = (format: string) => {
    const formats = {
      'video': 'Videoconferència',
      'phone': 'Telèfon',
      'in-person': 'Presencial',
      'email': 'Email',
      'chat': 'Chat'
    };
    return formats[format as keyof typeof formats] || format;
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

  const getDayName = (dayOfWeek: number) => {
    const days = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    return time.replace(':', ':');
  };

  const getFormatIcon = (format: string) => {
    const icons = {
      'video': Video,
      'phone': Phone,
      'in-person': Users,
      'email': Mail,
      'chat': MessageSquare
    };
    const Icon = icons[format as keyof typeof icons];
    return Icon ? <Icon className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />;
  };

  const canEdit = () => {
    // Solo mostrar botón si tenemos todos los datos necesarios y el usuario es el propietario
    if (!user || user.role !== 'colaborador' || !advisory?.company?.owner) {
      return false;
    }
    
    // Convertir ambos IDs a string para asegurar comparación correcta
    const currentUserId = String(user._id);
    const ownerId = String(advisory.company.owner._id);
    
    return currentUserId === ownerId;
  };

  const canBook = () => {
    return user?.role === 'user' && advisory?.isActive;
  };

  const handleBook = async () => {
    if (!user) {
      toast.error('Has d\'iniciar sessió per reservar assessoraments');
      navigate('/login');
      return;
    }

    // TODO: Implement booking logic
    setBooking(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Sol·licitud de reserva enviada correctament');
    } catch (error) {
      toast.error('Error al enviar la sol·licitud');
    } finally {
      setBooking(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: advisory?.title,
          text: `Mira aquest servei d'assessorament: ${advisory?.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Enllaç copiat al portaretalls');
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!advisory) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessorament no trobat</h2>
          <p className="text-gray-600 mb-4">L'assessorament que cerques no existeix o ha estat eliminat.</p>
          <Button onClick={() => navigate('/assessorament')}>
            Veure Tots els Assessoraments
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/assessorament')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar a Assessoraments
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            {canEdit() && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/colaborador/asesorias/${advisory!._id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Advisory Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Advisory Header */}
            <Card>
              <CardContent className="p-6">
                
                {/* Featured Image */}
                {advisory.image && (
                  <div className="mb-6">
                    <img
                      src={getImageUrl(advisory.image)}
                      alt={advisory.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Title and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {advisory.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={advisory.isActive ? "default" : "secondary"}>
                        {advisory.isActive ? "Disponible" : "No Disponible"}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getFormatIcon(advisory.format)}
                        {formatFormat(advisory.format)}
                      </Badge>
                      {advisory.subcategory && (
                        <Badge variant="outline">
                          {advisory.subcategory}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={advisory.company.logo ? getImageUrl(advisory.company.logo) : undefined} />
                    <AvatarFallback>
                      {advisory.company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/companies/${advisory.company._id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {advisory.company.name}
                      </Link>
                      {advisory.company.verified.status === 'verified' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Creat el {new Date(advisory.createdAt).toLocaleDateString('ca-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Euro className="h-4 w-4" />
                    <span>{formatPricing(advisory.pricing)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Timer className="h-4 w-4" />
                    <span>{advisory.pricing.sessionDuration} minuts per sessió</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Reserva amb {advisory.availability.advanceBooking}h d'antelació</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="h-4 w-4" />
                    <span>
                      {advisory.stats.averageRating > 0 ? (
                        `${advisory.stats.averageRating.toFixed(1)}/5 (${advisory.reviews.length} valoracions)`
                      ) : (
                        'Sense valoracions'
                      )}
                    </span>
                  </div>
                </div>

                {/* Book Button */}
                {canBook() && (
                  <Button
                    onClick={handleBook}
                    disabled={booking}
                    className="w-full mb-4"
                    size="lg"
                  >
                    {booking ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviant Sol·licitud...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Sol·licitar Assessorament
                      </>
                    )}
                  </Button>
                )}

                {/* Warning for inactive services */}
                {!advisory.isActive && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Aquest servei no està disponible actualment. Contacta amb l'empresa per més informació.
                    </AlertDescription>
                  </Alert>
                )}

              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripció del Servei</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {advisory.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Expertise Areas */}
            {advisory.expertise.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Àrees d'Expertesa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {advisory.expertise.map((exp, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700">
                        {exp}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {advisory.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Idiomes Disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {advisory.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {advisory.requirements && advisory.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Requisits per als Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {advisory.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {advisory.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Valoracions dels Clients
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {advisory.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString('ca-ES')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))}
                  {advisory.reviews.length > 3 && (
                    <p className="text-sm text-gray-600 text-center">
                      I {advisory.reviews.length - 3} valoracions més...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column - Company & Availability Sidebar */}
          <div className="space-y-6">
            
            {/* Company Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Sobre l'Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-3">
                    <AvatarImage src={advisory.company.logo ? getImageUrl(advisory.company.logo) : undefined} />
                    <AvatarFallback className="text-lg">
                      {advisory.company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{advisory.company.name}</h3>
                    {advisory.company.verified.status === 'verified' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>

                {advisory.company.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {advisory.company.description}
                  </p>
                )}

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  {advisory.company.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={advisory.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Web corporativa
                        <ExternalLink className="h-3 w-3 ml-1 inline" />
                      </a>
                    </div>
                  )}
                  {advisory.company.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${advisory.company.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {advisory.company.email}
                      </a>
                    </div>
                  )}
                  {advisory.company.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${advisory.company.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {advisory.company.phone}
                      </a>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/companies/${advisory.company._id}`}>
                    <Building className="h-4 w-4 mr-2" />
                    Veure Perfil Complet
                  </Link>
                </Button>

              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Disponibilitat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600 mb-3">
                  Zona horària: {advisory.availability.timezone}
                </div>
                
                {advisory.availability.schedule.filter(s => s.available).length > 0 ? (
                  <div className="space-y-2">
                    {advisory.availability.schedule
                      .filter(s => s.available)
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="font-medium">
                            {getDayName(schedule.dayOfWeek)}
                          </span>
                          <span className="text-gray-600">
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Horari a consultar</p>
                )}

                <Separator />

                <div className="text-xs text-gray-500">
                  <p>📅 Reserva amb {advisory.availability.advanceBooking} hores d'antelació</p>
                  <p>⏱️ Durada: {advisory.pricing.sessionDuration} minuts</p>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Estadístiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sessions completades:</span>
                  <span className="font-semibold">{advisory.stats.completedSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Reserves totals:</span>
                  <span className="font-semibold">{advisory.stats.totalBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Valoració mitjana:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">
                      {advisory.stats.averageRating > 0 ? advisory.stats.averageRating.toFixed(1) : '-'}
                    </span>
                    {advisory.stats.averageRating > 0 && (
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Services */}
            <Card>
              <CardHeader>
                <CardTitle>Serveis Similars</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Descobreix més serveis d'assessorament en la mateixa categoria.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/assessorament?category=${advisory.category}`}>
                    Veure Serveis Similars
                  </Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </PageWrapper>
  );
}