import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/firebase";
import { useState } from "react";
import { Bell } from "lucide-react"; // add this import at the top
export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async () => {
    try {
      await logout();
      console.log("Logged out successfully");
      // redirect handled in your auth state logic
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userName = user?.displayName || "User";
  const userInitials = userName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase();

  return (
   <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center space-x-8 h-16">
        
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer h-16">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ML</span>
            </div>
            <span className="text-xl font-semibold text-white">MentorLens</span>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-4 h-16">
          <Link href="/">
            <a
              className={cn(
                "flex items-center h-16 px-3 text-sm font-medium border-b-2 border-transparent",
                isActive("/") 
                  ? "text-blue-400 border-blue-400" 
                  : "text-gray-300 hover:text-white"
              )}
            >
              Dashboard
            </a>
          </Link>
          <Link href="/upload">
            <a
              className={cn(
                "flex items-center h-16 px-3 text-sm font-medium border-b-2 border-transparent",
                isActive("/upload") 
                  ? "text-blue-400 border-blue-400" 
                  : "text-gray-300 hover:text-white"
              )}
            >
              Upload
            </a>
          </Link>
          <a className="flex items-center h-16 px-3 text-sm font-medium text-gray-300 hover:text-white">
            Alerts
          </a>
          <a className="flex items-center h-16 px-3 text-sm font-medium text-gray-300 hover:text-white">
            Settings
          </a>
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center space-x-4 h-16">
        
        {/* Bell Icon */}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center justify-center text-gray-400 hover:text-white p-2 rounded-full h-10 w-10"
        >
          <Bell className="h-5 w-5" />
        </Button>

        {/* User avatar + dropdown */}
        <div className="relative h-16 flex items-center">
          <div
            className="flex items-center cursor-pointer space-x-2 h-10"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
              {userInitials}
            </div>
            <span className="text-white font-medium">{userName}</span>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-md shadow-lg py-2 z-50">
              <Link href="/profile">
                <a className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-600">
                  Profile
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  </div>
</nav>

  );
}
