import { useState, useEffect, createContext, useContext } from 'react';
import apiClient from '@/api/client';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  gender?: string;
  birthDate?: string;
  createdAt: string;
  role?: string;
  skills?: string[];
  workExperience?: any[];
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  followers?: string[];
  following?: string[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Hook para usar en componentes individuales cuando no hay context
export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/users/profile');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        setError('No se pudieron cargar los datos del perfil.');
      }
    } catch (err: any) {
      // El interceptor del API client ya maneja el token expirado
      // Solo establecemos el error si no es un 401 de token expirado
      const isTokenExpired = err.response?.status === 401 && 
        (err.response?.data?.message?.toLowerCase().includes('token expir') ||
         err.response?.data?.message?.toLowerCase().includes('token caducat') ||
         err.response?.data?.error === 'Token expirado');
      
      if (!isTokenExpired) {
        setError(err.response?.data?.message || 'Error al carregar el perfil.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, refetch: fetchUser };
};