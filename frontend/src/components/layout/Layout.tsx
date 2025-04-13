import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Sidebar from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { getToken } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      setIsLoadingRole(true);
      try {
        const token = await getToken();
        if (!token) {
          setIsAdminRole(false);
          return;
        }
        const response = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setIsAdminRole(userData?.role === "admin");
        } else {
          setIsAdminRole(false);
        }
      } catch (error) {
        setIsAdminRole(false);
      } finally {
        setIsLoadingRole(false);
      }
    };
    checkUserRole();
  }, [getToken]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isAdminRole={isAdminRole}
      />
      <div className="flex flex-col flex-1">
        <Navbar onMenuToggle={toggleSidebar} />
        {/* ** ADD PADDING-TOP TO <main> ** */}
        <main className="flex-1 pt-16 p-4 sm:p-6 lg:p-8">
          {isLoadingRole ? (
            <div className="flex justify-center pt-20">Loading Role...</div>
          ) : (
            children
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
