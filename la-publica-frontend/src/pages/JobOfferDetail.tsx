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
  MapPin,
  Calendar,
  Euro,
  Clock,
  Users,
  Briefcase,
  CheckCircle,
  Star,
  Share2,
  Heart,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  AlertTriangle,
  Edit
} from "lucide-react";
import { PageWrapper } from "@/components/PageWrapper";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";
import { getJobOfferById } from "@/api/jobOffers";
import { useUserProfile } from "@/hooks/useUser";

interface JobOffer {
  _id: string;
  title: string;
  description: string;
  image?: string;
  company: {
    _id: string;
    name: string;
    slug?: string;
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
  location: {
    city: string;
    country: string;
    isRemote: boolean;
  };
  employmentType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  experienceLevel: 'entry' | 'junior' | 'mid' | 'senior' | 'lead';
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hour' | 'day' | 'month' | 'year';
  };
  requirements: string[];
  benefits: string[];
  skills: string[];
  category: string;
  applicationDeadline?: string;
  applications: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function JobOfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserProfile();

  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      loadJobOffer();
    }
  }, [id]);

  const loadJobOffer = async () => {
    try {
      setLoading(true);
      const response = await getJobOfferById(id!);
      setJobOffer(response.data);
    } catch (error: any) {
      console.error('Error loading job offer:', error);
      if (error.response?.status === 404) {
        toast.error('Oferta de treball no trobada');
      } else {
        toast.error('Error al carregar l\'oferta de treball');
      }
      navigate('/ofertes');
    } finally {
      setLoading(false);
    }
  };

  const formatEmploymentType = (type: string) => {
    const types = {
      'full-time': 'Temps Complet',
      'part-time': 'Temps Parcial',
      'contract': 'Contracte',
      'internship': 'Pràctiques',
      'freelance': 'Freelance'
    };
    return types[type as keyof typeof types] || type;
  };

  const formatExperienceLevel = (level: string) => {
    const levels = {
      'entry': 'Sense Experiència',
      'junior': 'Junior (1-2 anys)',
      'mid': 'Intermedi (3-5 anys)',
      'senior': 'Senior (5+ anys)',
      'lead': 'Lead/Manager'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const formatSalary = (salary?: JobOffer['salary']) => {
    if (!salary || (!salary.min && !salary.max)) return null;

    const periods = {
      'hour': 'hora',
      'day': 'dia',
      'month': 'mes',
      'year': 'any'
    };

    let salaryText = '';
    if (salary.min && salary.max) {
      salaryText = `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    } else if (salary.min) {
      salaryText = `A partir de ${salary.min.toLocaleString()}`;
    } else if (salary.max) {
      salaryText = `Fins a ${salary.max.toLocaleString()}`;
    }

    return `${salaryText} ${salary.currency} per ${periods[salary.period]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isDeadlinePassed = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const canEdit = () => {
    // Solo mostrar botón si tenemos todos los datos necesarios y el usuario es el propietario
    if (!user || user.role !== 'colaborador' || !jobOffer?.company?.owner) {
      return false;
    }

    // Convertir ambos IDs a string para asegurar comparación correcta
    const currentUserId = String(user._id);
    const ownerId = String(jobOffer.company.owner._id);

    return currentUserId === ownerId;
  };

  const canApply = () => {
    return user?.role === 'user' && jobOffer?.isActive && !isDeadlinePassed(jobOffer?.applicationDeadline);
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Has d\'iniciar sessió per aplicar a ofertes');
      navigate('/login');
      return;
    }

    // TODO: Implement application logic
    setApplying(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Candidatura enviada correctament');
    } catch (error) {
      toast.error('Error al enviar la candidatura');
    } finally {
      setApplying(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: jobOffer?.title,
          text: `Mira aquesta oferta de treball: ${jobOffer?.title}`,
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

  if (!jobOffer) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oferta no trobada</h2>
          <p className="text-gray-600 mb-4">L'oferta de treball que cerques no existeix o ha estat eliminada.</p>
          <Button onClick={() => navigate('/ofertes')}>
            Veure Totes les Ofertes
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
            onClick={() => navigate('/ofertes')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tornar a Ofertes
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Compartir
            </Button>
            {canEdit() && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/colaborador/ofertas/${jobOffer!._id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Job Header */}
            <Card>
              <CardContent className="p-6">

                {/* Featured Image */}
                {jobOffer.image && (
                  <div className="mb-6">
                    <img
                      src={getImageUrl(jobOffer.image)}
                      alt={jobOffer.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Title and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {jobOffer.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={jobOffer.isActive ? "default" : "secondary"}>
                        {jobOffer.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      <Badge variant="outline">
                        {formatEmploymentType(jobOffer.employmentType)}
                      </Badge>
                      <Badge variant="outline">
                        {formatExperienceLevel(jobOffer.experienceLevel)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Company Info */}
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={jobOffer.company.logo ? getImageUrl(jobOffer.company.logo) : undefined} />
                    <AvatarFallback>
                      {jobOffer.company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Link
                        to={jobOffer.company.slug ? `/empresa/${jobOffer.company.slug}` : '#'}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {jobOffer.company.name}
                      </Link>
                      {jobOffer.company.verified.status === 'verified' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Publicat el {formatDate(jobOffer.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Key Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {jobOffer.location.city}, {jobOffer.location.country}
                      {jobOffer.location.isRemote && " (Remot disponible)"}
                    </span>
                  </div>
                  {jobOffer.salary && formatSalary(jobOffer.salary) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Euro className="h-4 w-4" />
                      <span>{formatSalary(jobOffer.salary)}</span>
                    </div>
                  )}
                  {jobOffer.applicationDeadline && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Candidatures fins el {formatDate(jobOffer.applicationDeadline)}
                        {isDeadlinePassed(jobOffer.applicationDeadline) && (
                          <Badge variant="destructive" className="ml-2">Caducada</Badge>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{jobOffer.applications.length} candidatures</span>
                  </div>
                </div>

                {/* Apply Button */}
                {canApply() && (
                  <Button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full mb-4"
                    size="lg"
                  >
                    {applying ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviant...
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-4 w-4 mr-2" />
                        Aplicar a aquesta Oferta
                      </>
                    )}
                  </Button>
                )}

                {/* Warning for expired offers */}
                {isDeadlinePassed(jobOffer.applicationDeadline) && (
                  <Alert className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Aquesta oferta ha caducat. Ja no es poden enviar candidatures.
                    </AlertDescription>
                  </Alert>
                )}

              </CardContent>
            </Card>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descripció de l'Oferta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {jobOffer.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {jobOffer.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {jobOffer.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {jobOffer.benefits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Beneficis</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {jobOffer.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Star className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {jobOffer.skills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Habilitats Requerides</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {jobOffer.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column - Company Sidebar */}
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
                    <AvatarImage src={jobOffer.company.logo ? getImageUrl(jobOffer.company.logo) : undefined} />
                    <AvatarFallback className="text-lg">
                      {jobOffer.company.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{jobOffer.company.name}</h3>
                    {jobOffer.company.verified.status === 'verified' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                </div>

                {jobOffer.company.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {jobOffer.company.description}
                  </p>
                )}

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                  {jobOffer.company.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <a
                        href={jobOffer.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Web corporativa
                        <ExternalLink className="h-3 w-3 ml-1 inline" />
                      </a>
                    </div>
                  )}
                  {jobOffer.company.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${jobOffer.company.email}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {jobOffer.company.email}
                      </a>
                    </div>
                  )}
                  {jobOffer.company.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <a
                        href={`tel:${jobOffer.company.phone}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {jobOffer.company.phone}
                      </a>
                    </div>
                  )}
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <Link to={jobOffer.company.slug ? `/empresa/${jobOffer.company.slug}` : '#'}>
                    <Building className="h-4 w-4 mr-2" />
                    Veure Perfil Complet
                  </Link>
                </Button>

              </CardContent>
            </Card>

            {/* Similar Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Ofertes Similars</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">
                  Descobreix més ofertes en la mateixa categoria.
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/ofertes?category=${jobOffer.category}`}>
                    Veure Ofertes Similars
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
