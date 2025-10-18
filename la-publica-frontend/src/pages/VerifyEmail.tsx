import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!token || !userId) {
      setStatus('error');
      setMessage('Enllaç de verificació invàlid. Falta el token o l\'ID d\'usuari.');
      return;
    }

    verifyEmail();
  }, [token, userId]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'El teu email ha estat verificat correctament!');

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          navigate('/login', { state: { verified: true } });
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Error al verificar l\'email.');
      }
    } catch (error) {
      console.error('Error al verificar email:', error);
      setStatus('error');
      setMessage('Error de connexió. Si us plau, torna-ho a intentar.');
    }
  };

  const handleResendVerification = async () => {
    if (!userId) return;

    setResending(true);
    setResendSuccess(false);

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
        setResendSuccess(true);
        setMessage(data.message || 'Email de verificació reenviat correctament!');
      } else {
        setMessage(data.message || 'Error al reenviar l\'email de verificació.');
      }
    } catch (error) {
      console.error('Error al reenviar verificació:', error);
      setMessage('Error de connexió. Si us plau, torna-ho a intentar.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verificant email...</CardTitle>
              <CardDescription>Si us plau, espera mentre verifiquem el teu compte.</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-600">Email verificat!</CardTitle>
              <CardDescription>El teu compte ha estat activat correctament.</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-600">Error de verificació</CardTitle>
              <CardDescription>No s'ha pogut verificar el teu email.</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {message && (
            <Alert className={status === 'success' ? 'border-green-500' : status === 'error' ? 'border-red-500' : ''}>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {status === 'success' && (
            <div className="text-center text-sm text-muted-foreground">
              Serà redirigit a la pàgina d'inici de sessió en uns moments...
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              {userId && !resendSuccess && (
                <Button
                  onClick={handleResendVerification}
                  disabled={resending}
                  className="w-full"
                  variant="outline"
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Reenviant...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Reenviar email de verificació
                    </>
                  )}
                </Button>
              )}

              {resendSuccess && (
                <Alert className="border-green-500">
                  <Mail className="h-4 w-4" />
                  <AlertDescription>
                    Email reenviat! Comprova la teva safata d'entrada.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={() => navigate('/login')}
                className="w-full"
                variant="default"
              >
                Tornar a l'inici de sessió
              </Button>
            </div>
          )}

          {status === 'success' && (
            <Button
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Continuar a l'inici de sessió
            </Button>
          )}

          {status === 'loading' && (
            <div className="text-center">
              <Link to="/login" className="text-sm text-primary hover:underline">
                Cancel·lar i tornar
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
