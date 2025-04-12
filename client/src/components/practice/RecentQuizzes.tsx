import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Link } from "wouter";
import { formatDate } from "@/lib/utils";

interface QuizAttempt {
  id: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in secondi
  startedAt: string;
  completed: boolean;
  quiz?: {
    title: string;
    type: string;
    subjectId: number;
    subject?: {
      name: string;
    }
  }
}

const RecentQuizzes = () => {
  const { isAuthenticated } = useAuth();
  
  // Fetch dei quiz recenti
  const { data: quizAttempts, isLoading } = useQuery<QuizAttempt[]>({
    queryKey: ['/api/quiz-attempts'],
    enabled: isAuthenticated,
  });
  
  // Funzione per ottenere l'icona in base al tipo di quiz/argomento
  const getQuizIcon = (quizType?: string, subjectName?: string) => {
    if (quizType === "simulation") {
      return <i className="ri-timer-line text-orange-600 dark:text-orange-400"></i>;
    }
    
    if (!subjectName) return <i className="ri-question-line text-primary-600 dark:text-primary-400"></i>;
    
    switch (subjectName.toLowerCase()) {
      case 'matematica':
        return <i className="ri-math-function-line text-primary-600 dark:text-primary-400"></i>;
      case 'fisica':
        return <i className="ri-atom-line text-blue-600 dark:text-blue-400"></i>;
      case 'geometria':
        return <i className="ri-compasses-2-line text-blue-600 dark:text-blue-400"></i>;
      case 'logica':
        return <i className="ri-brain-line text-purple-600 dark:text-purple-400"></i>;
      default:
        return <i className="ri-book-mark-line text-primary-600 dark:text-primary-400"></i>;
    }
  };
  
  // Funzione per formattare il tempo speso
  const formatTimeSpent = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Funzione per ottenere la classe del badge in base al punteggio
  const getScoreBadgeClass = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    
    if (percentage >= 75) {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    } else if (percentage >= 60) {
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
    } else {
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
    }
  };
  
  // Se non ci sono dati, mostra dei dati di esempio
  const mockQuizAttempts = [
    {
      id: 1,
      quizId: 101,
      quiz: {
        title: "Matematica - Algebra",
        type: "topic",
        subject: { name: "Matematica" }
      },
      score: 15,
      totalQuestions: 20,
      correctAnswers: 15,
      timeSpent: 1125, // 18:45
      startedAt: new Date().toISOString(),
      completed: true
    },
    {
      id: 2,
      quizId: 102,
      quiz: {
        title: "Geometria - Vettori",
        type: "topic",
        subject: { name: "Geometria" }
      },
      score: 13,
      totalQuestions: 20,
      correctAnswers: 13,
      timeSpent: 1350, // 22:30
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      completed: true
    },
    {
      id: 3,
      quizId: 103,
      quiz: {
        title: "Simulazione TOLC-I",
        type: "simulation"
      },
      score: 24,
      totalQuestions: 50,
      correctAnswers: 24,
      timeSpent: 6730, // 1:52:10
      startedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      completed: true
    }
  ];
  
  const displayQuizzes = quizAttempts || mockQuizAttempts;
  
  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-heading">Quiz recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-3 mb-4">
              <i className="ri-file-list-3-line text-2xl text-primary-500"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">Nessun quiz recente</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-2">
              Accedi per visualizzare i tuoi quiz recenti e tracciare i tuoi progressi.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-heading">Quiz recenti</CardTitle>
          <Link href="/practice/history">
            <a className="text-sm font-medium text-primary hover:text-primary-600">
              Vedi tutti
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-heading">Quiz recenti</CardTitle>
        <Link href="/practice/history">
          <a className="text-sm font-medium text-primary hover:text-primary-600">
            Vedi tutti
          </a>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6">
          <div className="inline-block min-w-full px-6 align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nome quiz
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Punteggio
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Domande
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tempo
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Azioni</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayQuizzes.map((attempt) => (
                    <tr key={attempt.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            {getQuizIcon(attempt.quiz?.type, attempt.quiz?.subject?.name)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{attempt.quiz?.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {attempt.quiz?.type === "simulation" ? "Simulazione completa" : "Quiz tematico"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {new Date(attempt.startedAt).toLocaleDateString('it-IT', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="outline" className={getScoreBadgeClass(attempt.correctAnswers, attempt.totalQuestions)}>
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {attempt.correctAnswers}/{attempt.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatTimeSpent(attempt.timeSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/practice/review/${attempt.id}`}>
                          <a className="text-primary hover:text-primary-600 dark:hover:text-primary-400">
                            Rivedi
                          </a>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentQuizzes;
