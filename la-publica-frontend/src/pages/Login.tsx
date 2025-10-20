import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, AlertCircle, Info, CheckCircle2, Mail } from "lucide-react";
import apiClient from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    // Verificar si hay un mensaje en los parámetros de URL
    const message = searchParams.get('message');
    if (message) {
      setInfoMessage(message);
    }

    // Verificar si viene de la verificación exitosa
    if (location.state?.verified) {
      setSuccessMessage('Email verificat correctament! Ara pots iniciar sessió.');
    }
  }, [searchParams, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);  // Limpiar errores anteriores
    setInfoMessage(null); // Limpiar mensajes informativos
    setSuccessMessage(null); // Limpiar mensajes de éxito
    setUnverifiedEmail(null); // Limpiar email no verificado

    try {
       // Recordar que nuestro backend espera un campo 'login' que puede ser email o username
      const response = await apiClient.post('/auth/login', {
        login: email,
        password: password
      });

      if (response.data && response.data.success) {
         // Guardar el token
        localStorage.setItem('authToken', response.data.token);
         // Redirigir a la página principal (home)
        navigate('/');
      } else {
         // En caso de que la API devuelva success: false pero sin un error de status
        setError(response.data.message || 'Ocurrió un error inesperado.');
      }
    } catch (err) {
       // Manejar errores de la petición (ej. 401, 500)
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const errorMessage = errorData?.message || "Error al conectar con el servidor. Inténtalo más tarde.";

        // Verificar si el error es por email no verificado
        if (errorData?.emailNotVerified) {
          setUnverifiedEmail(email);
          setUserId(errorData.userId);
        }

        setError(errorMessage);
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!userId) return;

    setResendingVerification(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Email de verificació reenviat correctament!');
        setError(null);
      } else {
        setError(data.message || 'Error al reenviar l\'email de verificació.');
      }
    } catch (error) {
      console.error('Error al reenviar verificació:', error);
      setError('Error de connexió. Si us plau, torna-ho a intentar.');
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        { /* Logo y título */}
        <div className="text-center mb-8">
          <div className="w-full max-w-lg h-64 flex items-center justify-center mx-auto mb-6">
            <img 
              src="/lapublica-logo-light.svg" 
              alt="La Pública" 
              className="h-64 w-auto object-contain dark:hidden" 
            />
            <img 
              src="/lapublica-logo-dark.svg" 
              alt="La Pública" 
              className="h-64 w-auto object-contain hidden dark:block" 
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Benvingut de nou</h1>
          <p className="text-gray-600 mt-2">Inicia sessió al teu compte de La Pública</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Iniciar Sessió</CardTitle>
            <CardDescription className="text-center">
              Introdueix les teves credencials per accedir al teu compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            {successMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Èxit</AlertTitle>
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}
            {infoMessage && (
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Informació</AlertTitle>
                <AlertDescription className="text-blue-700">{infoMessage}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error d'autenticació</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {unverifiedEmail && userId && (
              <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                <Mail className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Email no verificat</AlertTitle>
                <AlertDescription className="text-yellow-700 space-y-2">
                  <p>Has de verificar el teu email abans d'iniciar sessió. Comprova la teva safata d'entrada.</p>
                  <Button
                    onClick={handleResendVerification}
                    disabled={resendingVerification}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    {resendingVerification ? 'Reenviant...' : 'Reenviar email de verificació'}
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correu electrònic o Usuari
                </Label>
                <Input
                  id="email"
                  type="text"  // Cambiado a text para permitir usuarios
                  placeholder="el-teu@email.com o el_teu_usuari"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl border-gray-200 focus:border-[#4F8FF7] focus:ring-[#4F8FF7]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contrasenya
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="La teva contrasenya"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl border-gray-200 focus:border-[#4F8FF7] focus:ring-[#4F8FF7] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#4F8FF7] border-gray-300 rounded focus:ring-[#4F8FF7]"
                  />
                  <span className="text-gray-600">Recorda'm</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[#4F8FF7] hover:text-[#4F8FF7]/80 font-medium transition-colors"
                >
                  Has oblidat la teva contrasenya?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white rounded-xl font-medium transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Iniciant sessió...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-4 w-4" />
                    <span>Iniciar Sessió</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                No tens un compte?{" "}
                <Link
                  to="/register"
                  className="text-[#4F8FF7] hover:text-[#4F8FF7]/80 font-medium transition-colors"
                >
                  Registra't aquí
                </Link>
              </p>
            </div>

            { /* Divisor */}
            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <span className="px-4 text-sm text-gray-500">O continua amb</span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            { /* Botones de redes sociales */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>
          </CardContent>
        </Card>

        { /* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Al iniciar sesión, aceptas nuestros{" "}
            <Link to="/terms" className="text-[#4F8FF7] hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link to="/privacy" className="text-[#4F8FF7] hover:underline">
              Política de Privacidad
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
