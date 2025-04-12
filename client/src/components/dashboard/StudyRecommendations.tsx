import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Book, BookMarked, Atom } from "lucide-react";

interface StudyRecommendation {
  id: number;
  userId: number;
  topicId: number;
  priority: string;
  reason: string;
  createdAt: string;
  topic?: {
    id: number;
    name: string;
    description: string;
    subjectId: number;
    subject?: {
      id: number;
      name: string;
      icon: string;
    }
  }
}

const StudyRecommendations = () => {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Fetch delle raccomandazioni
  const { data: recommendations, isLoading } = useQuery<StudyRecommendation[]>({
    queryKey: ['/api/study-recommendations'],
    enabled: isAuthenticated,
  });
  
  // Funzione per ottenere l'icona corretta in base all'argomento
  const getTopicIcon = (subjectName?: string) => {
    if (!subjectName) return <Book className="text-xl text-primary-500" />;
    
    switch (subjectName.toLowerCase()) {
      case 'matematica':
        return <i className="ri-math-function-line text-xl text-primary-500"></i>;
      case 'fisica':
        return <Atom className="text-xl text-primary-500" />;
      case 'logica':
        return <i className="ri-brain-line text-xl text-primary-500"></i>;
      case 'geometria':
        return <i className="ri-compasses-2-line text-xl text-primary-500"></i>;
      default:
        return <BookMarked className="text-xl text-primary-500" />;
    }
  };
  
  // Funzione per determinare il colore del badge di priorità
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'alta':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case 'media':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case 'bassa':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };
  
  // Dati statici per dimostrazione
  const staticRecommendations = [
    {
      id: 1,
      topic: {
        name: "Algebra e Funzioni",
        subject: { name: "Matematica" }
      },
      description: "Rivedi i concetti di base delle equazioni esponenziali e logaritmiche.",
      priority: "alta"
    },
    {
      id: 2,
      topic: {
        name: "Geometria",
        subject: { name: "Geometria" }
      },
      description: "Esercitati con i problemi di geometria analitica nello spazio.",
      priority: "media"
    },
    {
      id: 3,
      topic: {
        name: "Fisica - Meccanica",
        subject: { name: "Fisica" }
      },
      description: "Completa un quiz di ripasso sui concetti di energia e lavoro.",
      priority: "bassa"
    }
  ];
  
  const displayRecommendations = recommendations || staticRecommendations;
  
  if (!isAuthenticated) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading">Raccomandazioni di studio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-3 mb-4">
              <BookMarked className="h-6 w-6 text-primary-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Sblocca raccomandazioni personalizzate</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-2">
              Accedi per ricevere raccomandazioni di studio basate sulle tue performance e aree di debolezza.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-heading">Raccomandazioni di studio</CardTitle>
          <span className="text-sm text-muted-foreground">Basato sulle tue performance</span>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-heading">Raccomandazioni di studio</CardTitle>
        <span className="text-sm text-muted-foreground">Basato sulle tue performance</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayRecommendations.map((recommendation) => (
            <div key={recommendation.id} className="flex items-start p-4 border border-border rounded-lg hover:bg-accent/50 transition">
              <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 p-2 rounded-md">
                {getTopicIcon(recommendation.topic?.subject?.name)}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium">{recommendation.topic?.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {recommendation.description}
                </p>
                <div className="mt-2 flex">
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary-600 dark:hover:text-primary-300">
                    Inizia il ripasso
                  </a>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <a href="#" className="text-sm font-medium text-primary hover:text-primary-600 dark:hover:text-primary-300">
                    Vedi materiali
                  </a>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Badge variant="outline" className={getPriorityBadgeVariant(recommendation.priority)}>
                  Priorità {recommendation.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyRecommendations;
