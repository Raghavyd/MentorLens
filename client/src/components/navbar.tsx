import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="flex items-center space-x-3" data-testid="logo">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">ML</span>
                  </div>
                  <span className="text-xl font-semibold text-white">MentorLens</span>
                </div>
              </Link>
            </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link href="/">
                  <a className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive("/") 
                      ? "text-blue-400 border-b-2 border-blue-400" 
                      : "text-gray-300 hover:text-white"
                  )} data-testid="link-dashboard">
                    Dashboard
                  </a>
                </Link>
                <Link href="/upload">
                  <a className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive("/upload") 
                      ? "text-blue-400 border-b-2 border-blue-400" 
                      : "text-gray-300 hover:text-white"
                  )} data-testid="link-upload">
                    Upload
                  </a>
                </Link>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" data-testid="link-alerts">
                  Alerts
                </a>
                <a href="#" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors" data-testid="link-settings">
                  Settings
                </a>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-400 hover:text-white p-2 rounded-full"
                data-testid="button-notifications"
              >
                <div className="h-6 w-6 rounded bg-gray-600"></div>
              </Button>
              <div className="ml-3 relative">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300" data-testid="text-user-email">
                    {user?.email || 'mentor@school.edu'}
                  </span>
                  <img 
                    className="h-8 w-8 rounded-full object-cover" 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                    alt="User avatar"
                    data-testid="img-user-avatar"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        await fetch('/api/logout', {
                          method: 'POST',
                          credentials: 'include'
                        });
                        window.location.reload();
                      } catch (error) {
                        console.error('Logout error:', error);
                        window.location.reload();
                      }
                    }}
                    className="text-gray-300 hover:text-white text-sm"
                    data-testid="button-logout"
                  >
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-600 p-2"
              data-testid="button-mobile-menu"
            >
              <div className="h-6 w-6 bg-gray-500 rounded"></div>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
