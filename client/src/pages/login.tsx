import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, loginWithEmail, registerWithEmail } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Google sign-in failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    try {
      setIsLoading(true);
      if (tab === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      toast({
        title: tab === "login" ? "Login successful" : "Registration successful",
        description: `Welcome to MentorLens, ${email}!`,
      });
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
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

        {/* Tabs */}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={() => setTab("login")}
            className={tab === "login" ? "text-white border-b-2 border-blue-500 px-3 py-1" : "text-gray-400 hover:text-white px-3 py-1"}
          >
            Login
          </button>
          <button
            onClick={() => setTab("register")}
            className={tab === "register" ? "text-white border-b-2 border-blue-500 px-3 py-1" : "text-gray-400 hover:text-white px-3 py-1"}
          >
            Register
          </button>
        </div>

        <CardContent className="space-y-4 mt-4">
          {/* Email/Password Form */}
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:border-blue-500"
            />
            <Button
              onClick={handleEmailSubmit}
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg"
            >
              {isLoading ? (tab === "login" ? "Logging in..." : "Registering...") : tab === "login" ? "Login" : "Register"}
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-gray-400"> 
            <span>or</span>
          </div>

          {/* Google Sign-In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {isLoading ? "Signing in..." : "Continue with Google"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
