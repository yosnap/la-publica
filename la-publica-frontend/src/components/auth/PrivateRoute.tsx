import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Un componente que envuelve las rutas que requieren autenticación.
 * Verifica si existe un 'authToken' en localStorage.
 * Si el token existe, renderiza el contenido de la ruta (a través de <Outlet />).
 * Si no existe, redirige al usuario a la página de /login.
 */
const PrivateRoute: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('authToken');

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute; 