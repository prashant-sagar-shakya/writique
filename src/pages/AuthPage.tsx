
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { SignIn, SignUp, useAuth } from "@clerk/clerk-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const { isSignedIn } = useAuth();
  
  useEffect(() => {
    document.title = "Writique - Authentication";
  }, []);
  
  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex items-center justify-center py-10">
      <div className="w-full max-w-md">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-blog-primary to-blog-secondary bg-clip-text text-transparent">
              Writique
            </span>
          </h1>
          <p className="text-foreground/70 mt-2">
            {activeTab === "signin" 
              ? "Welcome back! Sign in to continue." 
              : "Join our community of writers and readers."}
          </p>
        </div> */}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
           */}
          <TabsContent value="signin" className="mt-4">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-blog-primary hover:bg-blog-secondary text-white",
                  footerActionLink: 
                    "text-blog-primary hover:text-blog-secondary"
                }
              }}
            />
          </TabsContent>
          
          <TabsContent value="signup" className="mt-4">
            <SignUp 
              appearance={{
                elements: {
                  formButtonPrimary: 
                    "bg-blog-primary hover:bg-blog-secondary text-white",
                  footerActionLink: 
                    "text-blog-primary hover:text-blog-secondary"
                }
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
