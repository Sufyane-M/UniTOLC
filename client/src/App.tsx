import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "@/components/ui/toaster";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PremiumFeatureTeaser from "@/components/premium/PremiumFeatureTeaser";

import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Practice from "@/pages/practice";
import Analytics from "@/pages/analytics";
import Resources from "@/pages/resources";
import Community from "@/pages/community";
import Admin from "@/pages/admin";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/practice" component={Practice} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/resources" component={Resources} />
      <Route path="/community" component={Community} />
      <Route path="/admin" component={Admin} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Router />
          </main>
          <PremiumFeatureTeaser />
          <Footer />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
