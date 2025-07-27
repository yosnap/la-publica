import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Members from "./pages/Members";
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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import GroupCategories from "./pages/admin/GroupCategories";
import ForumCategories from "./pages/admin/ForumCategories";
import Categories from "./pages/admin/Categories";
import ForumModeration from "./pages/admin/ForumModeration";
import PlatformBackup from "./pages/admin/PlatformBackup";
import GranularBackup from "./pages/admin/GranularBackup";
import DataManagement from "./pages/admin/DataManagement";
import GroupDetail from "./pages/GroupDetail";
import GroupAdmin from "./pages/GroupAdmin";
import ForumDetail from "./pages/ForumDetail";
import CreateForumPost from "./pages/CreateForumPost";
import CreateForumPostGeneral from "./pages/CreateForumPostGeneral";
import ForumPostDetail from "./pages/ForumPostDetail";
import MyCompanies from "./pages/collaborator/MyCompanies";
import MyJobOffers from "./pages/collaborator/MyJobOffers";
import MyAdvisories from "./pages/collaborator/MyAdvisories";
import Admin from "./pages/Admin";
import AnnouncementForm from "./pages/AnnouncementForm";
import CompanyDetail from "./pages/CompanyDetail";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import JobOfferForm from "./pages/JobOfferForm";
import JobOfferDetail from "./pages/JobOfferDetail";
import AdvisoryForm from "./pages/AdvisoryForm";
import AdvisoryDetail from "./pages/AdvisoryDetail";
import Install from "./pages/Install";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import CreateBlog from "./pages/CreateBlog";
import UserProfile from "./pages/UserProfile";
import { TokenMonitor, useTokenMonitor } from "./components/debug/TokenMonitor";

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

const App = () => {
  const { visible } = useTokenMonitor();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
              <Routes>
              <Route path="/install" element={<Install />} />
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/register" element={<RegisterRoute />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="perfil" element={<Profile />} />
                  <Route path="editar-perfil" element={<CompleteProfile />} />
                  <Route path="usuario/:userSlug" element={<UserProfile />} />
                  <Route path="membres" element={<Members />} />
                  <Route path="groups" element={<Groups />} />
                  <Route path="groups/:id" element={<GroupDetail />} />
                  <Route path="groups/:id/admin" element={<GroupAdmin />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="forums" element={<Forums />} />
                  <Route path="forums/new-post" element={<CreateForumPostGeneral />} />
                  <Route path="forums/:id" element={<ForumDetail />} />
                  <Route path="forums/:forumId/new-post" element={<CreateForumPost />} />
                  <Route path="forums/posts/:id" element={<ForumPostDetail />} />
                  <Route path="blogs" element={<Blogs />} />
                  <Route path="blogs/new" element={<CreateBlog />} />
                  <Route path="blogs/:slug" element={<BlogDetail />} />
                  <Route path="blogs/:id/edit" element={<CreateBlog />} />
                  <Route path="companies" element={<Companies />} />
                  <Route path="empresa/:slugId" element={<CompanyDetail />} />
                  <Route path="ofertes" element={<Offers />} />
                  <Route path="announcements" element={<Announcements />} />
                  <Route path="anunci/:slugId" element={<AnnouncementDetail />} />
                  <Route path="announcements/new" element={<AnnouncementForm />} />
                  <Route path="announcements/:id/edit" element={<AnnouncementForm />} />
                  <Route path="assessorament" element={<Consulting />} />
                  <Route path="links" element={<Links />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="admin/group-categories" element={<GroupCategories />} />
                  <Route path="admin/forum-categories" element={<ForumCategories />} />
                  <Route path="admin/categories" element={<Categories />} />
                  <Route path="admin/forum-moderation" element={<ForumModeration />} />
                  <Route path="admin/platform-backup" element={<PlatformBackup />} />
                  <Route path="admin/granular-backup" element={<GranularBackup />} />
                  <Route path="admin/data-management" element={<DataManagement />} />
                  <Route path="colaborador/empresas" element={<MyCompanies />} />
                  <Route path="colaborador/ofertas" element={<MyJobOffers />} />
                  <Route path="colaborador/ofertas/create" element={<JobOfferForm />} />
                  <Route path="colaborador/ofertas/:id/edit" element={<JobOfferForm />} />
                  <Route path="colaborador/asesorias" element={<MyAdvisories />} />
                  <Route path="colaborador/asesorias/create" element={<AdvisoryForm />} />
                  <Route path="colaborador/asesorias/:id/edit" element={<AdvisoryForm />} />
                  <Route path="ofertes/:id" element={<JobOfferDetail />} />
                  <Route path="assessorament/:id" element={<AdvisoryDetail />} />
                </Route>
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <TokenMonitor visible={visible} intervalSeconds={30} />
            <Toaster />
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
