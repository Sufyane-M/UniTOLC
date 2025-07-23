import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/hooks/use-supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Clock, AlertCircle, Timer, CheckCircle2, X } from "lucide-react";

// Types
interface ExamType {
  id: number;
  code: string;
  name: string;
  description: string | null;
  total_duration: number;
  total_sections: number;
}

interface ExamSection {
  id: number;
  exam_type_id: number;
  code: string;
  name: string;
  description: string | null;
  time_limit: number;
  question_count: number;
  sort_order: number;
}

interface Question {
  id: number;
  section_id: number;
  text: string;
  options: { [key: string]: string };
  correct_answer: string;
  explanation: string | null;
  image_url?: string;
  image_alt_text?: string;
}

interface SimulationSession {
  id: number;
  user_id: string;
  exam_type_id: number;
  status: string;
  started_at: string;
  completed_at: string | null;
}

interface SectionAttempt {
  id: number;
  session_id: number;
  section_id: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  time_spent: number | null;
  score: any;
  answers: { [key: string]: string };
}

interface LiveSimulationProps {
  sessionId: number;
  examTypeId: number;
  questions: Question[];
  onComplete: (results: any) => void;
}

const LiveSimulation: React.FC<LiveSimulationProps> = ({
  sessionId,
  examTypeId,
  questions,
  onComplete
}) => {
  // State
  const [loading, setLoading] = useState(true);
  const [examType, setExamType] = useState<ExamType | null>(null);
  const [sections, setSections] = useState<ExamSection[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sectionAttempts, setSectionAttempts] = useState<SectionAttempt[]>([]);
  const [currentSectionQuestions, setCurrentSectionQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [sectionTimeRemaining, setSectionTimeRemaining] = useState(0);
  const [showSectionEndModal, setShowSectionEndModal] = useState(false);
  const [showBreakCountdown, setShowBreakCountdown] = useState(false);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [exitWarningOpen, setExitWarningOpen] = useState(false);
  
  // Hooks and refs
  const { user, supabaseUser } = useAuth();
  const { toast } = useToast();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = useSupabase();
  
  // Initialize session data
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        // Fetch exam type details
        const { data: examTypeData, error: examTypeError } = await supabase
          .from('tolc_exam_types')
          .select('*')
          .eq('id', examTypeId)
          .single();
          
        if (examTypeError) throw examTypeError;
        
        // Fetch exam sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('tolc_exam_sections')
          .select('*')
          .eq('exam_type_id', examTypeId)
          .order('sort_order', { ascending: true });
          
        if (sectionsError) throw sectionsError;
        
        // Fetch section attempts
        const { data: attemptsData, error: attemptsError } = await supabase
          .from('tolc_section_attempts')
          .select('*')
          .eq('session_id', sessionId);
          
        if (attemptsError) throw attemptsError;
        
        // Update state
        setExamType(examTypeData);
        setSections(sectionsData);
        setSectionAttempts(attemptsData);
        
        // Find the current section (either the first or the in-progress one)
        const inProgressAttemptIndex = attemptsData.findIndex(
          (attempt: SectionAttempt) => attempt.status === 'in_progress'
        );
        
        const currentIndex = inProgressAttemptIndex !== -1 ? inProgressAttemptIndex : 0;
        const currentSectionId = sectionsData[currentIndex]?.id;
        
        // Set the current section's questions
        if (currentSectionId) {
          const sectionQuestions = questions.filter(q => q.section_id === currentSectionId);
          setCurrentSectionQuestions(sectionQuestions);
          
          // Set any saved answers
          if (inProgressAttemptIndex !== -1 && attemptsData[inProgressAttemptIndex].answers) {
            setAnswers(attemptsData[inProgressAttemptIndex].answers);
          }
          
          // Set section time remaining
          const timeLimit = sectionsData[currentIndex].time_limit;
          const currentAttempt = attemptsData[currentIndex];
          
          if (currentAttempt.started_at) {
            const startedAt = new Date(currentAttempt.started_at).getTime();
            const now = new Date().getTime();
            const elapsedSeconds = Math.floor((now - startedAt) / 1000);
            const remainingSeconds = Math.max(0, timeLimit * 60 - elapsedSeconds);
            setSectionTimeRemaining(remainingSeconds);
          } else {
            // Start the section if not started yet
            setSectionTimeRemaining(timeLimit * 60);
            startSection(currentAttempt.id, sectionsData[currentIndex].id);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i dati della simulazione",
          variant: "destructive",
        });
      }
    };
    
    fetchSessionData();
    
    // Set up beforeunload listener
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "Sei sicuro di voler lasciare la pagina? Il progresso dell'esame potrebbe essere perso.";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, examTypeId]);
  
  // Start timer when section begins
  useEffect(() => {
    if (sectionTimeRemaining > 0 && !showSectionEndModal && !showBreakCountdown) {
      timerRef.current = setInterval(() => {
        setSectionTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up for this section
            if (timerRef.current) clearInterval(timerRef.current);
            completeSectionDueToTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sectionTimeRemaining, showSectionEndModal, showBreakCountdown]);
  
  // Break timer
  useEffect(() => {
    if (breakTimeRemaining > 0 && showBreakCountdown) {
      breakTimerRef.current = setInterval(() => {
        setBreakTimeRemaining(prev => {
          if (prev <= 1) {
            if (breakTimerRef.current) clearInterval(breakTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    };
  }, [breakTimeRemaining, showBreakCountdown]);
  
  // Mark a section as started
  const startSection = async (attemptId: number, sectionId: number) => {
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('tolc_section_attempts')
        .update({
          started_at: now,
          status: 'in_progress'
        })
        .eq('id', attemptId);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error starting section:', error);
    }
  };
  
  // Complete section when time runs out
  const completeSectionDueToTimeout = () => {
    saveAnswers();
    completeSection();
  };
  
  // Save current answers to the database
  const saveAnswers = useCallback(async () => {
    if (sectionAttempts.length === 0 || currentSectionIndex >= sectionAttempts.length) return;
    
    const currentAttempt = sectionAttempts[currentSectionIndex];
    
    try {
      const { error } = await supabase
        .from('tolc_section_attempts')
        .update({
          answers
        })
        .eq('id', currentAttempt.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error saving answers:', error);
    }
  }, [answers, currentSectionIndex, sectionAttempts]);
  
  // Auto-save answers every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      saveAnswers();
    }, 30000);
    
    return () => clearInterval(autoSaveInterval);
  }, [saveAnswers]);
  
  // Handle answer selection
  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Go to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < currentSectionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      saveAnswers();
      setShowSectionEndModal(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };
  
  // Go to previous question (only within current section)
  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Complete current section and prepare for next
  const completeSection = async () => {
    try {
      // Mark current section as completed
      const currentAttempt = sectionAttempts[currentSectionIndex];
      
      // Calculate score
      const sectionScore = calculateSectionScore();
      
      const { error } = await supabase
        .from('tolc_section_attempts')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          time_spent: sections[currentSectionIndex].time_limit * 60 - sectionTimeRemaining,
          score: sectionScore
        })
        .eq('id', currentAttempt.id);
        
      if (error) throw error;
      
      // Check if this was the last section
      if (currentSectionIndex >= sections.length - 1) {
        // Complete the entire session
        await completeSession();
      } else {
        // Show break countdown (5 minutes max between sections)
        setShowBreakCountdown(true);
        setBreakTimeRemaining(5 * 60); // 5 minutes break
      }
      
    } catch (error) {
      console.error('Error completing section:', error);
      toast({
        title: "Errore",
        description: "Impossibile completare la sezione",
        variant: "destructive",
      });
    }
  };
  
  // Start the next section
  const startNextSection = async () => {
    try {
      // Reset UI state
      setShowSectionEndModal(false);
      setShowBreakCountdown(false);
      setCurrentQuestionIndex(0);
      setAnswers({});
      
      // Move to next section
      const nextSectionIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextSectionIndex);
      
      if (nextSectionIndex < sections.length) {
        // Get next section questions
        const nextSectionId = sections[nextSectionIndex].id;
        const nextSectionQuestions = questions.filter(q => q.section_id === nextSectionId);
        setCurrentSectionQuestions(nextSectionQuestions);
        
        // Set timer for next section
        setSectionTimeRemaining(sections[nextSectionIndex].time_limit * 60);
        
        // Mark next section as started
        const nextAttempt = sectionAttempts[nextSectionIndex];
        await startSection(nextAttempt.id, nextSectionId);
        
        // Update attempt status
        const { error } = await supabase
          .from('tolc_section_attempts')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', nextAttempt.id);
          
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error starting next section:', error);
      toast({
        title: "Errore",
        description: "Impossibile avviare la sezione successiva",
        variant: "destructive",
      });
    }
  };
  
  // Calculate score for the current section
  const calculateSectionScore = () => {
    // Get current section questions
    const sectionQuestions = currentSectionQuestions;
    
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    
    // Count correct answers
    sectionQuestions.forEach(question => {
      const userAnswer = answers[question.id];
      
      if (!userAnswer) {
        unanswered++;
      } else if (userAnswer === question.correct_answer) {
        correct++;
      } else {
        incorrect++;
      }
    });
    
    // Calculate raw score (1 point for correct, -0.25 for wrong, 0 for unanswered)
    const rawScore = correct - (incorrect * 0.25);
    
    return {
      raw: rawScore,
      total_questions: sectionQuestions.length,
      correct,
      incorrect,
      unanswered,
      max_score: sectionQuestions.length
    };
  };
  
  // Complete the entire simulation session
  const completeSession = async () => {
    try {
      // Mark the session as completed
      const { error } = await supabase
        .from('tolc_simulation_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId);
        
      if (error) throw error;
      
      // Get all section attempts with scores
      const { data: attemptsWithScores, error: scoresError } = await supabase
        .from('tolc_section_attempts')
        .select('*')
        .eq('session_id', sessionId);
        
      if (scoresError) throw scoresError;
      
      // Prepare questions summary
      const questionsWithAnswers = questions.map(question => {
        const sectionAttempt = attemptsWithScores.find(
          (attempt) => attempt.section_id === question.section_id
        );
        
        const userAnswerKey = sectionAttempt?.answers?.[question.id] || '';
        const userAnswerText = userAnswerKey ? `${userAnswerKey}: ${question.options[userAnswerKey] || ''}` : '';
        const correctAnswerText = `${question.correct_answer}: ${question.options[question.correct_answer] || ''}`;
        const isCorrect = userAnswerKey === question.correct_answer;
        
        return {
          id: question.id,
          text: question.text,
          userAnswer: userAnswerText,
          correctAnswer: correctAnswerText,
          isCorrect: isCorrect,
          explanation: question.explanation
        };
      });
      
      // Calculate overall statistics
      const totalQuestions = questions.length;
      const totalCorrect = questionsWithAnswers.filter(q => q.isCorrect).length;
      const overallScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
      const totalTimeSpent = attemptsWithScores.reduce(
        (total: number, attempt: any) => total + (attempt.time_spent || 0), 
        0
      );
      
      // Save to quiz_sessions table for analytics
      if (user?.id) {
        const { error: quizSessionError } = await supabase
          .from('quiz_sessions')
          .insert({
            user_id: user.id,
            mode: 'simulation',
            topic_id: null, // Full simulation doesn't have a specific topic
            difficulty: null,
            started_at: new Date(Date.now() - (totalTimeSpent * 1000)).toISOString(),
            completed_at: new Date().toISOString(),
            total_time_seconds: totalTimeSpent,
            score: overallScore,
            max_section_score: 100,
            xp_earned: Math.round(overallScore * 10), // 10 XP per percentage point
            metadata: {
              exam_type: examType?.name,
              totalQuestions: totalQuestions,
              correctAnswers: totalCorrect,
              sections: attemptsWithScores.map((attempt: any) => ({
                section_id: attempt.section_id,
                name: sections.find(s => s.id === attempt.section_id)?.name,
                score: attempt.score,
                time_spent: attempt.time_spent
              }))
            }
          });
          
        if (quizSessionError) {
          console.error('Error saving quiz session:', quizSessionError);
          // Don't throw here, as the main session is already completed
        }
      }
      
      // Calculate total score and compile results
      const results = {
        session_id: sessionId,
        exam_type: examType?.name,
        completion_time: new Date().toISOString(),
        sections: attemptsWithScores.map((attempt: any) => ({
          name: sections.find(s => s.id === attempt.section_id)?.name,
          score: attempt.score,
          time_spent: attempt.time_spent
        })),
        overall_score: attemptsWithScores.reduce(
          (total: number, attempt: any) => total + (attempt.score?.raw || 0), 
          0
        ),
        questions: questionsWithAnswers
      };
      
      // Call the completion callback with results
      onComplete(results);
      
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Errore",
        description: "Impossibile completare la sessione",
        variant: "destructive",
      });
    }
  };
  
  // Handle user trying to exit the simulation
  const handleExitAttempt = () => {
    setExitWarningOpen(true);
  };
  
  // Get current question
  const currentQuestion = currentSectionQuestions[currentQuestionIndex];
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
        <Skeleton className="h-[300px] w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-9 w-[100px]" />
          <Skeleton className="h-9 w-[100px]" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with section info and timer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 bg-muted/30 p-3 rounded-lg">
        <div>
          <h2 className="font-semibold text-lg">
            {sections[currentSectionIndex]?.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Domanda {currentQuestionIndex + 1} di {currentSectionQuestions.length}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
            sectionTimeRemaining < 60 ? 'bg-red-100 text-red-800 animate-pulse dark:bg-red-900/30 dark:text-red-300' : 
            sectionTimeRemaining < 300 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : 
            'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}>
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="font-mono font-semibold" aria-label={`Tempo rimanente: ${formatTime(sectionTimeRemaining)}`}>
              {formatTime(sectionTimeRemaining)}
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleExitAttempt}
            aria-label="Esci dalla simulazione"
          >
            <X className="h-4 w-4 mr-1" aria-hidden="true" />
            Esci
          </Button>
        </div>
      </div>
      
      {/* Progress bar - enhanced with visual markers */}
      <div className="mb-8 relative">
        <Progress 
          value={((currentQuestionIndex + 1) / currentSectionQuestions.length) * 100} 
          className="h-3 mb-2" 
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
          <span>Inizio</span>
          <span>Fine</span>
        </div>
      </div>
      
      {/* Current question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="mb-8 overflow-hidden border shadow-md">
            <CardHeader className="bg-muted/20 border-b py-3">
              <CardTitle className="text-base flex items-center gap-3 text-muted-foreground">
                <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center text-sm">
                  {currentQuestionIndex + 1}
                </Badge>
                <span>Domanda {currentQuestionIndex + 1} di {currentSectionQuestions.length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Question text - enhanced typography for better readability */}
              <div 
                className="prose dark:prose-invert max-w-none mb-10 p-3 text-foreground text-xl font-medium"
                dangerouslySetInnerHTML={{ __html: currentQuestion?.text || "" }}
              />
              
              {/* Question image - display if available */}
              {currentQuestion && currentQuestion.image_url && (
                <div className="mb-8">
                  <img 
                    src={currentQuestion.image_url} 
                    alt={currentQuestion.image_alt_text || "Question image"} 
                    className="max-w-full max-h-[400px] object-contain mx-auto rounded-md border shadow-sm" 
                  />
                  {currentQuestion.image_alt_text && (
                    <p className="text-sm text-muted-foreground mt-2 text-center italic">
                      {currentQuestion.image_alt_text}
                    </p>
                  )}
                </div>
              )}
              
              {/* Options - Enhanced to be more visually prominent */}
              {currentQuestion && (
                <fieldset>
                  <legend className="sr-only">Seleziona una risposta</legend>
                  <RadioGroup
                    value={answers[currentQuestion.id] || ""}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="space-y-5 mt-8"
                    aria-labelledby={`question-${currentQuestion.id}-label`}
                  >
                    {Object.entries(currentQuestion.options).map(([key, value]) => (
                      <div 
                        key={key} 
                        className={`flex items-start space-x-4 p-5 sm:p-6 rounded-lg transition-all ${
                          answers[currentQuestion.id] === key 
                            ? 'border-2 border-primary bg-primary/5 shadow-md transform scale-[1.02]' 
                            : 'border hover:border-muted-foreground/50 hover:bg-muted/30 hover:shadow-sm hover:transform hover:scale-[1.01]'
                        }`}
                      >
                        <RadioGroupItem 
                          value={key} 
                          id={`option-${currentQuestion.id}-${key}`} 
                          className="mt-1.5 h-6 w-6 sm:h-5 sm:w-5 focus:ring-2 focus:ring-primary focus:ring-offset-2" 
                        />
                        <label
                          htmlFor={`option-${currentQuestion.id}-${key}`}
                          className="flex-1 cursor-pointer py-1 min-h-[44px]"
                        >
                          <div className="font-medium text-lg mb-2 flex items-start">
                            <span className="inline-flex items-center justify-center rounded-full bg-muted min-w-7 h-7 text-sm font-medium mr-3 shrink-0" aria-hidden="true">
                              {key}
                            </span>
                            <div
                              className="prose dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ __html: value }}
                            />
                          </div>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </fieldset>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
      
      {/* Navigation buttons - enhanced with focus states and visual feedback */}
      <div className="flex flex-col sm:flex-row justify-between mt-8 gap-4 sm:space-x-4">
        <Button
          variant="outline"
          onClick={goToPrevQuestion}
          disabled={currentQuestionIndex === 0}
          className="min-w-[120px] transition-all focus:ring-2 focus:ring-muted order-2 sm:order-1"
        >
          <span className="mr-2" aria-hidden="true">←</span> Precedente
        </Button>
        
        <div className="flex-1 flex justify-center items-center order-1 sm:order-2">
          <div className="flex gap-1">
            {[...Array(Math.min(currentSectionQuestions.length, 10))].map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-2 rounded-full ${
                  i === currentQuestionIndex % 10 
                    ? 'bg-primary' 
                    : i < currentQuestionIndex % 10 
                      ? 'bg-muted-foreground/40' 
                      : 'bg-muted'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
        
        <Button 
          onClick={goToNextQuestion} 
          className={`min-w-[120px] transition-all order-3 sm:order-3 ${
            answers[currentQuestion?.id] 
              ? 'bg-primary hover:bg-primary/90 shadow-md' 
              : 'bg-primary/70'
          }`}
          aria-label={currentQuestionIndex < currentSectionQuestions.length - 1 ? "Vai alla prossima domanda" : "Completa questa sezione"}
        >
          {currentQuestionIndex < currentSectionQuestions.length - 1 ? (
            <>Successiva <span className="ml-2" aria-hidden="true">→</span></>
          ) : (
            "Completa sezione"
          )}
        </Button>
      </div>
      
      {/* Section end modal */}
      <Dialog open={showSectionEndModal} onOpenChange={setShowSectionEndModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fine sezione: {sections[currentSectionIndex]?.name}</DialogTitle>
            <DialogDescription>
              Hai completato questa sezione dell'esame.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Domande completate:</span>
                <Badge variant="outline" className="ml-auto">
                  {Object.keys(answers).length}/{currentSectionQuestions.length}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tempo utilizzato:</span>
                <Badge variant="outline" className="ml-auto">
                  {formatTime(sections[currentSectionIndex]?.time_limit * 60 - sectionTimeRemaining)}
                </Badge>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <p className="text-sm text-center text-muted-foreground">
              {currentSectionIndex < sections.length - 1 ? (
                "Prossima sezione: " + sections[currentSectionIndex + 1]?.name
              ) : (
                "Questa è l'ultima sezione dell'esame."
              )}
            </p>
          </div>
          
          <DialogFooter>
            <Button onClick={completeSection}>
              {currentSectionIndex < sections.length - 1 ? "Continua" : "Finisci esame"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Break countdown modal */}
      <Dialog open={showBreakCountdown} onOpenChange={setShowBreakCountdown}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pausa tra sezioni</DialogTitle>
            <DialogDescription>
              Puoi prendere una breve pausa prima di iniziare la prossima sezione.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6 flex flex-col items-center justify-center">
            <div className="text-4xl font-mono font-bold mb-4">
              {formatTime(breakTimeRemaining)}
            </div>
            
            <p className="text-sm text-center text-muted-foreground mb-2">
              Prossima sezione: <span className="font-semibold">{sections[currentSectionIndex + 1]?.name}</span>
            </p>
            
            <p className="text-sm text-center text-muted-foreground">
              Durata: {sections[currentSectionIndex + 1]?.time_limit} minuti
            </p>
          </div>
          
          <DialogFooter>
            <Button
              onClick={startNextSection}
              disabled={breakTimeRemaining > 0 && breakTimeRemaining > 295} // Require at least 5 seconds to pass
            >
              {breakTimeRemaining === 0 ? "Inizia sezione" : "Salta pausa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Exit warning dialog */}
      <Dialog open={exitWarningOpen} onOpenChange={setExitWarningOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Attenzione: Uscita simulazione
            </DialogTitle>
            <DialogDescription>
              Sei sicuro di voler uscire dalla simulazione? Il tuo progresso attuale sarà salvato, 
              ma la sezione corrente verrà contrassegnata come incompleta.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setExitWarningOpen(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={() => window.location.href = '/practice'}>
              Esci dalla simulazione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveSimulation;