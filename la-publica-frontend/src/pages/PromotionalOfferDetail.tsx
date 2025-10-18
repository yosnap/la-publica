import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Tag,
  TrendingDown,
  Eye,
  ShoppingCart,
  MapPin,
  Package,
  XCircle,
  CheckCircle,
  FileText,
  ArrowLeft,
  Share2,
  Heart,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageWrapper } from "@/components/PageWrapper";
import { useUserProfile } from "@/hooks/useUser";
import { getOfferBySlug, type Offer } from "@/api/offers";
import { toast } from "sonner";
import { getImageUrl } from "@/utils/getImageUrl";
import { CouponValidator } from "@/components/offers/CouponValidator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function PromotionalOfferDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useUserProfile();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    if (slug) {
      loadOffer();
    }
  }, [slug]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const response = await getOfferBySlug(slug!);

      if (response.success) {
        setOffer(response.offer);
        setSelectedImage(response.offer.mainImage);
      }
    } catch (error: any) {
      console.error('Error loading offer:', error);
      if (error.response?.status === 404) {
        toast.error('Oferta no trobada');
        navigate(getBackUrl());
      } else {
        toast.error('Error al carregar l\'oferta');
      }
    } finally {
      setLoading(false);
    }
  };

  // Determinar la URL de retorno según el rol y contexto del usuario
  const getBackUrl = () => {
    if (!user) return '/ofertes';

    // Si es admin, volver al listado de admin
    if (user.role === 'admin' || user.role === 'superadmin') {
      return '/admin/ofertes';
    }

    // Si es colaborador y es dueño de la oferta, volver a su listado
    if (user.role === 'colaborador' && offer) {
      const creatorId = typeof offer.createdBy === 'string' ? offer.createdBy : offer.createdBy._id;
      if (user._id === creatorId) {
        return '/colaborador/ofertes';
      }
    }

    // Por defecto, volver al listado público
    return '/ofertes';
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!offer) return 0;
    const now = new Date();
    const endDate = new Date(offer.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStockPercentage = () => {
    if (!offer) return 0;
    return (offer.remainingStock / offer.stock) * 100;
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (!offer) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Oferta no trobada</h2>
          <p className="text-gray-600 mb-4">L'oferta que cerques no existeix o ha estat eliminada.</p>
          <Button asChild>
            <Link to={getBackUrl()}>Tornar a ofertes</Link>
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const daysRemaining = getDaysRemaining();
  const stockPercentage = getStockPercentage();
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining < 0;
  const isLowStock = stockPercentage <= 20 && stockPercentage > 0;
  const isSoldOut = offer.remainingStock === 0;
  const allImages = [offer.mainImage, ...offer.gallery];

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to={getBackUrl()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tornar a ofertes
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Contenido principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galería de imágenes */}
            <Card>
              <CardContent className="p-6">
                {/* Imagen principal */}
                <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(selectedImage)}
                    alt={offer.title}
                    className="w-full h-96 object-cover"
                  />

                  {/* Badge de descuento */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-red-500 text-white font-bold text-2xl px-4 py-2">
                      -{offer.discountPercentage}%
                    </Badge>
                  </div>

                  {/* Badges de estado */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {isSoldOut && (
                      <Badge variant="destructive" className="font-semibold text-lg">
                        Esgotat
                      </Badge>
                    )}
                    {!isSoldOut && isExpiringSoon && (
                      <Badge variant="secondary" className="bg-orange-500 text-white">
                        <Clock className="h-4 w-4 mr-1" />
                        Acaba aviat
                      </Badge>
                    )}
                    {!isSoldOut && isLowStock && (
                      <Badge variant="secondary" className="bg-yellow-500 text-white">
                        Últimes places
                      </Badge>
                    )}
                    {isExpired && (
                      <Badge variant="secondary" className="bg-gray-500 text-white">
                        Caducada
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Miniaturas */}
                {allImages.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className={`rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === image
                            ? 'border-primary scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${offer.title} ${index + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Título y descripción */}
            <Card>
              <CardHeader>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{offer.title}</h1>

                {/* Info del creador */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {offer.createdBy.firstName[0]}{offer.createdBy.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {offer.createdBy.firstName} {offer.createdBy.lastName}
                    </p>
                    {offer.company && (
                      <p className="text-xs text-gray-500">{offer.company.name}</p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-700 whitespace-pre-line">{offer.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{offer.views} visualitzacions</span>
                  </div>
                  {offer.purchases > 0 && (
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-4 w-4" />
                      <span>{offer.purchases} vendes</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Publicada: {formatDate(offer.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Qué incluye */}
            {offer.included.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Què inclou aquesta oferta
                  </h2>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {offer.included.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Qué NO incluye */}
            {offer.notIncluded.length > 0 && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    Què NO inclou
                  </h2>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {offer.notIncluded.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Instrucciones de uso */}
            {offer.usageInstructions && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Instruccions d'ús
                  </h2>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">{offer.usageInstructions}</p>
                </CardContent>
              </Card>
            )}

            {/* Video (si existe) */}
            {offer.videoUrl && (
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-bold">Vídeo promocional</h2>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <iframe
                      src={offer.videoUrl.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna derecha - Sidebar */}
          <div className="space-y-6">
            {/* Precio y compra */}
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-4">
                {/* Precios */}
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-bold text-primary">
                      {offer.discountedPrice.toFixed(2)}€
                    </span>
                    <span className="text-2xl text-gray-400 line-through">
                      {offer.originalPrice.toFixed(2)}€
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    T'estalvies {(offer.originalPrice - offer.discountedPrice).toFixed(2)}€
                  </p>
                </div>

                <Separator />

                {/* Stock */}
                {!isSoldOut && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Places disponibles</span>
                      <span className="font-semibold">
                        {offer.remainingStock} de {offer.stock}
                      </span>
                    </div>
                    <Progress value={stockPercentage} className="h-3" />
                  </div>
                )}

                {/* Vigencia */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Inici:</span>
                    <span className="font-semibold">{formatDate(offer.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Fi:</span>
                    <span className="font-semibold">{formatDate(offer.endDate)}</span>
                  </div>
                  {daysRemaining > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold text-primary">
                        {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dies'} restants
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón de compra */}
                <Button
                  className="w-full h-12 text-lg"
                  size="lg"
                  disabled={isSoldOut || isExpired}
                >
                  {isSoldOut ? 'Esgotat' : isExpired ? 'Oferta caducada' : 'Comprar ara'}
                </Button>

                {/* Acciones secundarias */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Validador de cupones */}
            {user && !isSoldOut && !isExpired && (
              <CouponValidator offerId={offer._id} />
            )}

            {/* Info adicional */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Informació</h3>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Codi d'oferta</p>
                    <p className="text-gray-600">{offer.slug}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">Stock total</p>
                    <p className="text-gray-600">{offer.stock} places</p>
                  </div>
                </div>
                {offer.coupons.filter(c => c.isActive).length > 0 && (
                  <div className="flex items-start gap-2">
                    <TrendingDown className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">Cupons disponibles</p>
                      <p className="text-gray-600">
                        {offer.coupons.filter(c => c.isActive).length} cupons actius
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
