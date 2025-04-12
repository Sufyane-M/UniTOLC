import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import QuizQuestion from "./QuizQuestion";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  type: string;
  timeLimit?: number;
  isPremium: boolean;
  questions: Question[];
}

interface QuizContainerProps {
  quizId?: number;
  demoMode?: boolean;
}

const QuizContainer = ({ quizId, demoMode = false }: QuizContainerProps) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  // Demo di una domanda per la pagina di pratica
  const demoQuestion: Question = {
    id: 999,
    text: "Sia $f(x) = \\sqrt{x^2 + 5x + 6}$. In quali punti la funzione non è derivabile?",
    options: [
      "$x = -3$ e $x = -2$",
      "La funzione è derivabile in tutti i punti del suo dominio",
      "$x = -3$ e $x = 0$",
      "$x = -1$"
    ],
    correctAnswer: "La funzione è derivabile in tutti i punti del suo dominio",
    explanation: "La funzione $f(x) = \\sqrt{x^2 + 5x + 6}$ può essere semplificata osservando che $x^2 + 5x + 6 = (x+2)(x+3)$, quindi $f(x) = \\sqrt{(x+2)(x+3)}$.\n\nIl dominio della funzione è $x \\in \\mathbb{R} : (x+2)(x+3) \\geq 0$, quindi $x \\leq -3$ o $x \\geq -2$.\n\nLa funzione $f$ è derivabile in tutti i punti del suo dominio tranne eventualmente nei punti in cui l'argomento della radice si annulla. Ma in questo caso, $x = -3$ e $x = -2$ sono al di fuori del dominio, quindi la funzione è derivabile ovunque nel suo dominio."
  };
  
  // Fetch del quiz
  const { data: quiz, isLoading, error } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
    enabled: isAuthenticated && !demoMode && !!quizId,
  });
  
  // Gestisce il timer per i quiz a tempo
  useEffect(() => {
    if (quiz?.timeLimit && !quizSubmitted) {
      setTimeRemaining(quiz.timeLimit);
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            if (!quizSubmitted) {
              handleSubmitQuiz();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [quiz, quizSubmitted]);
  
  // Timer formatter
  const formatTimeRemaining = (seconds: number | null) => {
    if (seconds === null) return "";
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // In modalità demo, visualizziamo solo una domanda di esempio
  const currentQuestion = demoMode 
    ? demoQuestion 
    : quiz?.questions[currentQuestionIndex];
  
  const handleSelectAnswer = (questionId: number, answer: string) => {
    if (showExplanation || quizSubmitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleVerifyAnswer = () => {
    if (!currentQuestion) return;
    setShowExplanation(true);
  };
  
  const handleNextQuestion = () => {
    setShowExplanation(false);
    
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Ultima domanda, mostra riepilogo
      handleSubmitQuiz();
    }
  };
  
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(false);
    }
  };
  
  const handleSubmitQuiz = async () => {
    if (demoMode) {
      // In modalità demo non facciamo nulla
      return;
    }
    
    try {
      // Calcola il punteggio
      const totalQuestions = quiz?.questions.length || 0;
      let correctAnswers = 0;
      
      quiz?.questions.forEach(question => {
        if (selectedAnswers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      
      // Prepara i dati per l'invio
      const attemptData = {
        quizId: quizId,
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        timeSpent: quiz?.timeLimit ? quiz.timeLimit - (timeRemaining || 0) : null,
        answers: selectedAnswers
      };
      
      // Invia i risultati al backend
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attemptData),
      });
      
      setQuizSubmitted(true);
      
      toast({
        title: "Quiz completato",
        description: `Hai totalizzato ${score}% (${correctAnswers}/${totalQuestions} corrette)`,
      });
      
      // Aggiorna i dati dell'utente in AuthContext
      // Questo avverrà automaticamente alla prossima richiesta all'API
      
      // Redirect alla pagina dei risultati
      if (quizId) {
        // Breve delay per dare tempo al toast di essere visualizzato
        setTimeout(() => {
          setLocation(`/practice/results/${quizId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dei risultati. Riprova più tardi.",
        variant: "destructive"
      });
    }
  };
  
  if (!demoMode && isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-heading">Caricamento quiz...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!demoMode && error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-heading text-red-500">Errore</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Si è verificato un errore nel caricamento del quiz. Riprova più tardi.</p>
          <Button 
            className="mt-4"
            onClick={() => setLocation("/practice")}
          >
            Torna alla pagina pratica
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-heading">
          {demoMode ? "Prova una domanda" : quiz?.title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {timeRemaining !== null && (
            <div className="text-sm font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 px-2 py-1 rounded-md">
              Tempo: {formatTimeRemaining(timeRemaining)}
            </div>
          )}
          <span className="text-sm text-muted-foreground">Difficoltà:</span>
          <Badge variant="outline" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
            Media
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {currentQuestion && (
          <div className="p-5 bg-accent/50 rounded-lg mb-6">
            <QuizQuestion
              question={currentQuestion}
              selectedAnswer={selectedAnswers[currentQuestion.id]}
              onSelectAnswer={(answer) => handleSelectAnswer(currentQuestion.id, answer)}
              showExplanation={showExplanation}
              isPremium={user?.isPremium || false}
              questionNumber={demoMode ? 1 : currentQuestionIndex + 1}
              totalQuestions={demoMode ? 1 : quiz?.questions.length || 0}
            />
            
            {!showExplanation && selectedAnswers[currentQuestion.id] && !quizSubmitted && (
              <div className="flex justify-end mt-5">
                <Button onClick={handleVerifyAnswer}>
                  Verifica risposta
                </Button>
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePreviousQuestion}
            disabled={demoMode || currentQuestionIndex === 0}
          >
            <ArrowLeftCircle className="mr-1.5 h-4 w-4" /> Domanda precedente
          </Button>
          
          {!demoMode && currentQuestionIndex === (quiz?.questions.length || 0) - 1 ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={quizSubmitted}
              className="bg-green-600 hover:bg-green-700"
            >
              Termina quiz
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={demoMode && !showExplanation}
            >
              Domanda successiva <ArrowRightCircle className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizContainer;
