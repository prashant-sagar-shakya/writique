import { Link } from "react-router-dom";
import { PenSquare } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto py-6 px-4 md:px-6 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <PenSquare className="h-5 w-5 text-muted-foreground" />
            <span>© {new Date().getFullYear()} Writique</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors"
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
