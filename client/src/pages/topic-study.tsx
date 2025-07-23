import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  ArrowRight, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  ChevronRight,
  AlertCircle,
  Loader2,
  Crown,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/context/AuthContext";

// Types
type Topic = {
  id: number;
  name: string;
  description: string;
  subject_id: number;
};

type Subject = {
  id: number;
  name: string;
  description: string;
  exam_type: string;
};

type Question = {
  id: number;
  topic_id: number;
  text: string;
  options: { [key: string]: string };
  correct_answer: string;
  explanation: string;
  difficulty: 'facile' | 'media' | 'difficile';
  is_premium: boolean;
};

type QuizState = {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>;
  startTime: Date;
  timePerQuestion: Record<number, number>;
};

type StudySession = {
  id?: number;
  user_id?: number;
  topic_id: number | null;
  subject_id: number | null;
  quiz_state: QuizState | null;
  duration: number;
  difficulty: string;
  question_count: number;
  timer_enabled: boolean;
};

const TopicStudyPage = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<string>("media");
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [timerMinutes, setTimerMinutes] = useState<number>(20);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [existingSessionDialog, setExistingSessionDialog] = useState<boolean>(false);
  const [existingSession, setExistingSession] = useState<StudySession | null>(null);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<boolean>(false);

  // Auto-save timer
  useEffect(() => {
    let autoSaveInterval: NodeJS.Timeout;
    
    if (quizStarted && quizState) {
      autoSaveInterval = setInterval(() => {
        saveProgress();
      }, 120000); // Auto-save every 2 minutes
    }
    
    return () => {
      if (autoSaveInterval) clearInterval(autoSaveInterval);
    };
  }, [quizStarted, quizState]);
  
  // Timer countdown effect
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    
    if (quizStarted && timerEnabled && remainingTime !== null && remainingTime > 0) {
      timerInterval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timerInterval);
            handleQuizEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [quizStarted, timerEnabled, remainingTime]);

  // Load subjects and topics
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');
        
        if (subjectsError) throw subjectsError;
        
        setSubjects(subjectsData || []);
        
        // Fetch topics
        const { data: topicsData, error: topicsError } = await supabase
          .from('topics')
          .select('*');
        
        if (topicsError) throw topicsError;
        
        setTopics(topicsData || []);
        
        // Check for existing session
        await checkExistingSession();
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Filter topics when subject changes
  useEffect(() => {
    if (selectedSubject) {
      setFilteredTopics(topics.filter(topic => topic.subject_id === selectedSubject));
    } else {
      setFilteredTopics(topics);
    }
  }, [selectedSubject, topics]);
  
  // Check if there's an existing session that needs to be resumed
  const checkExistingSession = async () => {
    try {
      if (user) {
        const { data: existingSessionData } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (existingSessionData && existingSessionData.length > 0 && existingSessionData[0].quiz_state) {
          setExistingSession(existingSessionData[0]);
          setExistingSessionDialog(true);
        }
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };
  
  // Handle starting a new quiz
  const handleStartQuiz = async () => {
    if (!selectedTopic) return;
    
    setIsLoading(true);
    try {
      // Fetch questions for the quiz
      const { data: questionsData, error: questionsError } = await supabase.rpc('get_topic_questions', {
        p_topic_id: selectedTopic,
        p_difficulty: difficulty,
        p_limit: questionCount
      });
      
      if (questionsError) throw questionsError;
      
      if (!questionsData || questionsData.length === 0) {
        alert('Non ci sono abbastanza domande disponibili per questo argomento con i criteri selezionati.');
        setIsLoading(false);
        return;
      }
      
      const newQuizState: QuizState = {
        questions: questionsData,
        currentIndex: 0,
        answers: {},
        startTime: new Date(),
        timePerQuestion: {}
      };
      
      setQuizState(newQuizState);
      setQuizStarted(true);
      
      if (timerEnabled) {
        setRemainingTime(timerMinutes * 60);
      }
      
      // Create a new study session
      if (user) {
        const newSession: StudySession = {
          user_id: user.id,
          topic_id: selectedTopic,
          subject_id: selectedSubject,
          quiz_state: newQuizState,
          duration: timerEnabled ? timerMinutes * 60 : 0,
          difficulty: difficulty,
          question_count: questionCount,
          timer_enabled: timerEnabled
        };
        
        await supabase
          .from('study_sessions')
          .insert(newSession);
      }
      
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resume existing session
  const handleResumeSession = () => {
    if (existingSession?.quiz_state) {
      setQuizState(existingSession.quiz_state);
      setQuizStarted(true);
      setSelectedTopic(existingSession.topic_id);
      setSelectedSubject(existingSession.subject_id);
      setExistingSessionDialog(false);
      
      if (existingSession.timer_enabled && existingSession.duration) {
        const elapsedTime = Math.floor((Date.now() - new Date(existingSession.quiz_state.startTime).getTime()) / 1000);
        const remainingSeconds = Math.max(0, existingSession.duration - elapsedTime);
        setRemainingTime(remainingSeconds);
      }
    }
  };
  
  // Start a new session, discarding the previous one
  const handleNewSession = async () => {
    // Delete existing session when starting a new one
    if (existingSession?.id && user) {
      try {
        await supabase
          .from('study_sessions')
          .delete()
          .eq('id', existingSession.id)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error deleting existing session:', error);
      }
    }
    setExistingSessionDialog(false);
  };
  
  // Save current progress
  const saveProgress = async () => {
    if (!quizState || !selectedTopic || !user) return;
    
    setSavingProgress(true);
    try {
      // Calculate actual duration based on start time
      const currentTime = new Date();
      const startTime = new Date(quizState.startTime);
      const actualDuration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
      
      const updatedSession: StudySession = {
        user_id: user.id,
        topic_id: selectedTopic,
        subject_id: selectedSubject,
        quiz_state: quizState,
        duration: actualDuration, // Use actual time spent
        difficulty: difficulty,
        question_count: questionCount,
        timer_enabled: timerEnabled
      };
      
      // Check if a session exists for this user
      const { data: existingSessionData } = await supabase
        .from('study_sessions')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (existingSessionData && existingSessionData.length > 0) {
        // Update existing session
        await supabase
          .from('study_sessions')
          .update(updatedSession)
          .eq('user_id', user.id);
      } else {
        // Insert new session
        await supabase
          .from('study_sessions')
          .insert(updatedSession);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSavingProgress(false);
    }
  };
  
  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (!quizState) return;
    
    const updatedQuizState = { ...quizState };
    const currentTime = new Date();
    const questionStartTime = updatedQuizState.timePerQuestion[updatedQuizState.currentIndex] || 
                            updatedQuizState.startTime.getTime();
    
    // Record time spent on this question
    updatedQuizState.timePerQuestion[updatedQuizState.currentIndex] = 
      Math.round((currentTime.getTime() - questionStartTime) / 1000);
    
    // Save answer
    updatedQuizState.answers[updatedQuizState.currentIndex] = answer;
    
    setQuizState(updatedQuizState);
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (!quizState || quizState.currentIndex >= quizState.questions.length - 1) return;
    
    const updatedQuizState = { ...quizState };
    updatedQuizState.currentIndex += 1;
    
    setQuizState(updatedQuizState);
  };
  
  // Move to previous question
  const handlePrevQuestion = () => {
    if (!quizState || quizState.currentIndex <= 0) return;
    
    const updatedQuizState = { ...quizState };
    updatedQuizState.currentIndex -= 1;
    
    setQuizState(updatedQuizState);
  };
  
  // Handle quiz end
  const handleQuizEnd = async () => {
    await saveProgress();
    
    // Delete the session since quiz is completed
    if (user) {
      try {
        await supabase
          .from('study_sessions')
          .delete()
          .eq('user_id', user.id)
          .eq('topic_id', selectedTopic);
      } catch (error) {
        console.error('Error deleting completed session:', error);
      }
    }
    
    setShowResults(true);
  };
  
  // Calculate results
  const calculateResults = () => {
    if (!quizState) return { 
      score: 0, 
      totalQuestions: 0, 
      answeredQuestions: 0, 
      correctAnswers: 0, 
      incorrectAnswers: 0 
    };
    
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    
    Object.entries(quizState.answers).forEach(([indexStr, answer]) => {
      const index = parseInt(indexStr);
      const question = quizState.questions[index];
      
      if (question.correct_answer === answer) {
        correctAnswers++;
      } else {
        incorrectAnswers++;
      }
    });
    
    const answeredQuestions = Object.keys(quizState.answers).length;
    const score = answeredQuestions > 0 ? (correctAnswers / answeredQuestions) * 100 : 0;
    
    return {
      score: Math.round(score * 10) / 10,
      totalQuestions: quizState.questions.length,
      answeredQuestions,
      correctAnswers,
      incorrectAnswers
    };
  };
  
  // Format time (seconds) to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Reset quiz and go back to configuration
  const handleRestart = () => {
    setQuizStarted(false);
    setQuizState(null);
    setShowResults(false);
  };
  
  // Current question from quiz state
  const currentQuestion = quizState?.questions[quizState.currentIndex];
  
  // Calculate if the current answer is correct
  const isCurrentAnswerCorrect = () => {
    if (!quizState || !currentQuestion) return false;
    
    const userAnswer = quizState.answers[quizState.currentIndex];
    return userAnswer === currentQuestion.correct_answer;
  };
  
  // Get CSS class for option based on correctness
  const getOptionClass = (optionKey: string) => {
    if (!quizState || !currentQuestion) return "";
    
    const userAnswer = quizState.answers[quizState.currentIndex];
    if (!userAnswer) return "";
    
    if (optionKey === currentQuestion.correct_answer) {
      return "bg-green-50 border-green-500 dark:bg-green-900/20";
    } else if (optionKey === userAnswer) {
      return "bg-red-50 border-red-500 dark:bg-red-900/20";
    }
    
    return "";
  };

  // Helper function to safely extract option text
  const getOptionText = (option: any): string => {
    if (typeof option === 'string') {
      return option;
    } else if (option && typeof option === 'object' && 'text' in option) {
      return option.text;
    }
    return String(option);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/practice">Pratica</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Studio per Argomenti</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {!quizStarted ? (
        <>
          {/* Hero Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-3">Studio per Argomenti</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Esercitati su argomenti specifici con spiegazioni dettagliate e feedback immediato.
              Scegli l'argomento, il livello di difficoltà e il numero di domande per una sessione personalizzata.
            </p>
          </div>

          {/* Topic Selector Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Seleziona una materia</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                subjects.map((subject) => (
                  <Card 
                    key={subject.id} 
                    className={`cursor-pointer hover:border-primary transition-all ${
                      selectedSubject === subject.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedSubject(subject.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{subject.name}</CardTitle>
                      <CardDescription>
                        {subject.description || `Argomenti di ${subject.name}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Badge variant="outline">
                        {topics.filter(t => t.subject_id === subject.id).length} argomenti
                      </Badge>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Topic Selection */}
          {selectedSubject && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Seleziona un argomento specifico</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredTopics.map((topic) => (
                  <Card 
                    key={topic.id} 
                    className={`cursor-pointer hover:border-primary transition-all ${
                      selectedTopic === topic.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle>{topic.name}</CardTitle>
                      <CardDescription>
                        {topic.description || `Domande su ${topic.name}`}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Panel */}
          {selectedTopic && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Configurazione</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="question-count" className="mb-2 block">
                        Numero di Domande: {questionCount}
                      </Label>
                      <Slider
                        id="question-count"
                        min={5}
                        max={40}
                        step={5}
                        value={[questionCount]}
                        onValueChange={(value) => setQuestionCount(value[0])}
                        className="mb-6"
                      />
                      
                      <Label htmlFor="difficulty" className="mb-2 block">
                        Livello di Difficoltà
                      </Label>
                      <Select 
                        value={difficulty} 
                        onValueChange={setDifficulty}
                      >
                        <SelectTrigger id="difficulty" className="w-full mb-6">
                          <SelectValue placeholder="Seleziona la difficoltà" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facile">Facile</SelectItem>
                          <SelectItem value="media">Media</SelectItem>
                          <SelectItem value="difficile">Difficile</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-6">
                        <Switch 
                          id="timer-mode" 
                          checked={timerEnabled}
                          onCheckedChange={setTimerEnabled}
                        />
                        <Label htmlFor="timer-mode">Attiva Timer</Label>
                      </div>
                      
                      {timerEnabled && (
                        <div>
                          <Label htmlFor="timer-duration" className="mb-2 block">
                            Durata (minuti): {timerMinutes}
                          </Label>
                          <div className="flex items-center gap-4">
                            <Input
                              id="timer-duration"
                              type="number"
                              min={1}
                              max={120}
                              value={timerMinutes}
                              onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 20)}
                              className="w-24"
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="outline" size="icon" type="button">
                                    <AlertCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Il timer ufficiale TOLC è di circa 1 minuto e 30 secondi per domanda.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Start Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleStartQuiz} 
              disabled={!selectedTopic || isLoading}
              size="lg"
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Inizia Esercitazione <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        /* Live Quiz */
        !showResults ? (
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">
                  {topics.find(t => t.id === selectedTopic)?.name || "Argomento"}
                </h2>
              </div>
              {timerEnabled && remainingTime !== null && (
                <div className={`flex items-center gap-2 ${remainingTime < 60 ? 'text-red-500' : ''}`}>
                  <Clock className="h-5 w-5" />
                  <span className="font-mono">{formatTime(remainingTime)}</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Domanda {quizState ? quizState.currentIndex + 1 : 0} di {quizState?.questions.length || 0}
                </span>
                <span className="text-sm font-medium">
                  {quizState ? Math.round((quizState.currentIndex + 1) / quizState.questions.length * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={quizState ? ((quizState.currentIndex + 1) / quizState.questions.length) * 100 : 0} 
                className="h-2"
              />
            </div>

            {/* Question Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">
                  {currentQuestion?.text || "Caricamento domanda..."}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentQuestion && (
                  <RadioGroup
                    value={quizState?.answers[quizState.currentIndex] || ""}
                    onValueChange={handleAnswerSelect}
                  >
                    <div className="space-y-3">
                      {Object.entries(currentQuestion.options).map(([key, option]) => (
                        <div key={key} className={`flex items-start space-x-3 rounded-md border p-3 ${getOptionClass(key)}`}>
                          <RadioGroupItem value={key} id={`option-${key}`} className="mt-1" />
                          <Label 
                            htmlFor={`option-${key}`} 
                            className="flex-1 cursor-pointer"
                          >
                            {getOptionText(option)}
                          </Label>
                          {quizState?.answers[quizState.currentIndex] && key === currentQuestion.correct_answer && (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Explanation */}
            {currentQuestion && quizState?.answers[quizState.currentIndex] && (
              <Card className="mb-6 bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>Risultato</span>
                    <Badge variant={isCurrentAnswerCorrect() ? "secondary" : "destructive"}>
                      {isCurrentAnswerCorrect() ? "Corretta" : "Errata"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user?.isPremium ? (
                    // Premium user sees the full explanation
                    <>
                      <p className="mb-2">{currentQuestion.explanation}</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Ref: Regolamento CISIA §2.3 - Valutazione delle risposte
                      </p>
                    </>
                  ) : (
                    // Free user sees a premium prompt
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {isCurrentAnswerCorrect() ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <p>
                          {isCurrentAnswerCorrect() 
                            ? "Hai risposto correttamente!" 
                            : "La tua risposta non è corretta."}
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 dark:bg-amber-900/20 dark:border-amber-800">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Crown className="h-6 w-6 text-amber-500 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-amber-800 dark:text-amber-300">
                                Sblocca spiegazioni dettagliate
                              </p>
                              <p className="text-sm text-amber-700 dark:text-amber-400">
                                Passa a Premium per vedere spiegazioni complete per ogni domanda
                              </p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => setLocation("/settings?tab=premium")}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                            size="sm"
                          >
                            <Crown className="mr-2 h-4 w-4" /> Passa a Premium
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={!quizState || quizState.currentIndex === 0}
              >
                Precedente
              </Button>

              <div className="flex gap-2">
                {savingProgress && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Salvataggio...
                  </span>
                )}

                <Button 
                  variant="outline" 
                  onClick={saveProgress}
                  disabled={savingProgress}
                >
                  Salva Progresso
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleQuizEnd}
                  className="gap-2"
                >
                  Termina Sessione
                </Button>
              </div>

              {quizState && quizState.currentIndex < quizState.questions.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!quizState}
                  className="gap-2"
                >
                  Prossima <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleQuizEnd} className="gap-2">
                  Termina <CheckCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Results Modal */
          <div>
            <Dialog open={showResults} onOpenChange={setShowResults}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Risultati dell'Esercitazione</DialogTitle>
                  <DialogDescription>
                    Ecco un riassunto della tua performance in questa sessione.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  {/* Score summary */}
                  <div className="text-center mb-6">
                    <span className="text-6xl font-bold text-primary">
                      {calculateResults().score}%
                    </span>
                    <p className="text-muted-foreground">
                      Risposte corrette: {calculateResults().correctAnswers} su {calculateResults().answeredQuestions}
                    </p>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Domande Risposte</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-semibold">
                          {calculateResults().answeredQuestions} / {calculateResults().totalQuestions}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {calculateResults().answeredQuestions === calculateResults().totalQuestions 
                            ? "Hai completato tutte le domande" 
                            : `${(calculateResults().totalQuestions || 0) - (calculateResults().answeredQuestions || 0)} domande non risposte`}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Tempo Medio per Domanda</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {quizState && (
                          <div className="text-2xl font-semibold">
                            {Object.values(quizState.timePerQuestion).length 
                              ? Math.round(Object.values(quizState.timePerQuestion).reduce((a, b) => a + b, 0) / 
                                  Object.values(quizState.timePerQuestion).length) 
                              : 0} sec
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground">
                          Il tempo ideale è 1:30 min per domanda nel TOLC
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Error table summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Riepilogo Errori</h3>
                    {calculateResults().incorrectAnswers > 0 ? (
                      <div className="rounded-md border overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                          <thead className="bg-muted/50">
                            <tr>
                              <th className="px-4 py-2 text-left text-sm font-semibold">Domanda</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold">Tua Risposta</th>
                              <th className="px-4 py-2 text-left text-sm font-semibold">Risposta Corretta</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {quizState && Object.entries(quizState.answers).map(([indexStr, answer]) => {
                              const index = parseInt(indexStr);
                              const question = quizState.questions[index];
                              
                              if (answer !== question.correct_answer) {
                                return (
                                  <tr key={index}>
                                    <td className="px-4 py-2 text-sm">
                                      {question.text.length > 60 
                                        ? `${question.text.substring(0, 60)}...` 
                                        : question.text}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-red-500">
                                      {getOptionText(question.options[answer])}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-green-500">
                                      {getOptionText(question.options[question.correct_answer])}
                                    </td>
                                  </tr>
                                );
                              }
                              return null;
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-muted/20 rounded-md">
                        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                        <p className="text-lg font-medium">Ottimo lavoro! Nessun errore.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={handleRestart}>
                    Nuova Esercitazione
                  </Button>
                  <Button onClick={() => setLocation("/practice")}>
                    Torna alla Pagina Pratica
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )
      )}
      
      {/* Existing Session Dialog */}
      <Dialog open={existingSessionDialog} onOpenChange={setExistingSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sessione esistente</DialogTitle>
            <DialogDescription>
              È stata trovata una sessione di studio precedente non completata.
              Vuoi riprenderla o iniziare una nuova sessione?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {existingSession && (
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Dettagli sessione</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div>
                    <span className="font-semibold">Argomento:</span>{" "}
                    {topics.find(t => t.id === existingSession.topic_id)?.name || "Sconosciuto"}
                  </div>
                  <div>
                    <span className="font-semibold">Completamento:</span>{" "}
                    {existingSession.quiz_state ? 
                      `${Object.keys(existingSession.quiz_state.answers).length} di ${existingSession.quiz_state.questions.length} domande`
                      : "0%"
                    }
                  </div>
                  <div>
                    <span className="font-semibold">Ultima modifica:</span>{" "}
                    {new Date(existingSession.quiz_state?.startTime || Date.now()).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleNewSession}>
              Nuova sessione
            </Button>
            <Button onClick={handleResumeSession}>
              Riprendi sessione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopicStudyPage;