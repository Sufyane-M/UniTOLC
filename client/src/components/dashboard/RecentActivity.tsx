import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, BookOpen, Timer, FlaskConical } from "lucide-react";

interface ActivityItem {
  id: number;
  type: string;
  title: string;
  timestamp: string;
  description: string;
  score?: string | number;
  link?: string;
}

// Dati di esempio per dimostrazione
const mockActivityItems: ActivityItem[] = [
  {
    id: 1,
    type: "quiz",
    title: "Quiz completato",
    timestamp: new Date().toISOString(),
    description: "Hai completato un quiz di Matematica - Algebra con un punteggio di 75%.",
    score: "75%",
    link: "/practice/review/1"
  },
  {
    id: 2,
    type: "flashcard",
    title: "Flashcard completate",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    description: "Hai rivisto 20 flashcard su Fisica - Meccanica."
  },
  {
    id: 3,
    type: "lesson",
    title: "Lezione completata",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    description: "Hai completato la lezione \"Introduzione alle derivate parziali\".",
    link: "/resources/lessons/3"
  },
  {
    id: 4,
    type: "simulation",
    title: "Simulazione TOLC completata",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    description: "Hai completato una simulazione completa del TOLC-I con un punteggio totale di 24/50.",
    score: "24/50",
    link: "/practice/review/4"
  }
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "quiz":
      return (
        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
          <i className="ri-quiz-line text-white"></i>
        </div>
      );
    case "flashcard":
      return (
        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
          <i className="ri-flashcard-line text-white"></i>
        </div>
      );
    case "lesson":
      return (
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
      );
    case "simulation":
      return (
        <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
          <Timer className="h-5 w-5 text-white" />
        </div>
      );
    default:
      return (
        <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-900">
          <FlaskConical className="h-5 w-5 text-white" />
        </div>
      );
  }
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    if (diffInHours < 1) {
      return "Pochi minuti fa";
    }
    return `${diffInHours} ${diffInHours === 1 ? 'ora' : 'ore'} fa`;
  } else if (diffInHours < 48) {
    return "Ieri alle " + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' }) + 
           " alle " + date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
};

const RecentActivity = () => {
  const { isAuthenticated } = useAuth();
  
  // Definizione della query per le attività recenti
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/user-activities'],
    enabled: isAuthenticated,
  });
  
  // Usa i dati mockActivityItems per dimostrazione
  const displayActivities = activities || mockActivityItems;
  
  if (!isAuthenticated) {
    return (
      <Card className="col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-heading">Attività recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 mb-4">
              <AlertCircle className="h-6 w-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Nessuna attività recente</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-2">
              Accedi per tracciare le tue attività e visualizzare i tuoi progressi di studio.
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
          <CardTitle className="text-lg font-heading">Attività recenti</CardTitle>
          <Link href="/analytics">
            <a className="text-sm font-medium text-primary hover:text-primary-600">
              Vedi tutte
            </a>
          </Link>
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
        <CardTitle className="text-lg font-heading">Attività recenti</CardTitle>
        <Link href="/analytics">
          <a className="text-sm font-medium text-primary hover:text-primary-600">
            Vedi tutte
          </a>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul className="-mb-8">
            {displayActivities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < displayActivities.length - 1 && (
                    <span 
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" 
                      aria-hidden="true"
                    ></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm">
                          <Link href={activity.link || "#"}>
                            <a className="font-medium">{activity.title}</a>
                          </Link>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {formatTimestamp(activity.timestamp)}
                        </p>
                      </div>
                      <div className="mt-2 text-sm">
                        <p>{activity.description}</p>
                      </div>
                      {activity.link && (
                        <div className="mt-2">
                          <Link href={activity.link}>
                            <a className="text-sm font-medium text-primary hover:text-primary-600">
                              {activity.type === "quiz" || activity.type === "simulation" 
                                ? "Rivedi quiz " 
                                : activity.type === "lesson" 
                                  ? "Rivedi lezione " 
                                  : "Vedi dettagli "}
                              <i className="ri-arrow-right-line ml-1"></i>
                            </a>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
