import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, handleRedirectResult } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Handle redirect result when user comes back from Google
    const checkRedirectResult = async () => {
      try {
        const result = await handleRedirectResult();
        if (result?.user) {
          toast({
            title: "Login successful",
            description: `Welcome to MentorLens, ${result.user.displayName || result.user.email}!`,
          });
        }
      } catch (error: any) {
        console.error('Firebase redirect error:', error);
        toast({
          title: "Login failed",
          description: error.message || "Authentication failed. Please try again.",
          variant: "destructive",
        });
      }
    };

    checkRedirectResult();
  }, [toast]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('Firebase login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Failed to initiate Google sign-in",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">ML</span>
          </div>
          <CardTitle className="text-2xl font-bold text-white">MentorLens</CardTitle>
          <p className="text-gray-400">Student analytics and risk assessment platform</p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Sign in with your Google account to access your dashboard
            </p>
            
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3"
              data-testid="button-google-signin"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
              </div>
              <p className="text-xs text-gray-400">Risk Assessment</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
              </div>
              <p className="text-xs text-gray-400">CSV Upload</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
              </div>
              <p className="text-xs text-gray-400">Trend Analysis</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Secure authentication powered by Google Firebase
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}