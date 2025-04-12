import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Crown } from "lucide-react";
import { useLocation } from "wouter";

const PremiumFeatureTeaser = () => {
  const { isAuthenticated, user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Non mostrare il teaser se l'utente non è autenticato o è già premium
  if (!isAuthenticated || (user && user.isPremium)) {
    return null;
  }
  
  return (
    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-heading font-semibold mb-2">Sblocca tutte le funzionalità Premium</h2>
            <p className="text-amber-100 max-w-2xl">
              Ottieni accesso illimitato a tutti i test, analisi dettagliate, spiegazioni approfondite e piani di studio personalizzati.
            </p>
          </div>
          <div className="flex">
            <span className="inline-flex mr-2 items-center px-3 py-0.5 rounded-full text-sm font-medium bg-white text-amber-600">
              Solo €5/mese
            </span>
            <Button 
              onClick={() => setLocation("/settings?tab=premium")}
              className="bg-white text-amber-700 hover:bg-amber-50"
            >
              <Crown className="mr-2 h-4 w-4" /> Passa a Premium
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatureTeaser;
