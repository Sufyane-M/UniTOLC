import { lazy, Suspense } from "react";
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
import Practice from "./pages/practice";
import Analytics from "@/pages/analytics";
import Resources from "@/pages/resources";
import Support from "@/pages/support";
import FAQ from "@/pages/faq";
import CosETolc from "@/pages/cos-e-tolc";

import Admin from "@/pages/admin";
import Settings from "@/pages/settings";
import ResetPassword from "@/pages/reset-password";
import NotFound from "@/pages/not-found";
import TopicStudy from "./pages/topic-study";
import FullSimulation from "./pages/full-simulation";
import TolcQuestionsPage from "./pages/TolcQuestionsPage";
import Results from "./pages/results";
import TestResults from "./pages/test-results";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/practice" component={Practice} />
      <Route path="/topic-study" component={TopicStudy} />
      <Route path="/full-simulation" component={FullSimulation} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/resources" component={Resources} />
      <Route path="/support" component={Support} />
      <Route path="/faq" component={FAQ} />
      <Route path="/cos-e-tolc" component={CosETolc} />

      <Route path="/results" component={Results} />
      <Route path="/test-results" component={TestResults} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/tolc-questions" component={TolcQuestionsPage} />
      <Route path="/settings" component={Settings} />
      <Route path="/reset-password" component={ResetPassword} />
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
