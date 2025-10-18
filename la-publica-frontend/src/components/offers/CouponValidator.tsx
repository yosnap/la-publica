import { useState } from "react";
import { Check, X, Tag, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { validateCoupon, type ValidateCouponResponse } from "@/api/offers";
import { toast } from "sonner";

interface CouponValidatorProps {
  offerId: string;
  className?: string;
}

export const CouponValidator = ({ offerId, className = "" }: CouponValidatorProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateCouponResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!couponCode.trim()) {
      toast.error("Introdueix un codi de cupó");
      return;
    }

    try {
      setValidating(true);
      setError(null);
      setValidationResult(null);

      const result = await validateCoupon(offerId, couponCode.toUpperCase());

      if (result.success) {
        setValidationResult(result);
        toast.success(result.message);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Error al validar el cupó";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  const handleClear = () => {
    setCouponCode("");
    setValidationResult(null);
    setError(null);
  };

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Tens un cupó de descompte?</h3>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Introdueix el codi del cupó"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={validating}
            className="flex-1"
          />
          <Button
            onClick={handleValidate}
            disabled={validating || !couponCode.trim()}
          >
            {validating ? "Validant..." : "Aplicar"}
          </Button>
          {(validationResult || error) && (
            <Button
              variant="outline"
              onClick={handleClear}
            >
              Esborrar
            </Button>
          )}
        </div>

        {/* Resultado de validación */}
        {validationResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-900">Cupó vàlid!</p>
                <p className="text-sm text-green-700">
                  Codi: <strong>{validationResult.coupon.code}</strong>
                </p>
              </div>
              <Badge className="bg-green-500 text-white text-lg px-3 py-1">
                -{validationResult.coupon.discountPercentage}%
              </Badge>
            </div>

            <div className="space-y-2 border-t border-green-200 pt-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Preu original:</span>
                <span className="text-gray-900 line-through">
                  {validationResult.pricing.originalPrice.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Descompte base ({((1 - validationResult.pricing.baseDiscountedPrice / validationResult.pricing.originalPrice) * 100).toFixed(0)}%):</span>
                <span className="text-gray-900">
                  {validationResult.pricing.baseDiscountedPrice.toFixed(2)}€
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-green-700">
                <span className="flex items-center gap-1">
                  <Percent className="h-4 w-4" />
                  Descompte adicional cupó:
                </span>
                <span>-{validationResult.pricing.couponDiscount.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-green-600 border-t border-green-200 pt-2 mt-2">
                <span>Preu final:</span>
                <span>{validationResult.pricing.finalPrice.toFixed(2)}€</span>
              </div>
              <div className="text-center bg-green-100 rounded px-2 py-1 mt-2">
                <span className="text-sm font-semibold text-green-900">
                  T'estalvies {validationResult.pricing.totalDiscount.toFixed(2)}€ ({validationResult.pricing.totalDiscountPercentage}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error de validación */}
        {error && !validationResult && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-red-500 rounded-full flex items-center justify-center">
                <X className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900">Cupó no vàlid</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Información */}
        {!validationResult && !error && (
          <p className="text-xs text-gray-500 mt-2">
            Els cupons de descompte s'apliquen sobre el preu ja descomptat de l'oferta
          </p>
        )}
      </CardContent>
    </Card>
  );
};
