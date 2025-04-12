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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RadioTower, BookMarked } from "lucide-react";
import QuizContainer from "@/components/practice/QuizContainer";

// Dati di esempio per argomenti e materie
const subjects = [
  { id: 1, name: "Matematica", topics: [
    { id: 1, name: "Algebra", difficulty: "Medio" },
    { id: 2, name: "Geometria", difficulty: "Facile" },
    { id: 3, name: "Trigonometria", difficulty: "Difficile" },
    { id: 4, name: "Analisi matematica", difficulty: "Difficile" },
    { id: 5, name: "Calcolo integrale", difficulty: "Difficile" }
  ]},
  { id: 2, name: "Fisica", topics: [
    { id: 6, name: "Meccanica", difficulty: "Medio" },
    { id: 7, name: "Elettromagnetismo", difficulty: "Difficile" },
    { id: 8, name: "Termodinamica", difficulty: "Difficile" }
  ]},
  { id: 3, name: "Logica", topics: [
    { id: 9, name: "Logica proposizionale", difficulty: "Facile" },
    { id: 10, name: "Insiemi", difficulty: "Facile" },
    { id: 11, name: "Ragionamento logico", difficulty: "Medio" }
  ]},
  { id: 4, name: "Chimica", topics: [
    { id: 12, name: "Chimica organica", difficulty: "Difficile" },
    { id: 13, name: "Stechiometria", difficulty: "Medio" },
    { id: 14, name: "Struttura atomica", difficulty: "Facile" }
  ]}
];

// Mappa difficoltà al colore della badge
const difficultyColors: Record<string, string> = {
  "Facile": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "Medio": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Difficile": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
};

const TopicQuizPage = () => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [topicQuizId, setTopicQuizId] = useState<number | null>(null);
  
  // Verifica se l'utente è autenticato
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/?auth=login");
    }
  }, [isAuthenticated, setLocation]);
  
  // Ottieni i quiz disponibili per gli argomenti selezionati
  const { data: topicQuizzes = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/quizzes', { type: 'topic', topics: selectedTopics }],
    enabled: isAuthenticated && selectedTopics.length > 0,
  });
  
  // Filtra gli argomenti in base alla ricerca
  const filteredSubjects = subjects.map(subject => ({
    ...subject,
    topics: subject.topics.filter(topic => 
      topic.name.toLowerCase().includes(searchTerm.toLowerCase()))
  })).filter(subject => subject.topics.length > 0);
  
  const handleTopicToggle = (topicId: number) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };
  
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(parseInt(subjectId));
    setSelectedTopics([]);
  };
  
  const handleStartQuiz = () => {
    if (selectedTopics.length === 0) {
      return;
    }
    
    // Nelle implementazioni reali, qui si dovrebbe:
    // 1. Creare un nuovo quiz su argomenti specifici nel database
    // 2. Ottenere l'ID del quiz creato
    // 3. Impostare topicQuizId con l'ID ottenuto
    setQuizStarted(true);
    setTopicQuizId(2); // Mock ID
  };
  
  if (!isAuthenticated) {
    return null; // La redirezione è gestita nell'useEffect
  }
  
  if (quizStarted && topicQuizId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-heading font-bold mb-6">Quiz per argomento</h1>
        <QuizContainer quizId={topicQuizId} />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Quiz per argomento</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Seleziona gli argomenti</CardTitle>
              <CardDescription>
                Scegli gli argomenti specifici su cui vuoi esercitarti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-64">
                    <Select
                      value={selectedSubject ? selectedSubject.toString() : ""}
                      onValueChange={handleSubjectChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id.toString()}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca argomenti..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="border rounded-md">
                  {filteredSubjects.length > 0 ? (
                    <div className="divide-y">
                      {filteredSubjects.map(subject => (
                        <div key={subject.id} className={`p-4 ${selectedSubject === subject.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                          <h3 className="font-medium text-lg mb-3">{subject.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {subject.topics.map(topic => (
                              <div 
                                key={topic.id} 
                                className={`flex items-center space-x-2 p-2 rounded-md border ${
                                  selectedTopics.includes(topic.id) 
                                    ? 'border-primary bg-primary-50 dark:bg-primary-900/20' 
                                    : 'border-border'
                                }`}
                              >
                                <Checkbox 
                                  id={`topic-${topic.id}`}
                                  checked={selectedTopics.includes(topic.id)}
                                  onCheckedChange={() => handleTopicToggle(topic.id)}
                                />
                                <div className="flex justify-between items-center flex-grow">
                                  <label 
                                    htmlFor={`topic-${topic.id}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                  >
                                    {topic.name}
                                  </label>
                                  <Badge className={difficultyColors[topic.difficulty] || ""}>{topic.difficulty}</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <BookMarked className="mx-auto h-12 w-12 text-muted-foreground/60 mb-3" />
                      <p>Nessun argomento trovato con il termine "{searchTerm}".</p>
                      <p className="text-sm mt-1">Prova a modificare i criteri di ricerca.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <Badge variant="outline" className="mr-2">
                  {selectedTopics.length} argomenti selezionati
                </Badge>
              </div>
              <Button 
                onClick={handleStartQuiz}
                disabled={selectedTopics.length === 0}
              >
                Inizia quiz
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Le tue statistiche</CardTitle>
              <CardDescription>
                Progressi su argomenti chiave
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-accent/50 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <RadioTower className="h-5 w-5 mr-2 text-primary" />
                    <h4 className="font-medium">Aree di miglioramento</h4>
                  </div>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between items-center">
                      <span>Calcolo integrale</span>
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        42% accuratezza
                      </Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Elettromagnetismo</span>
                      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        48% accuratezza
                      </Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Termodinamica</span>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        65% accuratezza
                      </Badge>
                    </li>
                  </ul>
                </div>
                
                <div className="border rounded-md p-4">
                  <h4 className="font-medium mb-2">Aree di forza</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between items-center">
                      <span>Logica proposizionale</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        92% accuratezza
                      </Badge>
                    </li>
                    <li className="flex justify-between items-center">
                      <span>Insiemi</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        88% accuratezza
                      </Badge>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full" onClick={() => setLocation("/analytics")}>
                    Vedi statistiche complete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TopicQuizPage;