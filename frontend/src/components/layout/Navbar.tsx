import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, PenSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

interface NavbarProps {
  onMenuToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-b">
      <nav className="container mx-auto h-16 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2"
            onClick={onMenuToggle}
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <Link to="/" className="flex items-center gap-2 mr-4 lg:mr-6">
            <PenSquare className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg sm:text-xl whitespace-nowrap bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Writique
            </span>
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className="hidden sm:inline-flex">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/blogs">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Blogs
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <SignedIn>
                <NavigationMenuItem>
                  <Link to="/dashboard">
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Dashboard
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/favorites" className="hidden lg:inline-flex">
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Favorites
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </SignedIn>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <SignedIn>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: { userButtonAvatarBox: "w-8 h-8 sm:w-9 sm:h-9" },
              }}
            />
          </SignedIn>
          <SignedOut>
            <Link to="/auth">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
