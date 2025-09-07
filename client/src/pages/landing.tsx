import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">ML</span>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome to MentorLens
              </h1>
              <p className="text-gray-400">
                Monitor student progress and analytics with comprehensive risk assessment tools
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                data-testid="button-login"
              >
                Sign in to Continue
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Secure authentication powered by Replit
                </p>
              </div>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
