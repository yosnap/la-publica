import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, UserPlus, AlertCircle, Mail, CheckCircle2 } from "lucide-react";
import apiClient from "@/api/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from 'axios';

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Les contrasenyes no coincideixen.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/auth/register', {
        firstName,
        lastName,
        username,
        email,
        password
      });

      if (response.data.success) {
        setRegisteredEmail(email);
        setSuccess(true);
        // Scroll al inicio para ver el mensaje
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const errorMessage = err.response?.data?.message || "Error en crear el compte. Intenta-ho més tard.";
        setError(errorMessage);
      } else {
        setError("S'ha produït un error inesperat.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-gray-900">Crea el teu compte</h1>
          <p className="text-gray-600 mt-2">Uneix-te a La pública per començar a connectar</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Registre</CardTitle>
            <CardDescription className="text-center">
              Completa el formulari per crear el teu perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-800 font-semibold">Compte creat amb èxit!</AlertTitle>
                  <AlertDescription className="text-green-700 space-y-2 mt-2">
                    <p>El teu compte s'ha creat correctament.</p>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-blue-50 border-blue-200">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <AlertTitle className="text-blue-800 font-semibold">Verifica el teu email</AlertTitle>
                  <AlertDescription className="text-blue-700 space-y-3 mt-2">
                    <p>
                      Hem enviat un email de verificació a <strong>{registeredEmail}</strong>
                    </p>
                    <p>
                      Si us plau, comprova la teva safata d'entrada i fes clic a l'enllaç de verificació per activar el teu compte.
                    </p>
                    <div className="bg-blue-100 border border-blue-300 rounded-md p-3 mt-3">
                      <p className="text-sm font-medium text-blue-900">Important:</p>
                      <ul className="text-sm text-blue-800 list-disc list-inside mt-1 space-y-1">
                        <li>L'enllaç de verificació és vàlid durant 24 hores</li>
                        <li>Revisa també la carpeta de correu brossa (spam)</li>
                        <li>No podràs iniciar sessió fins que verifiquis el teu email</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col gap-3 mt-6">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-[#4F8FF7] hover:bg-[#4F8FF7]/90"
                  >
                    Anar a l'inici de sessió
                  </Button>
                  <Button
                    onClick={() => {
                      setSuccess(false);
                      setRegisteredEmail("");
                      setFirstName("");
                      setLastName("");
                      setUsername("");
                      setEmail("");
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Registrar un altre compte
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error en el registre</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nom</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="El teu nom"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Cognoms</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Els teus cognoms"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Nom d'usuari</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="el_teu_usuari"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correu electrònic</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="el_teu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasenya</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Crea una contrasenya segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contrasenya</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Torna a escriure la contrasenya"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-11 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#4F8FF7] hover:bg-[#4F8FF7]/90 text-white rounded-xl font-medium"
              >
                {isLoading ? "Creant compte..." : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Crear compte
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Ja tens un compte?{" "}
                <Link to="/login" className="text-[#4F8FF7] hover:underline font-medium">
                  Inicia sessió aquí
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register; 