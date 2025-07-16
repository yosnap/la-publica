import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import apiClient from '@/api/client';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('Token de restablecimiento no válido');
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setError('Token de restablecimiento no válido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('Ocurrió un error. Inténtalo nuevamente.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al restablecer contraseña. Inténtalo nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          { /* Logo y título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4F8FF7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">LP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">¡Contraseña restablecida!</h1>
            <p className="text-gray-600 mt-2">Tu contraseña ha sido cambiada exitosamente</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-semibold text-center">Éxito</CardTitle>
              <CardDescription className="text-center">
                Ya puedes iniciar sesión con tu nueva contraseña
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Tu contraseña ha sido restablecida correctamente. Serás redirigido al login en unos segundos.
                </AlertDescription>
              </Alert>
              
              <div className="text-center">
                <Button asChild className="w-full h-11 bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white rounded-xl font-medium transition-colors">
                  <Link to="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Ir al login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          { /* Logo y título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4F8FF7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">LP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Enlace inválido</h1>
            <p className="text-gray-600 mt-2">El enlace de restablecimiento no es válido o ha expirado</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-semibold text-center">Enlace no válido</CardTitle>
              <CardDescription className="text-center">
                El enlace de restablecimiento ha expirado o es inválido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  El enlace de restablecimiento de contraseña no es válido o ha expirado.
                  Solicita un nuevo enlace desde la página de login.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors">
                  <Link to="/forgot-password">
                    Solicitar nuevo enlace
                  </Link>
                </Button>
                <Button asChild className="flex-1 h-11 bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white rounded-xl font-medium transition-colors">
                  <Link to="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        { /* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4F8FF7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">LP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva contraseña</h1>
          <p className="text-gray-600 mt-2">Ingresa tu nueva contraseña</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Restablecer Contraseña</CardTitle>
            <CardDescription className="text-center">
              Ingresa tu nueva contraseña para continuar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    disabled={isLoading}
                    className="h-11 rounded-xl border-gray-200 focus:border-[#4F8FF7] focus:ring-[#4F8FF7] pr-10"
                    {...register('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1 /2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    disabled={isLoading}
                    className="h-11 rounded-xl border-gray-200 focus:border-[#4F8FF7] focus:ring-[#4F8FF7] pr-10"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1 /2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white rounded-xl font-medium transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Restableciendo...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4" />
                    <span>Restablecer contraseña</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-[#4F8FF7] hover:text-[#4F8FF7]/80 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                Volver al login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;