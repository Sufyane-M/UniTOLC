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
                        location.startsWith("/cos-e-tolc") ? "cos-e-tolc" :
                        location.startsWith("/faq") ? "faq" :
                        location.startsWith("/support") ? "support" :
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
    <nav className="bg-white/25 dark:bg-gray-900/25 backdrop-blur-lg border-b border-white/20 dark:border-gray-700/30 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                UT
              </div>
              <span className="ml-2 text-xl font-heading font-semibold text-primary dark:text-primary-400">UniTOLC</span>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden sm:flex sm:items-center mx-auto flex-1 justify-center">
              {!isAuthenticated ? (
                <div className="flex space-x-6">
                  <Link 
                    href="/cos-e-tolc" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      activeSection === "cos-e-tolc" 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <i className="ri-information-line mr-1.5"></i> Cos'è il TOLC
                  </Link>
                  <Link 
                    href="/faq" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      activeSection === "faq" 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <i className="ri-question-line mr-1.5"></i> FAQ
                  </Link>

                </div>
              ) : (
                <div className="flex space-x-6">
                  <Link 
                    href="/dashboard" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      activeSection === "dashboard" 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <i className="ri-dashboard-line mr-1.5"></i> Dashboard
                  </Link>
                  <Link 
                    href="/practice" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      activeSection === "practice" 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <i className="ri-edit-line mr-1.5"></i> Pratica
                  </Link>
                  <Link 
                    href="/analytics" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      activeSection === "analytics" 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <i className="ri-bar-chart-line mr-1.5"></i> Statistiche
                  </Link>
                  <Link 
                    href="/cos-e-tolc" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      activeSection === "cos-e-tolc" 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <i className="ri-information-line mr-1.5"></i> Cos'è il TOLC
                  </Link>
                  <Link 
                    href="/faq" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      activeSection === "faq" 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <i className="ri-question-line mr-1.5"></i> FAQ
                  </Link>
                  <Link 
                    href="/support" 
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      activeSection === "support" 
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" 
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent"
                    }`}
                  >
                    <i className="ri-customer-service-line mr-1.5"></i> Supporto
                  </Link>
                </div>
              )}
          </div>
          
          <div className="flex items-center ml-auto">
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
                  <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-yellow-500 text-white dark:from-amber-600 dark:to-yellow-700 premium-badge">
                    <i className="ri-vip-crown-fill mr-1.5"></i>
                    Premium
                  </span>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="hidden sm:flex ml-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-white dark:from-amber-600 dark:to-yellow-700 dark:hover:from-amber-700 dark:hover:to-yellow-800"
                    onClick={() => setLocation("/settings")}
                  >
                    <i className="ri-vip-crown-line mr-1.5"></i>
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
                        <i className="ri-user-settings-line mr-2"></i> Il mio Profilo
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
                      <i className="ri-logout-box-line mr-2"></i> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-200 dark:bg-gray-700">
                        <i className="ri-user-line text-gray-600 dark:text-gray-400"></i>
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuItem onClick={openLoginModal}>
                    <i className="ri-login-box-line mr-2"></i> Accedi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={openRegisterModal}>
                    <i className="ri-user-add-line mr-2"></i> Registrati
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                      <Button onClick={openLoginModal} variant="outline" className="w-full text-foreground dark:text-foreground">
                        Accedi
                      </Button>
                      <Button onClick={openRegisterModal} variant="default" className="w-full text-white dark:text-white">
                        Registrati
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    {!isAuthenticated ? (
                      <>
                        <Link 
                          href="/cos-e-tolc"
                          className={`flex items-center pl-3 pr-4 py-2 text-base ${
                            activeSection === "cos-e-tolc" 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                              : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <i className="ri-information-line mr-2"></i> Cos'è il TOLC
                        </Link>
                        <Link 
                          href="/faq"
                          className={`flex items-center pl-3 pr-4 py-2 text-base ${
                            activeSection === "faq" 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                              : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <i className="ri-question-line mr-2"></i> FAQ
                        </Link>

                      </>
                    ) : (
                      <>
                        <Link 
                          href="/dashboard"
                          className={`flex items-center pl-3 pr-4 py-2 text-base ${
                            activeSection === "dashboard" 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                              : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <i className="ri-dashboard-line mr-2"></i> Dashboard
                        </Link>
                        <Link 
                          href="/practice"
                          className={`flex items-center pl-3 pr-4 py-2 text-base ${
                            activeSection === "practice" 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                              : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <i className="ri-edit-line mr-2"></i> Pratica
                        </Link>
                        <Link 
                          href="/analytics"
                          className={`flex items-center pl-3 pr-4 py-2 text-base ${
                            activeSection === "analytics" 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                              : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <i className="ri-bar-chart-line mr-2"></i> Statistiche
                        </Link>
                        <Link 
                          href="/cos-e-tolc"
                          className={`flex items-center pl-3 pr-4 py-2 text-base ${
                            activeSection === "cos-e-tolc" 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                              : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <i className="ri-information-line mr-2"></i> Cos'è il TOLC
                        </Link>
                        <Link 
                          href="/faq"
                          className={`flex items-center pl-3 pr-4 py-2 text-base ${
                            activeSection === "faq" 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                              : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <i className="ri-question-line mr-2"></i> FAQ
                        </Link>
                        <Link 
                          href="/support"
                          className={`flex items-center pl-3 pr-4 py-2 text-base ${
                            activeSection === "support" 
                              ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500" 
                              : "border-l-4 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                        >
                          <i className="ri-customer-service-line mr-2"></i> Supporto
                        </Link>
                      </>
                    )}
                  </div>
                  
                  {isAuthenticated && (
                    <div className="mt-auto border-t border-border pt-4">
                      <Link 
                        href="/settings"
                        className="flex items-center pl-3 pr-4 py-2 text-base text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <i className="ri-settings-4-line mr-2"></i> Impostazioni
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left flex items-center pl-3 pr-4 py-2 text-base text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <i className="ri-logout-box-line mr-2"></i> Logout
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
