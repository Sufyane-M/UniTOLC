import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Clock, BookMarked, Layers } from "lucide-react";

const QuizTypes = () => {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  const handleStartSimulation = () => {
    if (isAuthenticated) {
      setLocation("/practice/simulation");
    } else {
      // Apre modale login se non autenticato
      setLocation("/?auth=login");
    }
  };
  
  const handleStartTopicQuiz = () => {
    if (isAuthenticated) {
      setLocation("/practice/topic");
    } else {
      setLocation("/?auth=login");
    }
  };
  
  const handleStartFlashcards = () => {
    if (isAuthenticated) {
      setLocation("/practice/flashcards");
    } else {
      setLocation("/?auth=login");
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-heading">Modalità di pratica</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Simulazione TOLC */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-5 text-white relative overflow-hidden shadow-md">
            <div className="absolute bottom-0 right-0 w-24 h-24 -mb-6 -mr-6 opacity-10">
              <Clock className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-heading font-semibold mb-2">Simulazione TOLC</h3>
            <p className="text-primary-100 text-sm mb-4">
              Simula l'esame completo con le stesse condizioni e tempo dell'esame reale.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-white/20 rounded-full px-2 py-1">120 min</span>
              <Button 
                onClick={handleStartSimulation}
                size="sm"
                className="bg-white text-primary-600 hover:bg-primary-50 border-none"
              >
                Inizia simulazione
              </Button>
            </div>
          </div>
          
          {/* Quiz per argomento */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-5 text-white relative overflow-hidden shadow-md">
            <div className="absolute bottom-0 right-0 w-24 h-24 -mb-6 -mr-6 opacity-10">
              <BookMarked className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-heading font-semibold mb-2">Quiz per argomento</h3>
            <p className="text-emerald-100 text-sm mb-4">
              Pratica su argomenti specifici per migliorare le tue competenze in aree mirate.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-white/20 rounded-full px-2 py-1">Personalizzato</span>
              <Button 
                onClick={handleStartTopicQuiz}
                size="sm"
                className="bg-white text-emerald-600 hover:bg-emerald-50 border-none"
              >
                Seleziona argomento
              </Button>
            </div>
          </div>
          
          {/* Flashcards */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-5 text-white relative overflow-hidden shadow-md">
            <div className="absolute bottom-0 right-0 w-24 h-24 -mb-6 -mr-6 opacity-10">
              <Layers className="w-24 h-24" />
            </div>
            <h3 className="text-lg font-heading font-semibold mb-2">Flashcards</h3>
            <p className="text-amber-100 text-sm mb-4">
              Rivedi concetti chiave e definizioni utilizzando il metodo delle flashcard.
            </p>
            <div className="flex justify-between items-center">
              <span className="text-xs bg-white/20 rounded-full px-2 py-1">Rapido</span>
              <Button 
                onClick={handleStartFlashcards}
                size="sm"
                className="bg-white text-amber-600 hover:bg-amber-50 border-none"
              >
                Inizia flashcards
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizTypes;
