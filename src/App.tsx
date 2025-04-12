import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, SignedIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "@/components/theme-context";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import BlogsPage from "./pages/BlogsPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import DashboardPage from "./pages/DashboardPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import CreateBlogPage from "./pages/CreateBlogPage";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const queryClient = new QueryClient();

const AppContent = () => {
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/:blogId" element={<BlogDetailPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/dashboard"
            element={
              <SignedIn>
                <DashboardPage />
              </SignedIn>
            }
          />
          <Route
            path="/favorites"
            element={
              <SignedIn>
                <FavoritesPage />
              </SignedIn>
            }
          />
          <Route
            path="/admin"
            element={
              <SignedIn>
                <AdminPage />
              </SignedIn>
            }
          />
          <Route
            path="/create-blog"
            element={
              <SignedIn>
                <CreateBlogPage />
              </SignedIn>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </TooltipProvider>
  );
};

const ClerkProviderWithTheme = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { appliedTheme } = useTheme();
  if (!PUBLISHABLE_KEY) {
    console.error("Clerk Publishable Key is missing!");
    return <div>Configuration Error: Missing Clerk Key</div>;
  }
  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{ baseTheme: appliedTheme === "dark" ? dark : undefined }}
    >
      {children}
    </ClerkProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="writique-theme">
        <ClerkProviderWithTheme>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ClerkProviderWithTheme>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;