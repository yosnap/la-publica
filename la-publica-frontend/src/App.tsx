import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import Messages from "./pages/Messages";
import Forums from "./pages/Forums";
import Companies from "./pages/Companies";
import Offers from "./pages/Offers";
import Announcements from "./pages/Announcements";
import Consulting from "./pages/Consulting";
import Links from "./pages/Links";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/auth/PrivateRoute";
import Register from "./pages/Register";
import CompleteProfile from "./pages/CompleteProfile";
import GroupCategories from "./pages/admin/GroupCategories";
import GroupDetail from "./pages/GroupDetail";
import GroupAdmin from "./pages/GroupAdmin";

const queryClient = new QueryClient();

// Componente para manejar la ruta de login
const LoginRoute = () => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  // Si el usuario ya está autenticado, lo redirigimos al dashboard
  return isAuthenticated ? <Navigate to="/" replace /> : <Login />;
}

// Componente para manejar la ruta de registro
const RegisterRoute = () => {
  const isAuthenticated = !!localStorage.getItem('authToken');
  // Si el usuario ya está autenticado, lo redirigimos al dashboard
  return isAuthenticated ? <Navigate to="/" replace /> : <Register />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gray-50">
            <Routes>
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/register" element={<RegisterRoute />} />
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="perfil" element={<Profile />} />
                  <Route path="editar-perfil" element={<CompleteProfile />} />
                  <Route path="groups" element={<Groups />} />
                  <Route path="groups/:id" element={<GroupDetail />} />
                  <Route path="groups/:id/admin" element={<GroupAdmin />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="forums" element={<Forums />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="offers" element={<Offers />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="consulting" element={<Consulting />} />
                  <Route path="links" element={<Links />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="admin/group-categories" element={<GroupCategories />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
