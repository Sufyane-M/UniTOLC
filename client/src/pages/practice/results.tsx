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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  CircleDollarSign, 
  Award, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  Clock,
  BarChart3,
  Share2
} from "lucide-react";
import { renderMathInText } from "@/lib/katexUtil";

interface QuizResultsProps {
  params: {
    id: string;
  };
}

const QuizResultsPage = ({ params }: QuizResultsProps) => {
  const quizId = params ? parseInt(params.id) : undefined;
  const [location, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/?auth=login");
    }
  }, [isAuthenticated, setLocation]);
  
  // Define quiz attempt interface
  interface QuizAttempt {
    id: number;
    quizId: number;
    userId: number;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number;
    startedAt: string;
    completed: boolean;
    xpEarned?: number;
    userAvgScore?: number;
    answers: Record<number, string>;
    quiz?: {
      id: number;
      title: string;
      type: string;
      questions: Array<{
        id: number;
        text: string;
        options: string[];
        correctAnswer: string;
        explanation?: string;
      }>;
    };
  }
  
  // Get quiz results data
  const { data: quizAttempt, isLoading: attemptLoading } = useQuery<QuizAttempt>({
    queryKey: ['/api/quiz-attempts/latest', quizId],
    enabled: isAuthenticated && !!quizId,
    // Using mock data for now
    initialData: {
      id: 1,
      quizId: quizId || 1,
      userId: 1,
      score: 68,
      totalQuestions: 10,
      correctAnswers: 7,
      timeSpent: 640,
      startedAt: new Date().toISOString(),
      completed: true,
      xpEarned: 35,
      userAvgScore: 72,
      answers: { 1: "Risposta dell'utente", 2: "Un'altra risposta" },
      quiz: {
        id: 1,
        title: "Simulazione TOLC-I",
        type: "simulation",
        questions: [
          {
            id: 1,
            text: "Calcola $\\int_{0}^{1} x^2 dx$",
            options: ["1/3", "1/2", "2/3", "1"],
            correctAnswer: "1/3"
          },
          {
            id: 2,
            text: "Qual è la derivata di $f(x) = \\sin(x^2)$?",
            options: [
              "$f'(x) = 2x\\cos(x^2)$", 
              "$f'(x) = \\cos(x^2)$", 
              "$f'(x) = 2\\sin(x)\\cos(x)$", 
              "$f'(x) = x^2\\cos(x^2)$"
            ],
            correctAnswer: "$f'(x) = 2x\\cos(x^2)$"
          }
        ]
      }
    }
  });
  
  // XP animation on load
  useEffect(() => {
    if (quizAttempt) {
      // Show XP animation after a short delay
      setTimeout(() => {
        setShowXpAnimation(true);
      }, 1000);
    }
  }, [quizAttempt]);
  
  // Calculate result stats
  const percentage = quizAttempt?.score || 0;
  const isGoodScore = percentage >= 70;
  const isPoorScore = percentage < 50;
  
  // Calculate time per question
  const averageTimePerQuestion = quizAttempt?.timeSpent && quizAttempt?.totalQuestions
    ? Math.round(quizAttempt.timeSpent / quizAttempt.totalQuestions)
    : null;
  
  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }
  
  if (attemptLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!quizAttempt) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-heading font-bold mb-2">Risultati non trovati</h1>
            <p className="text-muted-foreground text-center mb-6">
              Non è stato possibile trovare i risultati per questo quiz. Potrebbe essere stato eliminato o potresti non avere accesso.
            </p>
            <Button onClick={() => setLocation("/practice")}>
              Torna alla pagina Pratica
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Risultati del Quiz</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{quizAttempt.quiz?.title || "Quiz completato"}</CardTitle>
                  <CardDescription>
                    {new Date(quizAttempt.startedAt).toLocaleString('it-IT')}
                  </CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    isGoodScore 
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" 
                      : isPoorScore 
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }
                >
                  {percentage}% corretto
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                <div 
                  className={`absolute left-0 top-0 h-full transition-all duration-1000 ease-out ${
                    isGoodScore 
                      ? "bg-green-500" 
                      : isPoorScore 
                        ? "bg-red-500" 
                        : "bg-yellow-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center font-medium text-sm">
                  {quizAttempt.correctAnswers} su {quizAttempt.totalQuestions} domande corrette
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-accent/50 p-4 rounded-md text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-primary mr-1.5" />
                    <span className="text-sm text-muted-foreground">Tempo</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {quizAttempt.timeSpent 
                      ? `${Math.floor(quizAttempt.timeSpent / 60)}:${(quizAttempt.timeSpent % 60).toString().padStart(2, '0')}`
                      : "N/A"}
                  </div>
                </div>
                
                <div className="bg-accent/50 p-4 rounded-md text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-5 w-5 text-primary mr-1.5" />
                    <span className="text-sm text-muted-foreground">XP guadagnati</span>
                  </div>
                  <div className="text-lg font-semibold">
                    <span className={showXpAnimation ? "text-amber-500" : ""}>
                      +{quizAttempt.xpEarned || Math.round(percentage / 2)} XP
                    </span>
                  </div>
                </div>
                
                <div className="bg-accent/50 p-4 rounded-md text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="h-5 w-5 text-primary mr-1.5" />
                    <span className="text-sm text-muted-foreground">Media storica</span>
                  </div>
                  <div className="text-lg font-semibold">
                    {(quizAttempt.userAvgScore || 65)}%
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Feedback</h3>
                
                <div>
                  {percentage >= 80 ? (
                    <p>Eccellente! Hai un'ottima comprensione degli argomenti trattati in questo quiz.</p>
                  ) : percentage >= 60 ? (
                    <p>Buon lavoro! La tua preparazione è buona, ma ci sono ancora alcuni concetti da approfondire.</p>
                  ) : (
                    <p>C'è ancora margine di miglioramento. Ti consigliamo di rivedere gli argomenti di questo quiz prima di procedere.</p>
                  )}
                </div>
                
                {averageTimePerQuestion && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Hai impiegato in media {averageTimePerQuestion} secondi per domanda.
                    {averageTimePerQuestion > 60 
                      ? " Potresti migliorare i tuoi tempi di risposta con più esercitazione." 
                      : " Ottimo tempo di risposta!"}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setLocation("/practice")}>
                Torna alla pratica
              </Button>
              <Button 
                onClick={() => 
                  setLocation(`/practice/${quizAttempt.quiz?.type === "simulation" ? "simulation" : "topic"}/similar`)
                }
              >
                Quiz simile <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          
          {/* Domande e risposte */}
          <Card>
            <CardHeader>
              <CardTitle>Dettaglio domande e risposte</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {quizAttempt.answers && quizAttempt.quiz?.questions?.map((question, index) => {
                  const userAnswer = quizAttempt.answers[question.id];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div key={question.id} className="p-4">
                      <div className="flex items-start">
                        <div className={`rounded-full p-1 mr-3 ${
                          isCorrect 
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        }`}>
                          {isCorrect 
                            ? <CheckCircle className="h-5 w-5" /> 
                            : <XCircle className="h-5 w-5" />}
                        </div>
                        <div className="flex-grow">
                          <p className="font-medium mb-2" dangerouslySetInnerHTML={{ 
                            __html: renderMathInText(question.text) 
                          }} />
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">La tua risposta:</span>
                              <div className={`mt-1 p-2 rounded ${
                                isCorrect 
                                  ? "bg-green-50 dark:bg-green-900/10" 
                                  : "bg-red-50 dark:bg-red-900/10"
                              }`} dangerouslySetInnerHTML={{ 
                                __html: renderMathInText(userAnswer || "Nessuna risposta") 
                              }} />
                            </div>
                            
                            {!isCorrect && (
                              <div>
                                <span className="text-muted-foreground">Risposta corretta:</span>
                                <div className="mt-1 p-2 rounded bg-green-50 dark:bg-green-900/10" dangerouslySetInnerHTML={{ 
                                  __html: renderMathInText(question.correctAnswer) 
                                }} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Argomenti da rivedere</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isPoorScore ? (
                  <>
                    <div className="border-l-4 border-amber-500 pl-3">
                      <h4 className="font-medium">Calcolo integrale</h4>
                      <p className="text-sm text-muted-foreground">Rivedere le tecniche di integrazione e le applicazioni degli integrali definiti.</p>
                    </div>
                    <div className="border-l-4 border-amber-500 pl-3">
                      <h4 className="font-medium">Trigonometria</h4>
                      <p className="text-sm text-muted-foreground">Migliorare la conoscenza delle identità fondamentali e della risoluzione delle equazioni trigonometriche.</p>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nessuna area critica rilevata in questo quiz.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sblocca più contenuti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-lg p-4 mb-4">
                <div className="flex items-center mb-3">
                  <CircleDollarSign className="h-6 w-6 mr-2" />
                  <h3 className="text-lg font-medium">Premium</h3>
                </div>
                <p className="mb-3 opacity-90 text-sm">
                  Sblocca spiegazioni dettagliate, quiz avanzati e analisi approfondite delle tue prestazioni.
                </p>
                <Button 
                  className="w-full bg-white text-amber-600 hover:bg-amber-50 border-none"
                  onClick={() => setLocation("/settings?tab=premium")}
                >
                  Sblocca a soli €5/mese
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.navigator.share?.({
                  title: 'I miei risultati su TolcPrep',
                  text: `Ho totalizzato ${percentage}% in un quiz su TolcPrep!`
                }).catch(() => {})}
              >
                <Share2 className="h-4 w-4 mr-1.5" /> Condividi risultati
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizResultsPage;