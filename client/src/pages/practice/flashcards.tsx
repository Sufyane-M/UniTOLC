import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, BookMarked, RefreshCw, ArrowRight, Lightbulb } from "lucide-react";
import { renderMathInText } from "@/lib/katexUtil";

// Mock dei soggetti per le flashcards
const subjects = [
  { id: 1, name: "Matematica" },
  { id: 2, name: "Fisica" },
  { id: 3, name: "Chimica" },
  { id: 4, name: "Logica" }
];

// Mock delle flashcards
const mockFlashcards = [
  {
    id: 1,
    question: "Qual è la derivata di $f(x) = x^2$?",
    answer: "$f'(x) = 2x$",
    subject: "Matematica",
    topic: "Calcolo differenziale"
  },
  {
    id: 2,
    question: "Qual è l'integrale di $f(x) = 2x$?",
    answer: "$\\int 2x \\, dx = x^2 + C$",
    subject: "Matematica",
    topic: "Calcolo integrale"
  },
  {
    id: 3,
    question: "Enuncia la seconda legge di Newton",
    answer: "La forza netta applicata a un corpo è uguale al prodotto della sua massa per la sua accelerazione: $F = ma$",
    subject: "Fisica",
    topic: "Meccanica"
  },
  {
    id: 4,
    question: "Quali sono gli elementi della tavola periodica con un elettrone nell'orbitale più esterno?",
    answer: "Gli elementi del gruppo 1 (metalli alcalini): Li, Na, K, Rb, Cs, Fr",
    subject: "Chimica",
    topic: "Chimica inorganica"
  },
  {
    id: 5,
    question: "Se A implica B e B implica C, cosa si può concludere?",
    answer: "A implica C (proprietà transitiva dell'implicazione)",
    subject: "Logica",
    topic: "Logica proposizionale"
  }
];

const FlashcardsPage = () => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<number[]>([]);
  const [unknownCards, setUnknownCards] = useState<number[]>([]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/?auth=login");
    }
  }, [isAuthenticated, setLocation]);
  
  // Filtra le flashcards in base al soggetto selezionato
  const filteredFlashcards = selectedSubject === "all" 
    ? mockFlashcards 
    : mockFlashcards.filter(card => card.subject === selectedSubject);
  
  const currentCard = filteredFlashcards[currentCardIndex];
  const totalCards = filteredFlashcards.length;
  
  // Ottieni le flashcards reali dal server
  const { data: flashcards = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/flashcards', { subject: selectedSubject !== "all" ? selectedSubject : undefined }],
    enabled: isAuthenticated,
  });
  
  const handleNextCard = () => {
    setIsFlipped(false);
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Torna alla prima carta se siamo alla fine
      setCurrentCardIndex(0);
    }
  };
  
  const handlePrevCard = () => {
    setIsFlipped(false);
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    } else {
      // Vai all'ultima carta se siamo all'inizio
      setCurrentCardIndex(totalCards - 1);
    }
  };
  
  const handleMarkKnown = () => {
    const cardId = currentCard.id;
    if (!knownCards.includes(cardId)) {
      setKnownCards([...knownCards, cardId]);
      setUnknownCards(unknownCards.filter(id => id !== cardId));
    }
    handleNextCard();
  };
  
  const handleMarkUnknown = () => {
    const cardId = currentCard.id;
    if (!unknownCards.includes(cardId)) {
      setUnknownCards([...unknownCards, cardId]);
      setKnownCards(knownCards.filter(id => id !== cardId));
    }
    handleNextCard();
  };
  
  const resetProgress = () => {
    setKnownCards([]);
    setUnknownCards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };
  
  if (!isAuthenticated) {
    return null; // La redirezione è gestita nell'useEffect
  }
  
  // Ricrea il HTML con le formule matematiche renderizzate
  const renderCardContent = (content: string) => {
    return {__html: renderMathInText(content)};
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Flashcards</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                  <CardTitle>Flashcards</CardTitle>
                  <CardDescription>
                    Ripassa concetti chiave con le flashcards
                  </CardDescription>
                </div>
                
                <div className="mt-3 sm:mt-0">
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleziona materia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutte le materie</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredFlashcards.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div 
                    className={`relative w-full max-w-xl min-h-[350px] border rounded-lg cursor-pointer ${
                      isFlipped ? 'bg-green-50 dark:bg-green-900/10' : 'bg-white dark:bg-gray-900'
                    }`} 
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div className="absolute top-2 right-2">
                      <Badge>
                        {currentCardIndex + 1} / {totalCards}
                      </Badge>
                    </div>
                    
                    {/* Soggetto e argomento */}
                    <div className="absolute top-2 left-2 flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800">
                        {currentCard.subject}
                      </Badge>
                      <Badge variant="outline">
                        {currentCard.topic}
                      </Badge>
                    </div>
                    
                    <div className="p-8 flex justify-center items-center h-full">
                      {isFlipped ? (
                        <div className="text-center">
                          <Lightbulb className="w-8 h-8 mx-auto mb-4 text-amber-500" />
                          <div 
                            className="text-lg font-medium"
                            dangerouslySetInnerHTML={renderCardContent(currentCard.answer)}
                          />
                        </div>
                      ) : (
                        <div 
                          className="text-xl font-heading text-center"
                          dangerouslySetInnerHTML={renderCardContent(currentCard.question)}
                        />
                      )}
                    </div>
                    
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground">
                      {isFlipped ? "Clicca per nascondere la risposta" : "Clicca per vedere la risposta"}
                    </div>
                  </div>
                  
                  <div className="flex justify-between w-full max-w-xl mt-4">
                    <Button variant="outline" onClick={handlePrevCard}>
                      ← Precedente
                    </Button>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
                        onClick={handleMarkUnknown}
                      >
                        <X className="w-4 h-4 mr-1" /> Non so
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/30"
                        onClick={handleMarkKnown}
                      >
                        <Check className="w-4 h-4 mr-1" /> So
                      </Button>
                    </div>
                    
                    <Button variant="outline" onClick={handleNextCard}>
                      Successiva →
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <BookMarked className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
                  <p>Nessuna flashcard disponibile per la materia selezionata.</p>
                  <p className="text-sm mt-1">Prova a selezionare un'altra materia.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800">
                  {knownCards.length} Conosciute
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800">
                  {unknownCards.length} Da rivedere
                </Badge>
              </div>
              <Button variant="ghost" onClick={resetProgress}>
                <RefreshCw className="w-4 h-4 mr-1.5" /> Reset
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>I tuoi progressi</CardTitle>
              <CardDescription>
                Le tue statistiche di apprendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-accent/50 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Flashcards completate oggi</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{knownCards.length + unknownCards.length}</div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">Obiettivo: 50</div>
                  </div>
                </div>
                
                <div className="bg-accent/30 p-4 rounded-md">
                  <h3 className="text-sm font-medium mb-2">Carte da rivedere per materia</h3>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Matematica</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        12
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fisica</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        8
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Chimica</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                        5
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Consigli per un uso efficace</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Rivedi regolarmente le carte che non conosci</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Fai sessioni brevi ma frequenti</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      <span>Prova a spiegare i concetti ad alta voce</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsPage;