import { Link } from "react-router-dom";
import { Calendar, Clock, Tag, TrendingDown, Eye, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Offer } from "@/api/offers";
import { getImageUrl } from "@/utils/getImageUrl";

interface OfferCardProps {
  offer: Offer;
  className?: string;
}

export const OfferCard = ({ offer, className = "" }: OfferCardProps) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ca-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(offer.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStockPercentage = () => {
    return (offer.remainingStock / offer.stock) * 100;
  };

  const daysRemaining = getDaysRemaining();
  const stockPercentage = getStockPercentage();
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;
  const isExpired = daysRemaining < 0;
  const isLowStock = stockPercentage <= 20 && stockPercentage > 0;
  const isSoldOut = offer.remainingStock === 0;

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <Link to={`/ofertes/${offer.slug}`}>
        {/* Imagen principal */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={getImageUrl(offer.mainImage)}
            alt={offer.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />

          {/* Badge de descuento */}
          <div className="absolute top-2 right-2">
            <Badge className="bg-red-500 text-white font-bold text-lg px-3 py-1">
              -{offer.discountPercentage}%
            </Badge>
          </div>

          {/* Badges de estado */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isSoldOut && (
              <Badge variant="destructive" className="font-semibold">
                Esgotat
              </Badge>
            )}
            {!isSoldOut && isExpiringSoon && (
              <Badge variant="secondary" className="bg-orange-500 text-white">
                <Clock className="h-3 w-3 mr-1" />
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

        <CardHeader className="pb-3">
          {/* Título */}
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
            {offer.title}
          </h3>

          {/* Empresa/Creador */}
          {offer.company && (
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              {offer.company.name}
            </p>
          )}
        </CardHeader>

        <CardContent className="pb-3">
          {/* Descripción corta */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {offer.description}
          </p>

          {/* Precios */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-primary">
              {offer.discountedPrice.toFixed(2)}€
            </span>
            <span className="text-lg text-gray-400 line-through">
              {offer.originalPrice.toFixed(2)}€
            </span>
          </div>

          {/* Barra de stock */}
          {!isSoldOut && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Places disponibles</span>
                <span className="font-semibold">
                  {offer.remainingStock} de {offer.stock}
                </span>
              </div>
              <Progress
                value={stockPercentage}
                className="h-2"
              />
            </div>
          )}

          {/* Información adicional */}
          <div className="flex flex-col gap-1 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Vàlida fins: {formatDate(offer.endDate)}</span>
            </div>
            {daysRemaining > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dies'} restants</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{offer.views} visualitzacions</span>
            </div>
            {offer.purchases > 0 && (
              <div className="flex items-center gap-1">
                <ShoppingCart className="h-3 w-3" />
                <span>{offer.purchases} vendes</span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            disabled={isSoldOut || isExpired}
          >
            {isSoldOut ? 'Esgotat' : isExpired ? 'Caducada' : 'Veure detalls'}
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
};
