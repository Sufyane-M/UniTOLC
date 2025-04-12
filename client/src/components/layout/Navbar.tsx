import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AuthModal from "@/components/auth/AuthModal";
import { Moon, Sun, Menu } from "lucide-react";

const Navbar = () => {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determina la sezione attiva in base all'URL
  const activeSection = location.startsWith("/dashboard") ? "dashboard" :
                        location.startsWith("/practice") ? "practice" :
                        location.startsWith("/analytics") ? "analytics" :
                        location.startsWith("/resources") ? "resources" :
                        location.startsWith("/community") ? "community" :
                        "";

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const openLoginModal = () => {
    setAuthModalMode("login");
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode("register");
    setIsAuthModalOpen(true);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">TP</div>
                <span className="ml-2 text-xl font-heading font-semibold text-primary dark:text-primary-400">TolcPrep</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link href="/dashboard">
                <a className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  activeSection === "dashboard" 
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                }`}>
                  <i className="ri-dashboard-line mr-1.5"></i> Dashboard
                </a>
              </Link>
              <Link href="/practice">
                <a className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  activeSection === "practice" 
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                }`}>
                  <i className="ri-edit-line mr-1.5"></i> Pratica
                </a>
              </Link>
              <Link href="/analytics">
                <a className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  activeSection === "analytics" 
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                }`}>
                  <i className="ri-bar-chart-line mr-1.5"></i> Statistiche
                </a>
              </Link>
              <Link href="/resources">
                <a className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  activeSection === "resources" 
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                }`}>
                  <i className="ri-book-open-line mr-1.5"></i> Risorse
                </a>
              </Link>
              <Link href="/community">
                <a className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                  activeSection === "community" 
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                }`}>
                  <i className="ri-team-line mr-1.5"></i> Community
                </a>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Theme toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleDarkMode}
              className="mr-2"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            
            {isAuthenticated ? (
              <>
                {/* Premium button or badge */}
                {user?.isPremium ? (
                  <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 premium-badge dark:bg-yellow-900 dark:text-yellow-300">
                    <i className="ri-vip-crown-fill mr-1"></i>
                    Premium
                  </span>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden sm:flex ml-3 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => setLocation("/settings")}
                  >
                    <i className="ri-vip-crown-line mr-1"></i>
                    Premium
                  </Button>
                )}
                
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImage || ""} alt={user?.username || "Utente"} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div className="font-medium">{user?.fullName || user?.username}</div>
                      <div className="text-xs text-muted-foreground">{user?.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setLocation("/settings")}>
                        <i className="ri-user-settings-line mr-2"></i> Profilo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocation("/settings")}>
                        <i className="ri-settings-4-line mr-2"></i> Impostazioni
                      </DropdownMenuItem>
                      {user?.role === "admin" && (
                        <DropdownMenuItem onClick={() => setLocation("/admin")}>
                          <i className="ri-admin-line mr-2"></i> Admin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <i className="ri-logout-box-line mr-2"></i> Esci
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex ml-3 items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={openLoginModal}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  Accedi
                </Button>
                <Button
                  variant="default"
                  onClick={openRegisterModal}
                  className="bg-primary hover:bg-primary-600"
                >
                  Registrati
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden ml-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 sm:hidden">
                <div className="flex flex-col h-full py-4">
                  {isAuthenticated ? (
                    <div className="flex items-center mb-6 pb-4 border-b border-border">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.profileImage || ""} alt={user?.username || "Utente"} />
                        <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="font-medium">{user?.fullName || user?.username}</div>
                        <div className="text-xs text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 mb-6 pb-4 border-b border-border">
                      <Button onClick={openLoginModal} variant="outline" className="w-full">
                        Accedi
                      </Button>
                      <Button onClick={openRegisterModal} variant="default" className="w-full">
                        Registrati
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <Link href="/dashboard">
                      <a className={`flex items-center pl-3 pr-4 py-2 text-base ${
                        activeSection === "dashboard" 
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                          : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}>
                        <i className="ri-dashboard-line mr-2"></i> Dashboard
                      </a>
                    </Link>
                    <Link href="/practice">
                      <a className={`flex items-center pl-3 pr-4 py-2 text-base ${
                        activeSection === "practice" 
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                          : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}>
                        <i className="ri-edit-line mr-2"></i> Pratica
                      </a>
                    </Link>
                    <Link href="/analytics">
                      <a className={`flex items-center pl-3 pr-4 py-2 text-base ${
                        activeSection === "analytics" 
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                          : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}>
                        <i className="ri-bar-chart-line mr-2"></i> Statistiche
                      </a>
                    </Link>
                    <Link href="/resources">
                      <a className={`flex items-center pl-3 pr-4 py-2 text-base ${
                        activeSection === "resources" 
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                          : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}>
                        <i className="ri-book-open-line mr-2"></i> Risorse
                      </a>
                    </Link>
                    <Link href="/community">
                      <a className={`flex items-center pl-3 pr-4 py-2 text-base ${
                        activeSection === "community" 
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                          : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}>
                        <i className="ri-team-line mr-2"></i> Community
                      </a>
                    </Link>
                  </div>
                  
                  {isAuthenticated && (
                    <div className="mt-auto border-t border-border pt-4">
                      <Link href="/settings">
                        <a className="flex items-center pl-3 pr-4 py-2 text-base text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <i className="ri-settings-4-line mr-2"></i> Impostazioni
                        </a>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center pl-3 pr-4 py-2 text-base text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <i className="ri-logout-box-line mr-2"></i> Esci
                      </button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </nav>
  );
};

export default Navbar;
