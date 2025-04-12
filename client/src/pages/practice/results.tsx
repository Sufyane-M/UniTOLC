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
import { Progress } from "@/components/ui/progress";
import { renderMathInText } from "@/lib/katexUtil";
import { 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  BookOpen,
  Trophy,
  Star,
  Home
} from "lucide-react";

interface ResultsPageProps {
  params: {
    id: string;
  };
}

const ResultsPage = ({ params }: ResultsPageProps) => {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const attemptId = parseInt(params.id);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/?auth=login");
    }
  }, [isAuthenticated, setLocation]);
  
  // Ottieni i risultati del quiz dal server
  const { data: attempt, isLoading, error } = useQuery({
    queryKey: ['/api/quiz-attempts', attemptId],
    enabled: isAuthenticated && !isNaN(attemptId),
  });
  
  // Risultati mock per demo
  const mockAttempt = {
    id: attemptId,
    quizId: 1,
    score: 75,
    totalQuestions: 20,
    correctAnswers: 15,
    timeSpent: 1320, // in secondi (22 minuti)
    startedAt: new Date().toISOString(),
    completed: true,
    userAnswers: [
      { questionId: 1, correct: true, timeTaken: 25 },
      { questionId: 2, correct: true, timeTaken: 42 },
      { questionId: 3, correct: false, timeTaken: 118 },
      { questionId: 4, correct: true, timeTaken: 35 },
      { questionId: 5, correct: true, timeTaken: 47 },
      { questionId: 6, correct: false, timeTaken: 89 },
      { questionId: 7, correct: true, timeTaken: 53 },
      { questionId: 8, correct: true, timeTaken: 27 },
      { questionId: 9, correct: true, timeTaken: 62 },
      { questionId: 10, correct: false, timeTaken: 75 },
      { questionId: 11, correct: true, timeTaken: 42 },
      { questionId: 12, correct: true, timeTaken: 58 },
      { questionId: 13, correct: false, timeTaken: 63 },
      { questionId: 14, correct: true, timeTaken: 31 },
      { questionId: 15, correct: true, timeTaken: 39 },
      { questionId: 16, correct: false, timeTaken: 81 },
      { questionId: 17, correct: true, timeTaken: 47 },
      { questionId: 18, correct: true, timeTaken: 52 },
      { questionId: 19, correct: true, timeTaken: 36 },
      { questionId: 20, correct: true, timeTaken: 44 },
    ],
    questions: [
      { id: 1, text: "Qual è la derivata di $f(x) = x^3$?", correct: "$f'(x) = 3x^2$", topic: "Calcolo differenziale", difficulty: "media" },
      { id: 2, text: "Qual è la soluzione dell'equazione $x^2 - 4x + 4 = 0$?", correct: "$x = 2$", topic: "Algebra", difficulty: "facile" },
      // Altri elementi omessi per brevità
    ],
    quiz: {
      title: "Simulazione TOLC-I",
      type: "simulation",
      subjectId: 1,
      subject: {
        name: "Matematica"
      }
    }
  };
  
  // Usa il mock finché non abbiamo dati reali
  const quizAttempt = attempt || mockAttempt;
  
  // Calcola le statistiche
  const correctAnswers = quizAttempt.correctAnswers;
  const totalQuestions = quizAttempt.totalQuestions;
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  
  // Formato tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  // Categorizzazione delle risposte per argomento
  const answersByTopic: Record<string, { correct: number; total: number; }> = {};
  
  if (quizAttempt.questions && quizAttempt.userAnswers) {
    quizAttempt.questions.forEach((question, index) => {
      const topic = question.topic || "Altro";
      const userAnswer = quizAttempt.userAnswers[index];
      
      if (!answersByTopic[topic]) {
        answersByTopic[topic] = { correct: 0, total: 0 };
      }
      
      answersByTopic[topic].total += 1;
      if (userAnswer && userAnswer.correct) {
        answersByTopic[topic].correct += 1;
      }
    });
  }
  
  // Ottieni colore in base al punteggio
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };
  
  // Ottieni colore per la progress bar
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  if (!isAuthenticated) {
    return null; // La redirezione è gestita nell'useEffect
  }
  
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Errore</CardTitle>
            <CardDescription>
              Si è verificato un errore nel caricamento dei risultati.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Non è stato possibile recuperare i risultati del quiz richiesto.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setLocation("/practice")}>
              Torna alla pratica
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Risultati Quiz</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Colonna sinistra - Statistiche generali */}
        <div className="col-span-1 lg:col-span-3">
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <CardTitle>{quizAttempt.quiz?.title || "Risultati quiz"}</CardTitle>
                  <CardDescription>
                    Completato il {new Date(quizAttempt.startedAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="mt-3 md:mt-0 flex items-center space-x-2">
                  <Badge variant="outline" className="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                    {quizAttempt.quiz?.type?.charAt(0).toUpperCase() + quizAttempt.quiz?.type?.slice(1) || "Quiz"}
                  </Badge>
                  <Badge variant="outline">
                    {quizAttempt.quiz?.subject?.name || "Varie"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {/* Punteggio */}
                <div className="bg-accent/30 rounded-lg p-5 text-center">
                  <div className="flex justify-center mb-2">
                    <Trophy className="h-8 w-8 text-amber-500" />
                  </div>
                  <div className={`text-3xl font-bold mb-1 ${getScoreColor(scorePercentage)}`}>
                    {scorePercentage}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Punteggio totale
                  </div>
                </div>
                
                {/* Risposte corrette */}
                <div className="bg-accent/30 rounded-lg p-5 text-center">
                  <div className="flex justify-center mb-2">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Risposte corrette
                  </div>
                </div>
                
                {/* Tempo impiegato */}
                <div className="bg-accent/30 rounded-lg p-5 text-center">
                  <div className="flex justify-center mb-2">
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold mb-1">
                    {formatTime(quizAttempt.timeSpent)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tempo impiegato
                  </div>
                </div>
              </div>
              
              {/* Performance per argomento */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                  Performance per argomento
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(answersByTopic).map(([topic, data]) => {
                    const percentage = Math.round((data.correct / data.total) * 100);
                    return (
                      <div key={topic}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{topic}</span>
                          <span className="text-sm text-muted-foreground">{data.correct}/{data.total} ({percentage}%)</span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2"
                          indicatorClassName={getProgressColor(percentage)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setLocation("/practice")}
              >
                <Home className="w-4 h-4 mr-2" /> Torna alla pratica
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  variant="default" 
                  onClick={() => {
                    // Qui si potrebbe implementare l'esportazione dei risultati
                    alert("Funzionalità di esportazione in sviluppo");
                  }}
                >
                  Rivedi risposte
                </Button>
                <Button 
                  variant="default" 
                  onClick={() => {
                    if (quizAttempt.quiz?.type === "simulation") {
                      setLocation("/practice/simulation");
                    } else if (quizAttempt.quiz?.type === "topic") {
                      setLocation("/practice/topic");
                    } else {
                      setLocation("/practice");
                    }
                  }}
                >
                  Riprova
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Colonna destra - Suggerimenti e prossimi passi */}
        <div className="col-span-1">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Suggerimenti</CardTitle>
              <CardDescription>
                In base alle tue risposte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Suggerimenti basati sulle risposte errate */}
                <div className="border-l-4 border-primary pl-4 py-2">
                  <h4 className="font-medium mb-1">Aree di miglioramento</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Concentrati su questi argomenti:
                  </p>
                  <div className="space-y-1.5">
                    {Object.entries(answersByTopic)
                      .filter(([_, data]) => (data.correct / data.total) < 0.7)
                      .map(([topic, data]) => (
                        <div key={topic} className="flex items-center text-sm">
                          <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
                          {topic}
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Consigli generali */}
                <div className="rounded-md p-4 bg-accent/30">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Star className="h-4 w-4 mr-1.5 text-amber-500" />
                    Consigli
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <BookOpen className="h-4 w-4 mr-1.5 mt-0.5 text-primary" />
                      <span>Rivedi gli argomenti con il punteggio più basso</span>
                    </li>
                    <li className="flex items-start">
                      <Clock className="h-4 w-4 mr-1.5 mt-0.5 text-primary" />
                      <span>Pratica con timer per migliorare la velocità</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-1.5 mt-0.5 text-primary" />
                      <span>Ripeti il quiz dopo una settimana per verificare i progressi</span>
                    </li>
                  </ul>
                </div>
                
                {/* Prossimi passi */}
                <div>
                  <h4 className="font-medium mb-2">Prossimi passi</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setLocation("/practice/topic")}
                    >
                      <BookOpen className="h-4 w-4 mr-1.5" />
                      Quiz per argomento
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setLocation("/resources")}
                    >
                      <BarChart3 className="h-4 w-4 mr-1.5" />
                      Risorse di studio
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Certificato di completamento per quiz completati con successo */}
          {scorePercentage >= 60 && (
            <Card className="mb-6 border-green-200 dark:border-green-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-green-700 dark:text-green-400">
                  Complimenti!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Hai superato il quiz con un punteggio del {scorePercentage}%!
                  </p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    +50 XP guadagnati
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;