import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="space-y-4 text-center">
          <Link
            to="/"
            className="items-center font-bold text-xl bg-gradient-to-r from-blog-primary to-blog-secondary bg-clip-text text-transparent"
          >
            Writique
          </Link>
          <p className="text-sm text-foreground/70 items-center mx-auto">
            A platform for writers and readers to connect through beautiful
            content and ideas.
          </p>
        </div>
        {/* <Separator className="my-6" /> */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs text-foreground/70">
            &copy; {new Date().getFullYear()} Writique. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy"
              className="text-xs text-foreground/70 hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-xs text-foreground/70 hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
