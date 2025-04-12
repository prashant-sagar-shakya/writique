
import { Link } from "react-router-dom";
import { 
  BookOpen, 
  ChevronLeft, 
  Heart, 
  Home, 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Settings, 
  Shield, 
  UserCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { SignedIn, SignedOut, SignOutButton, useAuth } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const isMobile = useIsMobile();
  const { userId } = useAuth();
  const { toast } = useToast();
  
  // This would come from Clerk in a real implementation
  const isAdmin = userId === "admin-user-id";

  const closeSidebar = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  // Function to handle sign out success
  const handleSignOutComplete = () => {
    toast({
      title: "Signed out successfully",
      description: "Hope to see you again soon!",
    });
  };

  if (isMobile && !open) {
    return null;
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-background border-r transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full"
      } ${!isMobile && open ? "md:sticky md:translate-x-0" : ""}`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
          <span className="font-bold text-xl bg-gradient-to-r from-blog-primary to-blog-secondary bg-clip-text text-transparent">
            Writique
          </span>
        </Link>
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
            onClick={closeSidebar}
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/blogs"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
            onClick={closeSidebar}
          >
            <BookOpen className="h-5 w-5" />
            <span>Blogs</span>
          </Link>
          
          <SignedIn>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
              onClick={closeSidebar}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/favorites"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
              onClick={closeSidebar}
            >
              <Heart className="h-5 w-5" />
              <span>Favorites</span>
            </Link>
            
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
                onClick={closeSidebar}
              >
                <Shield className="h-5 w-5" />
                <span>Admin</span>
              </Link>
            )}
            
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
              onClick={closeSidebar}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
            
            <SignOutButton signOutCallback={handleSignOutComplete}>
              <button 
                className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </SignOutButton>
          </SignedIn>
          
          <SignedOut>
            <Link
              to="/auth"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-foreground/70 hover:bg-accent hover:text-foreground transition-colors"
              onClick={closeSidebar}
            >
              <LogIn className="h-5 w-5" />
              <span>Sign In</span>
            </Link>
          </SignedOut>
        </nav>
      </ScrollArea>
    </aside>
  );
};

export default Sidebar;
