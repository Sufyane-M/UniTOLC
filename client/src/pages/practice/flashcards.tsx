import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { renderMathInText } from "@/lib/katexUtil";
import { Layers, CheckCircle, XCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

// Flashcard data structure
interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string;
  topic: string;
}

// Mock flashcards for demonstration
const mockFlashcards: Flashcard[] = [
  {
    id: 1,
    front: "Derivata della funzione $f(x) = \\sin(x)$",
    back: "La derivata di $\\sin(x)$ è $f'(x) = \\cos(x)$",
    subject: "Matematica",
    topic: "Analisi matematica"
  },
  {
    id: 2,
    front: "Definizione di integrale definito",
    back: "L'integrale definito di una funzione $f(x)$ nell'intervallo $[a,b]$ è definito come $\\int_{a}^{b} f(x) dx = \\lim_{n \\to \\infty} \\sum_{i=1}^{n} f(x_i) \\Delta x$",
    subject: "Matematica",
    topic: "Calcolo integrale"
  },
  {
    id: 3,
    front: "Prima legge di Newton",
    back: "Un corpo permane nel suo stato di quiete o di moto rettilineo uniforme a meno che non sia costretto a cambiare tale stato da forze applicate su di esso.",
    subject: "Fisica",
    topic: "Meccanica"
  },
  {
    id: 4,
    front: "Legge di Coulomb",
    back: "La forza elettrica tra due cariche puntiformi è direttamente proporzionale al prodotto delle cariche e inversamente proporzionale al quadrato della loro distanza: $F = k \\frac{q_1 q_2}{r^2}$",
    subject: "Fisica",
    topic: "Elettromagnetismo"
  },
  {
    id: 5,
    front: "Definizione di mole",
    back: "La mole è l'unità di misura della quantità di sostanza. Una mole contiene esattamente $6,022 \\times 10^{23}$ entità elementari (numero di Avogadro).",
    subject: "Chimica",
    topic: "Stechiometria"
  }
];

// Available subjects and topics
const subjectOptions = [
  { value: "all", label: "Tutte le materie" },
  { value: "Matematica", label: "Matematica" },
  { value: "Fisica", label: "Fisica" },
  { value: "Chimica", label: "Chimica" },
  { value: "Logica", label: "Logica" }
];

const FlashcardsPage = () => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [knownCards, setKnownCards] = useState<number[]>([]);
  const [unknownCards, setUnknownCards] = useState<number[]>([]);
  const [processedFlashcards, setProcessedFlashcards] = useState<Flashcard[]>([]);
  
  // Fetch flashcards from the API (using mock data for now)
  const { data: flashcards, isLoading } = useQuery<Flashcard[]>({
    queryKey: ['/api/flashcards', { subject: selectedSubject }],
    enabled: isAuthenticated,
    initialData: mockFlashcards, // For demonstration
  });
  
  // Filter flashcards by selected subject
  const filteredFlashcards = flashcards?.filter(
    card => selectedSubject === "all" || card.subject === selectedSubject
  ) || [];
  
  // Process math expressions in flashcards
  useEffect(() => {
    if (filteredFlashcards.length) {
      setProcessedFlashcards(
        filteredFlashcards.map(card => ({
          ...card,
          front: renderMathInText(card.front),
          back: renderMathInText(card.back)
        }))
      );
    }
  }, [filteredFlashcards]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/?auth=login");
    }
  }, [isAuthenticated, setLocation]);
  
  // Reset when subject changes
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setKnownCards([]);
    setUnknownCards([]);
  }, [selectedSubject]);
  
  const currentCard = processedFlashcards[currentIndex];
  
  const handleFlip = () => {
    setShowAnswer(!showAnswer);
  };
  
  const handleKnown = () => {
    if (currentCard) {
      setKnownCards(prev => [...prev, currentCard.id]);
      handleNext();
    }
  };
  
  const handleUnknown = () => {
    if (currentCard) {
      setUnknownCards(prev => [...prev, currentCard.id]);
      handleNext();
    }
  };
  
  const handleNext = () => {
    if (currentIndex < processedFlashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    }
  };
  
  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowAnswer(false);
    }
  };
  
  const handleReset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setKnownCards([]);
    setUnknownCards([]);
  };
  
  if (!isAuthenticated) {
    return null; // Redirect is handled in useEffect
  }
  
  const isCompleted = currentIndex >= processedFlashcards.length - 1 && 
                      (knownCards.length + unknownCards.length) >= processedFlashcards.length;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Flashcards</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="w-full sm:w-64">
          <Select
            value={selectedSubject}
            onValueChange={setSelectedSubject}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona materia" />
            </SelectTrigger>
            <SelectContent>
              {subjectOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} di {processedFlashcards.length} flashcards
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleReset}
            disabled={processedFlashcards.length === 0}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" /> Ricomincia
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : processedFlashcards.length > 0 ? (
        <>
          {!isCompleted ? (
            <div className="max-w-3xl mx-auto">
              <Card 
                className="h-[320px] cursor-pointer relative overflow-hidden transition-all"
                onClick={handleFlip}
              >
                {/* Ribbon with subject */}
                {currentCard && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary py-1 px-4 text-white text-sm">
                      {currentCard.topic}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-center h-full p-8">
                  <div className="w-full">
                    {currentCard && (
                      showAnswer ? (
                        <div className="flex flex-col items-center">
                          <h3 className="text-lg font-medium text-primary mb-4">Risposta:</h3>
                          <div 
                            className="text-lg text-center"
                            dangerouslySetInnerHTML={{ __html: currentCard.back }}
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div 
                            className="text-xl font-medium text-center"
                            dangerouslySetInnerHTML={{ __html: currentCard.front }}
                          />
                          <p className="text-sm text-muted-foreground mt-4">
                            (Clicca per vedere la risposta)
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Card>
              
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1.5" /> Precedente
                </Button>
                
                <div className="flex gap-2">
                  {showAnswer && (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={handleUnknown}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" /> Non so
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={handleKnown}
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" /> So
                      </Button>
                    </>
                  )}
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleNext}
                  disabled={currentIndex >= processedFlashcards.length - 1}
                >
                  Successiva <ChevronRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          ) : (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle>Riepilogo</CardTitle>
                <CardDescription>
                  Hai completato tutte le flashcards per questa sezione
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-8 py-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-2">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold">{knownCards.length}</h3>
                    <p className="text-muted-foreground">Conosciute</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-2">
                      <XCircle className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold">{unknownCards.length}</h3>
                    <p className="text-muted-foreground">Da rivedere</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-1.5" /> Ricomincia
                </Button>
              </CardFooter>
            </Card>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <div className="mx-auto mb-4 bg-primary-50 dark:bg-primary-900/20 rounded-full p-3 w-16 h-16 flex items-center justify-center">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="mb-2">Nessuna flashcard disponibile</CardTitle>
          <CardDescription className="max-w-md mx-auto">
            Non ci sono flashcard disponibili per questa materia. Prova a selezionare un'altra materia o torna più tardi.
          </CardDescription>
        </Card>
      )}
    </div>
  );
};

export default FlashcardsPage;