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
import axios from 'axios';

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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        token,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        setIsSuccess(true);
        // Redirect to login after 3 seconds
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
      <div className=\"min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4\">
        <Card className=\"w-full max-w-md\">
          <CardHeader className=\"text-center\">
            <div className=\"mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center\">
              <CheckCircle className=\"w-8 h-8 text-green-600\" />
            </div>
            <CardTitle className=\"text-2xl font-bold text-gray-900\">
              ¡Contraseña restablecida!
            </CardTitle>
            <CardDescription className=\"text-gray-600\">
              Tu contraseña ha sido cambiada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className=\"space-y-6\">
            <Alert>
              <CheckCircle className=\"h-4 w-4\" />
              <AlertDescription>
                Tu contraseña ha sido restablecida correctamente. Serás redirigido al login en unos segundos.
              </AlertDescription>
            </Alert>
            
            <div className=\"text-center\">
              <Button asChild className=\"w-full\">
                <Link to=\"/login\">
                  <ArrowLeft className=\"w-4 h-4 mr-2\" />
                  Ir al login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className=\"min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4\">
        <Card className=\"w-full max-w-md\">
          <CardHeader className=\"text-center\">
            <div className=\"mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center\">
              <AlertCircle className=\"w-8 h-8 text-red-600\" />
            </div>
            <CardTitle className=\"text-2xl font-bold text-gray-900\">
              Enlace inválido
            </CardTitle>
            <CardDescription className=\"text-gray-600\">
              El enlace de restablecimiento no es válido o ha expirado
            </CardDescription>
          </CardHeader>
          <CardContent className=\"space-y-6\">
            <Alert variant=\"destructive\">
              <AlertCircle className=\"h-4 w-4\" />
              <AlertDescription>
                El enlace de restablecimiento de contraseña no es válido o ha expirado.
                Solicita un nuevo enlace desde la página de login.
              </AlertDescription>
            </Alert>
            
            <div className=\"flex flex-col sm:flex-row gap-2\">
              <Button asChild variant=\"outline\" className=\"flex-1\">
                <Link to=\"/forgot-password\">
                  Solicitar nuevo enlace
                </Link>
              </Button>
              <Button asChild variant=\"default\" className=\"flex-1\">
                <Link to=\"/login\">
                  <ArrowLeft className=\"w-4 h-4 mr-2\" />
                  Volver al login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4\">
      <Card className=\"w-full max-w-md\">
        <CardHeader className=\"text-center\">
          <div className=\"mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center\">
            <Lock className=\"w-8 h-8 text-blue-600\" />
          </div>
          <CardTitle className=\"text-2xl font-bold text-gray-900\">
            Nueva contraseña
          </CardTitle>
          <CardDescription className=\"text-gray-600\">
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className=\"space-y-4\">
            <div className=\"space-y-2\">
              <Label htmlFor=\"newPassword\">Nueva contraseña</Label>
              <div className=\"relative\">
                <Input
                  id=\"newPassword\"
                  type={showPassword ? 'text' : 'password'}
                  placeholder=\"Mínimo 6 caracteres\"
                  disabled={isLoading}
                  {...register('newPassword')}
                />
                <Button
                  type=\"button\"
                  variant=\"ghost\"
                  size=\"sm\"
                  className=\"absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent\"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className=\"h-4 w-4\" />
                  ) : (
                    <Eye className=\"h-4 w-4\" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className=\"text-sm text-red-600\">{errors.newPassword.message}</p>
              )}
            </div>

            <div className=\"space-y-2\">
              <Label htmlFor=\"confirmPassword\">Confirmar contraseña</Label>
              <div className=\"relative\">
                <Input
                  id=\"confirmPassword\"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder=\"Confirma tu nueva contraseña\"
                  disabled={isLoading}
                  {...register('confirmPassword')}
                />
                <Button
                  type=\"button\"
                  variant=\"ghost\"
                  size=\"sm\"
                  className=\"absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent\"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className=\"h-4 w-4\" />
                  ) : (
                    <Eye className=\"h-4 w-4\" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className=\"text-sm text-red-600\">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <Alert variant=\"destructive\">
                <AlertCircle className=\"h-4 w-4\" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type=\"submit\"
              className=\"w-full\"
              disabled={isLoading}
            >
              {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
            </Button>
          </form>

          <div className=\"mt-6 text-center\">
            <Link
              to=\"/login\"
              className=\"inline-flex items-center text-sm text-blue-600 hover:text-blue-500 font-medium\"
            >
              <ArrowLeft className=\"w-4 h-4 mr-1\" />
              Volver al login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;