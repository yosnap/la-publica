import React, { useState, useEffect } from 'react';
import apiClient from '@/api/client';
import TokenDebugService from '@/utils/tokenDebug';

interface TokenInfo {
  tokenValid: boolean;
  verificationError?: string;
  expiresAt: string;
  issuedAt: string;
  currentTime: string;
  serverTimezone: string;
  timeLeft: {
    total: number;
    days: number;
    hours: number;
    minutes: number;
    expired: boolean;
  };
  user: {
    userId: string;
    email: string;
    role: string;
  };
  jwt: {
    issuer?: string;
    audience?: string;
  };
  environment: {
    nodeEnv: string;
    jwtExpiresIn: string;
  };
}

interface TokenMonitorProps {
  visible?: boolean;
  intervalSeconds?: number;
}

export const TokenMonitor: React.FC<TokenMonitorProps> = ({ 
  visible = false, 
  intervalSeconds = 30 
}) => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [localTokenInfo, setLocalTokenInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkToken = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      console.log('🔍 TokenMonitor: Checking token...');
      
      // Check local token info
      const localInfo = TokenDebugService.getTokenInfo();
      setLocalTokenInfo(localInfo);
      
      // Check server token info
      const response = await apiClient.get('/users/check-token');
      setTokenInfo(response.data.data);
      setError(null);
      setLastCheck(new Date());
      
      console.log('✅ TokenMonitor: Token check completed', response.data.data);
    } catch (err: any) {
      console.error('❌ TokenMonitor: Token check failed', err);
      setError(err.response?.data?.message || err.message || 'Unknown error');
      setTokenInfo(null);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (!visible) return;

    // Initial check
    checkToken();

    // Set up interval
    const interval = setInterval(checkToken, intervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [visible, intervalSeconds]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md text-xs font-mono z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">🔍 Token Monitor</h3>
        <button 
          onClick={checkToken} 
          disabled={isChecking}
          className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {isChecking ? '⏳' : '🔄'}
        </button>
      </div>
      
      {lastCheck && (
        <div className="text-gray-500 mb-2">
          Última verificación: {lastCheck.toLocaleTimeString()}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-300 rounded p-2 mb-2">
          <div className="text-red-700 font-bold">❌ Error:</div>
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {localTokenInfo && (
        <div className="border border-blue-200 rounded p-2 mb-2 bg-blue-50">
          <div className="font-bold text-blue-700">📱 Cliente (Local):</div>
          <div>Token: {localTokenInfo.hasToken ? '✅' : '❌'}</div>
          {localTokenInfo.hasToken && (
            <>
              <div>Válido: {localTokenInfo.isExpired ? '❌ Expirado' : '✅ Válido'}</div>
              <div>Usuario: {localTokenInfo.email}</div>
              <div>Expira: {localTokenInfo.expiryDate}</div>
              <div>Tiempo restante: {localTokenInfo.timeToExpiryFormatted}</div>
            </>
          )}
        </div>
      )}

      {tokenInfo && (
        <div className="border border-green-200 rounded p-2 bg-green-50">
          <div className="font-bold text-green-700">🖥️ Servidor:</div>
          <div>Token válido: {tokenInfo.tokenValid ? '✅' : '❌'}</div>
          {tokenInfo.verificationError && (
            <div className="text-red-600">Error: {tokenInfo.verificationError}</div>
          )}
          <div>Usuario: {tokenInfo.user.email}</div>
          <div>Rol: {tokenInfo.user.role}</div>
          <div>Emitido: {new Date(tokenInfo.issuedAt).toLocaleString()}</div>
          <div>Expira: {new Date(tokenInfo.expiresAt).toLocaleString()}</div>
          <div>
            Tiempo restante: {tokenInfo.timeLeft.expired ? '❌ Expirado' : 
              `${tokenInfo.timeLeft.days}d ${tokenInfo.timeLeft.hours}h ${tokenInfo.timeLeft.minutes}m`}
          </div>
          <div className="text-gray-600 mt-1">
            Env: {tokenInfo.environment.nodeEnv} | 
            JWT TTL: {tokenInfo.environment.jwtExpiresIn} |
            TZ: {tokenInfo.serverTimezone}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        Actualización automática cada {intervalSeconds}s
      </div>
    </div>
  );
};

// Hook para usar en desarrollo
export const useTokenMonitor = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Alt + Shift + J para toggle del monitor (JWT)
      if (e.altKey && e.shiftKey && e.key === 'J') {
        setVisible(prev => !prev);
        console.log('🔍 TokenMonitor toggled:', !visible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return { visible, setVisible };
};

export default TokenMonitor;