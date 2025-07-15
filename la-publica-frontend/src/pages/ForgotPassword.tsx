import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot`, {
        email: data.email,
      });

      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        setError('Ocurrió un error. Inténtalo nuevamente.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Error al enviar solicitud. Inténtalo nuevamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4F8FF7] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">LP</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Email enviado</h1>
            <p className="text-gray-600 mt-2">Hemos enviado las instrucciones a tu email</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-semibold text-center">Revisa tu email</CardTitle>
              <CardDescription className="text-center">
                Si el email está registrado, recibirás un enlace para restablecer tu contraseña
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Revisa tu bandeja de entrada y carpeta de spam. El enlace expirará en 1 hora.
                </AlertDescription>
              </Alert>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  ¿No recibiste el email? Revisa tu carpeta de spam o intenta nuevamente en unos minutos.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsSubmitted(false)}
                    className="flex-1 h-11 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Intentar nuevamente
                  </Button>
                  <Button asChild className="flex-1 h-11 bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white rounded-xl font-medium transition-colors">
                    <Link to="/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al login
                    </Link>
                  </Button>
                </div>
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
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4F8FF7] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">LP</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="text-gray-600 mt-2">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Recuperar Contraseña</CardTitle>
            <CardDescription className="text-center">
              Te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  disabled={isLoading}
                  className="h-11 rounded-xl border-gray-200 focus:border-[#4F8FF7] focus:ring-[#4F8FF7]"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
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
                    <span>Enviando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Enviar enlace de recuperación</span>
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

export default ForgotPassword;