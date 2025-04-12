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
import { Clock, AlertCircle } from "lucide-react";
import QuizContainer from "@/components/practice/QuizContainer";

// Tipi di esame TOLC disponibili
const examTypes = [
  {
    id: "TOLC-I",
    name: "TOLC-I",
    description: "Test per Ingegneria",
    duration: 120, // minuti
    questions: 50,
    subjects: ["Matematica", "Logica", "Scienze", "Comprensione verbale"]
  },
  {
    id: "TOLC-E",
    name: "TOLC-E",
    description: "Test per Economia",
    duration: 120,
    questions: 45,
    subjects: ["Logica", "Comprensione verbale", "Matematica", "Inglese"]
  },
  {
    id: "TOLC-F",
    name: "TOLC-F",
    description: "Test per Farmacia e CTF",
    duration: 105,
    questions: 50,
    subjects: ["Biologia", "Chimica", "Matematica", "Fisica", "Logica"]
  },
  {
    id: "ENGLISH-TOLC",
    name: "ENGLISH-TOLC",
    description: "Test in inglese",
    duration: 120,
    questions: 50,
    subjects: ["Mathematics", "Logic", "Sciences", "Reading Comprehension"]
  }
];

const SimulationPage = () => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [selectedExamType, setSelectedExamType] = useState<string>("TOLC-I");
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [currentSimulationId, setCurrentSimulationId] = useState<number | null>(null);
  
  // Verifica se l'utente è autenticato, altrimenti reindirizza alla home
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/?auth=login");
    }
  }, [isAuthenticated, setLocation]);
  
  // Ottieni le simulazioni disponibili per il tipo di esame selezionato
  const { data: simulations = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/quizzes', { type: 'simulation', examType: selectedExamType }],
    enabled: isAuthenticated,
  });
  
  const handleStartSimulation = async () => {
    // Al momento stiamo mostrando un mock, ma qui si dovrebbe ottenere una simulazione dal server
    // o generarla dinamicamente
    setSimulationStarted(true);
    
    // Nelle implementazioni reali, qui si dovrebbe:
    // 1. Creare una nuova istanza di simulazione nel database
    // 2. Ottenere l'ID della simulazione creata
    // 3. Impostare currentSimulationId con l'ID ottenuto dal backend
    setCurrentSimulationId(1); // Mock ID
  };
  
  const selectedExam = examTypes.find(exam => exam.id === selectedExamType);
  
  if (!isAuthenticated) {
    return null; // La redirezione è gestita nell'useEffect
  }
  
  if (simulationStarted && currentSimulationId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-heading font-bold mb-6">Simulazione TOLC</h1>
        <QuizContainer quizId={currentSimulationId} />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Simulazione TOLC</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Scegli il tipo di TOLC</CardTitle>
          <CardDescription>
            Seleziona il tipo di esame TOLC che vuoi simulare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Select
                value={selectedExamType}
                onValueChange={setSelectedExamType}
              >
                <SelectTrigger className="w-full sm:w-[320px]">
                  <SelectValue placeholder="Seleziona tipo di TOLC" />
                </SelectTrigger>
                <SelectContent>
                  {examTypes.map(exam => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name} - {exam.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedExam && (
              <div className="bg-accent/50 p-4 rounded-md">
                <h3 className="font-semibold text-lg mb-2">{selectedExam.name} - {selectedExam.description}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Durata:</p>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-muted-foreground" />
                      <span>{selectedExam.duration} minuti</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Domande:</p>
                    <span>{selectedExam.questions} domande totali</span>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">Materie:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedExam.subjects.map(subject => (
                        <Badge key={subject} variant="outline">{subject}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Informazioni importanti</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    La simulazione rispecchia il più possibile l'esame reale. Una volta iniziata, avrai a disposizione il tempo indicato e non potrai mettere in pausa. Assicurati di avere abbastanza tempo a disposizione prima di iniziare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            size="lg"
            onClick={handleStartSimulation}
            className="w-full sm:w-auto"
          >
            Inizia simulazione {selectedExamType}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Le tue simulazioni recenti</CardTitle>
          <CardDescription>
            Visualizza i risultati delle simulazioni che hai completato
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : simulations && simulations.length > 0 ? (
            <div className="space-y-4">
              {/* Qui mostreremmo le simulazioni recenti dell'utente */}
              <p className="text-center text-muted-foreground py-4">
                Nessuna simulazione completata. Inizia la tua prima simulazione!
              </p>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              Nessuna simulazione completata. Inizia la tua prima simulazione!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationPage;