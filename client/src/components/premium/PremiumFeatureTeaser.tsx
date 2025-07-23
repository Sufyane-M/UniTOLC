import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Crown, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

const PremiumFeatureTeaser = () => {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Non mostrare il teaser se l'utente non è autenticato o è già premium
  if (!isAuthenticated || (user && user.isPremium)) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-lg border-b-4 border-amber-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-6 w-6 text-amber-200 animate-pulse" />
              <h2 className="text-2xl md:text-3xl font-heading font-bold tracking-tight">
                Sblocca tutte le funzionalità Premium
              </h2>
            </div>
            <p className="text-amber-50 text-lg max-w-2xl leading-relaxed">
              Ottieni accesso illimitato a tutti i test, analisi dettagliate, spiegazioni approfondite e piani di studio personalizzati.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <span className="text-white font-bold text-lg">
                Solo €5/mese
              </span>
            </div>
            <Button 
              onClick={() => setLocation("/settings?tab=premium")}
              size="lg"
              className="bg-white text-amber-700 hover:bg-amber-50 hover:scale-105 transition-all duration-200 shadow-lg font-semibold px-8 py-3 text-lg"
            >
              <Crown className="mr-2 h-5 w-5" /> 
              Passa a Premium
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatureTeaser;
