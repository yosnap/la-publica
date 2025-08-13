import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Settings, Database, User, Shield } from 'lucide-react';
import { installSystem, checkInstallationStatus } from '@/api/install';
import { useNavigate } from 'react-router-dom';

interface InstallationStatus {
  isInstalled: boolean;
  hasAdminUser: boolean;
  systemVersion: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface InstallFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
}

export default function InstallPage() {
  const [status, setStatus] = useState<InstallationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<InstallFormData>({
    email: 'admin@lapublica.cat',
    password: '',
    confirmPassword: '',
    firstName: 'Administrador',
    lastName: 'Sistema',
    username: 'admin'
  });

  const navigate = useNavigate();

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await checkInstallationStatus();
      setStatus(response.data);

      // Si ya está instalado, redirigir al login
      if (response.data.isInstalled) {
        setTimeout(() => {
          navigate('/admin');
        }, 2000);
      }
    } catch (error) {
      setError('Error verificando el estado de instalación');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleInputChange = (field: keyof InstallFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.username) {
      return 'Todos los campos son obligatorios';
    }

    if (formData.password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    if (!formData.email.includes('@')) {
      return 'Email inválido';
    }

    if (formData.username.length < 3) {
      return 'El username debe tener al menos 3 caracteres';
    }

    return null;
  };

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setInstalling(true);
      setError(null);

      const response = await installSystem({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username
      });

      setSuccess(true);

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/admin', {
          state: {
            message: 'Sistema instalado exitosamente. Inicia sesión con tus credenciales.',
            email: formData.email
          }
        });
      }, 3000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error
        ? error.message
        : (error as ApiError)?.response?.data?.message || 'Error durante la instalación';
      setError(errorMessage);
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-3 text-lg">Verificando sistema...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status?.isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Sistema Instalado</h2>
            <p className="text-green-600 mb-4">
              La Pública ya está configurado y listo para usar.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Redirigiendo al panel de administración...
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Database className="h-4 w-4" />
              <span>Versión {status.systemVersion}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">¡Instalación Exitosa!</h2>
            <p className="text-green-600 mb-4">
              El sistema ha sido configurado correctamente.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Redirigiendo al panel de administración...
            </p>
            <Alert className="border-green-200 bg-green-50">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-green-700">
                <strong>Importante:</strong> La ruta de instalación se ha deshabilitado automáticamente por seguridad.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-32 h-16 flex items-center justify-center">
              <img 
                src="/lapublica-logo-01.jpg" 
                alt="La Pública" 
                className="h-16 w-auto object-contain dark:hidden" 
              />
              <img 
                src="/lapublica-logo-dark.png" 
                alt="La Pública" 
                className="h-16 w-auto object-contain hidden dark:block" 
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Instalación de La Pública
          </h1>
          <p className="text-xl text-gray-600">
            Configura tu plataforma de red social empresarial
          </p>
        </div>

        {/* Installation Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Crear Usuario Administrador</span>
            </CardTitle>
            <CardDescription>
              Este será el primer usuario administrador del sistema. Podrás crear más usuarios desde el panel de administración.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleInstall} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Tu nombre"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Tus apellidos"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="admin@lapublica.cat"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="admin"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Repite la contraseña"
                    required
                  />
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Database className="h-4 w-4" />
                <AlertDescription className="text-blue-700">
                  La instalación creará automáticamente:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Usuario administrador con las credenciales especificadas</li>
                    <li>Categorías por defecto para el sistema</li>
                    <li>Configuración inicial de la plataforma</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full h-12 text-lg"
                disabled={installing}
              >
                {installing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Instalando Sistema...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Instalar La Pública
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Una vez completada la instalación, esta página será inaccesible por seguridad.</p>
        </div>
      </div>
    </div>
  );
}
