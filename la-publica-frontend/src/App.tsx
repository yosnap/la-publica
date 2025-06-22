
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="groups" element={<Groups />} />
                <Route path="messages" element={<Messages />} />
                <Route path="forums" element={<Forums />} />
                <Route path="companies" element={<Companies />} />
                <Route path="offers" element={<Offers />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="consulting" element={<Consulting />} />
                <Route path="links" element={<Links />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
