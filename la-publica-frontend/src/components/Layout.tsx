
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopNavigation } from "./TopNavigation";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Layout = () => {
  return (
    <>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <TopNavigation />
        <main className="flex-1 overflow-auto">
          <div className="md:hidden p-4">
            <SidebarTrigger className="p-2" />
          </div>
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;
