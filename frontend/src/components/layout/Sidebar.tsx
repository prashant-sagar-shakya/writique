import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { SignedIn, SignOutButton } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import {
  X,
  LayoutDashboard,
  Bookmark,
  Settings,
  LogOut,
  BookOpen,
  Home,
  PenSquare,
  Shield,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminRole: boolean;
}

const sidebarLinks = [
  { href: "/", label: "Home", icon: Home, signedInOnly: false },
  { href: "/blogs", label: "Blogs", icon: BookOpen, signedInOnly: false },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    signedInOnly: true,
  },
  {
    href: "/favorites",
    label: "Favorites",
    icon: Bookmark,
    signedInOnly: true,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isAdminRole }) => {
  const location = useLocation();
  const { toast } = useToast();
  const handleSignOutComplete = () => {
    toast({ title: "Signed out" });
    onClose();
  };

  return (
    <>
      {/* Overlay for Mobile View when Sidebar is Open */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none" // Control visibility based on isOpen
          // No md:hidden here - overlay is only for when sidebar is open
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r transition-transform duration-300 ease-in-out",
          "flex flex-col",
          // Only control visibility based on isOpen state
          isOpen ? "translate-x-0" : "-translate-x-full"
          // Removed md:translate-x-0 and md:flex md:sticky
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b shrink-0">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <PenSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg whitespace-nowrap bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Writique
            </span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="grid gap-1 px-3">
            {sidebarLinks
              .filter((link) => !link.signedInOnly)
              .map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    location.pathname === link.href &&
                      "bg-muted text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" /> {link.label}
                </Link>
              ))}
            <SignedIn>
              {sidebarLinks
                .filter((link) => link.signedInOnly)
                .map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                      location.pathname === link.href &&
                        "bg-muted text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4" /> {link.label}
                  </Link>
                ))}
              {isAdminRole && (
                <Link
                  to="/admin"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                    location.pathname === "/admin" && "bg-muted text-foreground"
                  )}
                >
                  <Shield className="h-4 w-4" /> Admin
                </Link>
              )}
            </SignedIn>
          </nav>
        </ScrollArea>
        <div className="mt-auto border-t p-3">
          <SignedIn>
            <SignOutButton signOutCallback={handleSignOutComplete}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </SignOutButton>
          </SignedIn>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
