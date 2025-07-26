import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  BookOpen,
  Target,
  Settings,
  Play,
  Clock,
  BarChart3,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  Home,
  Loader2,
  Timer,
  Brain,
  Trophy,
  Search,
  TrendingUp,
  Filter,
  SortAsc,
  Calendar,
  Activity,
  Zap,
  Star,
  Users,
  Award,
  Flame,
  AlignLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Subject {
  id: number;
  name: string;
  description: string;
}

interface Topic {
  id: number;
  name: string;
  description: string;
  subject_id: number;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation?: string;
  difficulty?: string;
}

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<number, number>;
  questions: Question[];
  startTime: string;
  timeSpent: number;
}

interface StudySession {
  user_id: string;
  topic_id: number;
  subject_id: number;
  quiz_state: QuizState;
  duration: number;
  difficulty: string;
  question_count: number;
  timer_enabled: boolean;
}

interface QuizResults {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  averageTimePerQuestion: number;
  incorrectAnswers: Array<{
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
  }>;
}

const TopicStudyPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Core state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Enhanced subject selection state
  const [subjectFilter, setSubjectFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'progress' | 'topics'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [subjectStats, setSubjectStats] = useState<Record<number, {
    studySessionsCount: number;
    recentSessionsCount: number;
    lastStudyDate: string | null;
    topicsCount: number;
    avgScore?: number;
  }>>({});
  
  // TOLC sections collapse state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  // Quiz configuration
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('media');
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(30);
  
  // Quiz state
  const [quizState, setQuizState] = useState<QuizState | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  
  // Results state
  const [showResults, setShowResults] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null);
  
  // Derived state
  const subjectTopics = useMemo(() => {
    return topics.reduce((acc, topic) => {
      if (!acc[topic.subject_id]) acc[topic.subject_id] = [];
      acc[topic.subject_id].push(topic);
      return acc;
    }, {} as Record<number, Topic[]>);
  }, [topics]);
  
  const filteredTopics = useMemo(() => {
    return selectedSubject ? (subjectTopics[selectedSubject] || []) : [];
  }, [selectedSubject, subjectTopics]);
  
  // Load subjects and topics
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // First load subjects
        const subjectsResponse = await fetch('/api/subjects');
        
        if (subjectsResponse.ok) {
          const subjectsData = await subjectsResponse.json();
          setSubjects(subjectsData);
          
          // Then load topics for each subject
          const allTopics: Topic[] = [];
          const topicsMap: { [key: number]: Topic[] } = {};
          
          for (const subject of subjectsData) {
            try {
              const topicsResponse = await fetch(`/api/topics?subjectId=${subject.id}`);
              if (topicsResponse.ok) {
                const topicsData = await topicsResponse.json();
                allTopics.push(...topicsData);
                topicsMap[subject.id] = topicsData;
              }
            } catch (error) {
              console.error(`Error loading topics for subject ${subject.id}:`, error);
            }
          }
          
          setTopics(allTopics);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Load subject statistics
  useEffect(() => {
    const loadSubjectStats = async () => {
      if (!user || subjects.length === 0) return;
      
      try {
        // Try to get stats from database, fallback to basic data
        const basicStats = subjects.reduce((acc, subject) => {
          acc[subject.id] = {
            studySessionsCount: 0,
            recentSessionsCount: 0,
            lastStudyDate: null,
            topicsCount: subjectTopics[subject.id]?.length || 0
          };
          return acc;
        }, {} as typeof subjectStats);
        
        // Try to get real stats from study_sessions
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('subject_id, date, created_at')
          .eq('user_id', user.id);
          
        if (sessions) {
          sessions.forEach(session => {
            if (basicStats[session.subject_id]) {
              basicStats[session.subject_id].studySessionsCount++;
              
              const sessionDate = new Date(session.date);
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              
              if (sessionDate > weekAgo) {
                basicStats[session.subject_id].recentSessionsCount++;
              }
              
              if (!basicStats[session.subject_id].lastStudyDate || 
                  sessionDate > new Date(basicStats[session.subject_id].lastStudyDate!)) {
                basicStats[session.subject_id].lastStudyDate = session.date;
              }
            }
          });
        }
        
        setSubjectStats(basicStats);
      } catch (error) {
        console.error('Error loading subject stats:', error);
        // Fallback to basic topic count
        const basicStats = subjects.reduce((acc, subject) => {
          acc[subject.id] = {
            studySessionsCount: 0,
            recentSessionsCount: 0,
            lastStudyDate: null,
            topicsCount: subjectTopics[subject.id]?.length || 0
          };
          return acc;
        }, {} as typeof subjectStats);
        setSubjectStats(basicStats);
      }
    };
    
    loadSubjectStats();
  }, [subjects, user, subjectTopics]);
  
  // Timer effect
  useEffect(() => {
    if (!quizState || !timerEnabled || timeRemaining === null) return;
    
    if (timeRemaining <= 0) {
      handleEndQuiz();
      return;
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => prev! - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizState, timerEnabled, timeRemaining]);
  
  // Group subjects by TOLC type
  const subjectsByTolc = useMemo(() => {
    const tolcGroups: Record<string, Subject[]> = {};
    
    subjects.forEach(subject => {
      const examType = subject.exam_type || 'Altro';
      if (!tolcGroups[examType]) {
        tolcGroups[examType] = [];
      }
      tolcGroups[examType].push(subject);
    });
    
    // Sort subjects within each TOLC group
    Object.keys(tolcGroups).forEach(tolcType => {
      tolcGroups[tolcType].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return tolcGroups;
  }, [subjects]);

  // TOLC configuration for styling and descriptions
  const getTolcConfig = (tolcType: string) => {
    const configs: Record<string, { name: string; description: string; color: string }> = {
      'TOLC-I': {
        name: 'TOLC-I - Ingegneria',
        description: 'Test per corsi di laurea in Ingegneria e Scienze',
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      },
      'TOLC-E': {
        name: 'TOLC-E - Economia',
        description: 'Test per corsi di laurea in Economia e Scienze Economiche',
        color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      },
      'TOLC-B': {
        name: 'TOLC-B - Biologia',
        description: 'Test per corsi di laurea in Biologia e Biotecnologie',
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      },
      'TOLC-F': {
        name: 'TOLC-F - Farmacia',
        description: 'Test per corsi di laurea in Farmacia e CTF',
        color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      },
      'TOLC-S': {
        name: 'TOLC-S - Scienze',
        description: 'Test per corsi di laurea in Scienze e Matematica',
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      },
      'TOLC-SU': {
        name: 'TOLC-SU - Studi Umanistici',
        description: 'Test per corsi di laurea in Lettere, Filosofia e Scienze Umanistiche',
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
      },
      'TOLC-PS': {
        name: 'TOLC-PS - Psicologia',
        description: 'Test per corsi di laurea in Psicologia',
        color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
      },
      'Altro': {
        name: 'Altri Test',
        description: 'Test per altri corsi di laurea',
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      }
    };
    
    return configs[tolcType] || configs['Altro'];
  };

  // Toggle TOLC section collapse
  const toggleSection = (tolcType: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [tolcType]: !prev[tolcType]
    }));
  };

  // Filter and sort subjects (kept for compatibility)
  const filteredAndSortedSubjects = useMemo(() => {
    let filtered = subjects.filter(subject => 
      subject.name.toLowerCase().includes(subjectFilter.toLowerCase()) ||
      subject.description.toLowerCase().includes(subjectFilter.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const statsA = subjectStats[a.id] || { studySessionsCount: 0, recentSessionsCount: 0, topicsCount: 0 };
      const statsB = subjectStats[b.id] || { studySessionsCount: 0, recentSessionsCount: 0, topicsCount: 0 };
      
      switch (sortBy) {
        case 'recent':
          return statsB.recentSessionsCount - statsA.recentSessionsCount;
        case 'progress':
          return statsB.studySessionsCount - statsA.studySessionsCount;
        case 'topics':
          return statsB.topicsCount - statsA.topicsCount;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [subjects, subjectFilter, sortBy, subjectStats]);
  
  const getSubjectBadge = (subject: Subject) => {
    const stats = subjectStats[subject.id];
    if (!stats) return null;
    
    if (stats.recentSessionsCount > 0) {
      return { text: 'Recente', color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' };
    }
    if (stats.studySessionsCount > 0) {
      return { text: 'Iniziata', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' };
    }
    return null;
  };
  
  // Handlers
  const handleSubjectSelect = (subjectId: number) => {
    setSelectedSubject(subjectId);
    setSelectedTopic(null);
  };
  
  const handleStartQuiz = async () => {
    if (!selectedTopic || !selectedSubject || !user) return;
    
    try {
      setIsLoading(true);
      
      // Delete any existing sessions for this user
      await supabase
        .from('study_sessions')
        .delete()
        .eq('user_id', user.id);
      
      // Generate questions
      const response = await fetch(`/api/questions/topic/${selectedTopic}?count=${questionCount}&difficulty=${difficulty}`);
      
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }
      
      const questions: Question[] = await response.json();
      
      if (questions.length === 0) {
        alert('Nessuna domanda disponibile per questo argomento.');
        return;
      }
      
      const newQuizState: QuizState = {
        currentQuestionIndex: 0,
        answers: {},
        questions,
        startTime: new Date().toISOString(),
        timeSpent: 0
      };
      
      setQuizState(newQuizState);
      setCurrentAnswer(null);
      setShowExplanation(false);
      
      if (timerEnabled) {
        setTimeRemaining(timerMinutes * 60);
      }
      
      // Save initial session
      const session: StudySession = {
        user_id: user.id,
        topic_id: selectedTopic,
        subject_id: selectedSubject,
        quiz_state: newQuizState,
        duration: 0,
        difficulty,
        question_count: questionCount,
        timer_enabled: timerEnabled
      };
      
      await supabase
        .from('study_sessions')
        .insert(session);
        
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Errore durante l\'avvio del quiz. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save current progress
  const saveProgress = async () => {
    if (!quizState || !selectedTopic || !user) return;
    
    setSavingProgress(true);
    try {
      const currentTime = new Date();
      const startTime = new Date(quizState.startTime);
      const actualDuration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
      
      const updatedSession: StudySession = {
        user_id: user.id,
        topic_id: selectedTopic,
        subject_id: selectedSubject!,
        quiz_state: quizState,
        duration: actualDuration,
        difficulty: difficulty,
        question_count: questionCount,
        timer_enabled: timerEnabled
      };
      
      await supabase
        .from('study_sessions')
        .update(updatedSession)
        .eq('user_id', user.id);
        
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSavingProgress(false);
    }
  };
  
  const handleAnswerSelect = (answerIndex: number) => {
    if (!quizState) return;
    
    setCurrentAnswer(answerIndex);
    
    const updatedQuizState = {
      ...quizState,
      answers: {
        ...quizState.answers,
        [quizState.currentQuestionIndex]: answerIndex
      }
    };
    
    setQuizState(updatedQuizState);
    setShowExplanation(true);
  };
  
  const handleNextQuestion = () => {
    if (!quizState) return;
    
    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      const nextIndex = quizState.currentQuestionIndex + 1;
      const updatedQuizState = {
        ...quizState,
        currentQuestionIndex: nextIndex
      };
      
      setQuizState(updatedQuizState);
      setCurrentAnswer(quizState.answers[nextIndex] || null);
      setShowExplanation(!!quizState.answers[nextIndex]);
    } else {
      handleEndQuiz();
    }
  };
  
  const handlePreviousQuestion = () => {
    if (!quizState || quizState.currentQuestionIndex === 0) return;
    
    const prevIndex = quizState.currentQuestionIndex - 1;
    const updatedQuizState = {
      ...quizState,
      currentQuestionIndex: prevIndex
    };
    
    setQuizState(updatedQuizState);
    setCurrentAnswer(quizState.answers[prevIndex] || null);
    setShowExplanation(!!quizState.answers[prevIndex]);
  };
  
  const handleEndQuiz = () => {
    if (!quizState) return;
    
    const currentTime = new Date();
    const startTime = new Date(quizState.startTime);
    const totalTimeSpent = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
    
    let correctAnswers = 0;
    const incorrectAnswers: QuizResults['incorrectAnswers'] = [];
    
    Object.entries(quizState.answers).forEach(([questionIndex, answerIndex]) => {
      const question = quizState.questions[parseInt(questionIndex)];
      if (answerIndex === question.correct_answer) {
        correctAnswers++;
      } else {
        incorrectAnswers.push({
          question: question.question,
          userAnswer: question.options[answerIndex] || 'Nessuna risposta',
          correctAnswer: question.options[question.correct_answer],
          explanation: question.explanation
        });
      }
    });
    
    const answeredQuestions = Object.keys(quizState.answers).length;
    const score = answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0;
    
    const results: QuizResults = {
      score,
      correctAnswers,
      totalQuestions: quizState.questions.length,
      timeSpent: totalTimeSpent,
      averageTimePerQuestion: answeredQuestions > 0 ? totalTimeSpent / answeredQuestions : 0,
      incorrectAnswers
    };
    
    setQuizResults(results);
    setShowResults(true);
    setQuizState(null);
    setTimeRemaining(null);
  };
  
  const handleNewPractice = () => {
    setShowResults(false);
    setQuizResults(null);
    setSelectedTopic(null);
    setSelectedSubject(null);
    setCurrentAnswer(null);
    setShowExplanation(false);
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getOptionClass = (optionIndex: number, isCorrect: boolean, isSelected: boolean) => {
    if (!showExplanation) {
      return isSelected 
        ? 'border-primary bg-primary/5 text-primary shadow-sm dark:bg-primary/10 dark:border-primary' 
        : 'border-gray-200 bg-white text-gray-900 hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-primary/40 dark:hover:bg-primary/10';
    }
    
    if (isCorrect) {
      return 'border-green-400 bg-green-50 text-green-800 shadow-sm dark:bg-green-900/20 dark:text-green-200 dark:border-green-500';
    }
    
    if (isSelected && !isCorrect) {
      return 'border-red-400 bg-red-50 text-red-800 shadow-sm dark:bg-red-900/20 dark:text-red-200 dark:border-red-500';
    }
    
    return 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };
  
  const getOptionText = (option: any): string => {
    // Se è già una stringa, restituiscila
    if (typeof option === 'string') {
      try {
        const parsed = JSON.parse(option);
        if (typeof parsed === 'string') {
          return parsed;
        } else if (parsed && typeof parsed === 'object' && parsed.text) {
          return parsed.text;
        }
        return option;
      } catch {
        return option;
      }
    }
    
    // Se è un oggetto con proprietà text
    if (option && typeof option === 'object' && option.text) {
      return option.text;
    }
    
    // Fallback: converti a stringa
    return String(option);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Caricamento...</h2>
            <p className="text-muted-foreground">Preparazione della tua esperienza di studio</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Breadcrumb */}
          <motion.nav 
            className="flex items-center space-x-2 text-sm text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button 
              onClick={() => setLocation('/')}
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Studio per Argomenti</span>
          </motion.nav>
          
          {!quizState ? (
            <div className="space-y-12">
              {/* Hero Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-6 mb-12"
              >
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Brain className="h-4 w-4" />
                    Studio Personalizzato
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                    Allenamento per
                    <span className="text-primary block">Argomenti</span>
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Concentrati su argomenti specifici con un approccio personalizzato. 
                    Ricevi feedback immediato, spiegazioni dettagliate e monitora i tuoi progressi 
                    per una preparazione mirata ed efficace.
                  </p>
                </div>
              </motion.div>

              {/* Enhanced Subject Selection by TOLC */}
              <motion.section 
                className="space-y-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {/* Header */}
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <BookOpen className="h-7 w-7 text-primary" />
                      </div>
                      Scegli per TOLC
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                      Seleziona il tipo di TOLC e la materia specifica per una preparazione mirata e contestualizzata
                    </p>
                  </div>
                  
                  {/* Search and Filter Controls */}
                  <div className="max-w-2xl mx-auto space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Cerca materie..."
                        value={subjectFilter}
                        onChange={(e) => setSubjectFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                    
                    {/* Sort Controls */}
                     <div className="flex items-center justify-center gap-4">
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Ordina per:</span>
                        </div>
                       <div className="flex items-center gap-2">
                         <Select value={sortBy} onValueChange={(value: 'name' | 'recent' | 'progress' | 'topics') => setSortBy(value)}>
                           <SelectTrigger className="w-48">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="name">
                               <div className="flex items-center gap-2">
                                 <AlignLeft className="h-4 w-4" />
                                 Nome
                               </div>
                             </SelectItem>
                             <SelectItem value="recent">
                               <div className="flex items-center gap-2">
                                 <Activity className="h-4 w-4" />
                                 Attività Recente
                               </div>
                             </SelectItem>
                             <SelectItem value="progress">
                               <div className="flex items-center gap-2">
                                 <TrendingUp className="h-4 w-4" />
                                 Progressi
                               </div>
                             </SelectItem>
                             <SelectItem value="topics">
                               <div className="flex items-center gap-2">
                                 <Target className="h-4 w-4" />
                                 Numero Argomenti
                               </div>
                             </SelectItem>
                           </SelectContent>
                         </Select>
                         <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-2 h-10 transition-all duration-200"
                              >
                                {sortOrder === 'asc' ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : (
                                  <ArrowDown className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}</p>
                            </TooltipContent>
                          </Tooltip>
                       </div>
                     </div>
                  </div>
                </div>
                
                {/* TOLC Sections */}
                <div className="space-y-8">
                  {Object.entries(subjectsByTolc).map(([tolcType, tolcSubjects], tolcIndex) => {
                    const filteredSubjects = tolcSubjects
                      .filter(subject => 
                        subject.name.toLowerCase().includes(subjectFilter.toLowerCase()) ||
                        subject.description?.toLowerCase().includes(subjectFilter.toLowerCase())
                      )
                      .sort((a, b) => {
                         const statsA = subjectStats[a.id] || { studySessionsCount: 0, recentSessionsCount: 0, topicsCount: 0 };
                         const statsB = subjectStats[b.id] || { studySessionsCount: 0, recentSessionsCount: 0, topicsCount: 0 };
                         
                         let comparison = 0;
                         
                         switch (sortBy) {
                           case 'recent':
                             comparison = statsB.recentSessionsCount - statsA.recentSessionsCount;
                             break;
                           case 'progress':
                             comparison = statsB.studySessionsCount - statsA.studySessionsCount;
                             break;
                           case 'topics':
                             comparison = statsB.topicsCount - statsA.topicsCount;
                             break;
                           default:
                             comparison = a.name.localeCompare(b.name);
                             break;
                         }
                         
                         return sortOrder === 'desc' ? -comparison : comparison;
                       });
                    
                    if (filteredSubjects.length === 0) return null;
                    
                    const tolcConfig = getTolcConfig(tolcType);
                    
                    return (
                      <motion.div
                        key={tolcType}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: tolcIndex * 0.1 }}
                        className="space-y-6"
                      >
                        {/* TOLC Header */}
                        <div 
                          className="flex items-center gap-4 pb-4 border-b border-border/50 cursor-pointer group hover:bg-muted/30 -mx-2 px-2 py-2 rounded-lg transition-colors"
                          onClick={() => toggleSection(tolcType)}
                        >
                          <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${tolcConfig.color}`}>
                            {tolcType}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{tolcConfig.name}</h3>
                            <p className="text-sm text-muted-foreground">{tolcConfig.description}</p>
                          </div>
                          <div className="flex items-center gap-3">
                             <Badge 
                               variant={collapsedSections[tolcType] && filteredSubjects.length > 0 ? "default" : "secondary"} 
                               className={`text-xs transition-colors ${
                                 collapsedSections[tolcType] && filteredSubjects.length > 0 
                                   ? 'bg-primary/10 text-primary border-primary/20' 
                                   : ''
                               }`}
                             >
                               {filteredSubjects.length} materie
                               {collapsedSections[tolcType] && filteredSubjects.length > 0 && (
                                 <span className="ml-1 text-xs opacity-70">(nascoste)</span>
                               )}
                             </Badge>
                             <motion.div
                               animate={{ rotate: collapsedSections[tolcType] ? -90 : 0 }}
                               transition={{ duration: 0.2 }}
                               className="text-muted-foreground group-hover:text-foreground transition-colors"
                             >
                               <ChevronDown className="h-5 w-5" />
                             </motion.div>
                           </div>
                        </div>
                        
                        {/* Subjects Grid for this TOLC */}
                        <AnimatePresence>
                          {!collapsedSections[tolcType] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-6">
                          {filteredSubjects.map((subject, index) => {
                            const stats = subjectStats[subject.id] || { studySessionsCount: 0, recentSessionsCount: 0, topicsCount: 0 };
                            const badge = getSubjectBadge(subject);
                            
                            return (
                              <motion.div
                                key={subject.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                className="h-full"
                              >
                                <Card 
                                  className={`cursor-pointer transition-all duration-200 group h-full flex flex-col ${
                                    selectedSubject === subject.id 
                                      ? 'border-primary bg-primary/5 shadow-md ring-1 ring-primary/20' 
                                      : 'border-border hover:border-primary/30 hover:shadow-sm'
                                  }`}
                                  onClick={() => handleSubjectSelect(subject.id)}
                                >
                                  <CardContent className="p-4 flex flex-col h-full">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-base text-foreground leading-tight mb-1 group-hover:text-primary transition-colors truncate">
                                          {subject.name.replace(` ${tolcType}`, '')}
                                        </h4>
                                        {badge && (
                                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badge.color}`}>
                                            {badge.text}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {selectedSubject === subject.id && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="text-primary bg-primary/10 rounded-full p-1 ml-2 flex-shrink-0"
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </motion.div>
                                      )}
                                    </div>
                                    
                                    {/* Description */}
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 flex-1 line-clamp-2">
                                      {subject.description}
                                    </p>
                                    
                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-primary/10">
                                          <Target className="h-3 w-3 text-primary" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium text-foreground">{stats.topicsCount}</div>
                                          <div className="text-xs text-muted-foreground">argomenti</div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-900/20">
                                          <BarChart3 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium text-foreground">{stats.studySessionsCount}</div>
                                          <div className="text-xs text-muted-foreground">sessioni</div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Footer */}
                                    {stats.lastStudyDate ? (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50 mt-auto">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Ultimo: {formatDistanceToNow(new Date(stats.lastStudyDate), { addSuffix: true, locale: it })}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50 mt-auto">
                                        <ArrowRight className="h-3 w-3 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                                        <span>Inizia ora</span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                           })}
                               </div>
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </motion.div>
                     );
                   })}
                </div>
                
                {/* No Results */}
                {filteredAndSortedSubjects.length === 0 && (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="space-y-3">
                      <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-foreground">Nessuna materia trovata</h3>
                      <p className="text-muted-foreground">Prova a modificare i filtri di ricerca</p>
                    </div>
                  </motion.div>
                )}
              </motion.section>

              {/* Topic Selection */}
              <AnimatePresence>
                {selectedSubject && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-10"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        2
                      </div>
                      <h2 className="text-2xl font-heading font-semibold">Scegli l'Argomento</h2>
                      <Badge variant="secondary" className="ml-auto">
                        {filteredTopics.length} disponibili
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTopics.map((topic, index) => (
                        <motion.div
                          key={topic.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all duration-300 hover:shadow-md group ${
                              selectedTopic === topic.id 
                                ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20' 
                                : 'hover:border-primary/50'
                            }`}
                            onClick={() => setSelectedTopic(topic.id)}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                                    {topic.name}
                                  </CardTitle>
                                  <CardDescription className="mt-1 text-sm line-clamp-2">
                                    {topic.description || `Domande su ${topic.name}`}
                                  </CardDescription>
                                </div>
                                {selectedTopic === topic.id && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="ml-2"
                                  >
                                    <Target className="h-4 w-4 text-primary" />
                                  </motion.div>
                                )}
                              </div>
                            </CardHeader>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Configuration Panel */}
              <AnimatePresence>
                {selectedTopic && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-10"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        3
                      </div>
                      <h2 className="text-2xl font-heading font-semibold">Personalizza la Sessione</h2>
                      <Settings className="h-5 w-5 text-muted-foreground ml-auto" />
                    </div>
                    
                    <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Left Column */}
                          <div className="space-y-6">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <Label htmlFor="question-count" className="text-sm font-medium flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4" />
                                  Numero di Domande
                                </Label>
                                <Badge variant="outline" className="text-xs">
                                  {questionCount} domande
                                </Badge>
                              </div>
                              <Slider
                                id="question-count"
                                min={5}
                                max={40}
                                step={5}
                                value={[questionCount]}
                                onValueChange={(value) => setQuestionCount(value[0])}
                                className="mb-2"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>5 min</span>
                                <span>40 max</span>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="difficulty" className="text-sm font-medium flex items-center gap-2 mb-3">
                                <Target className="h-4 w-4" />
                                Difficoltà
                              </Label>
                              <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="facile">🟢 Facile</SelectItem>
                                  <SelectItem value="media">🟡 Media</SelectItem>
                                  <SelectItem value="difficile">🔴 Difficile</SelectItem>
                                  <SelectItem value="mista">🎯 Mista</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          {/* Right Column */}
                          <div className="space-y-6">
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <Label className="text-sm font-medium flex items-center gap-2">
                                  <Timer className="h-4 w-4" />
                                  Timer
                                </Label>
                                <Switch
                                  checked={timerEnabled}
                                  onCheckedChange={setTimerEnabled}
                                />
                              </div>
                              
                              {timerEnabled && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="space-y-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min={5}
                                      max={120}
                                      value={timerMinutes}
                                      onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 30)}
                                      className="w-20"
                                    />
                                    <span className="text-sm text-muted-foreground">minuti</span>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <div className="text-muted-foreground hover:text-foreground transition-colors">
                                          <Clock className="h-4 w-4" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>TOLC-I: 50 min per 50 domande (1 min/domanda)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                            
                            <div className="pt-4">
                              <Button 
                                onClick={handleStartQuiz}
                                disabled={!selectedTopic || isLoading}
                                size="lg"
                                className="w-full h-12 text-base font-semibold"
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Preparazione...
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-5 w-5" />
                                    Inizia Allenamento
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Live Quiz */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl mx-auto"
            >
              {/* Modern Quiz Header */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                        {topics.find(t => t.id === selectedTopic)?.name}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {subjects.find(s => s.id === selectedSubject)?.name}
                      </p>
                    </div>
                  </div>
                  
                  {timerEnabled && timeRemaining !== null && (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-lg font-bold transition-all ${
                      timeRemaining < 300 
                        ? 'bg-red-50 text-red-700 border-2 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800 animate-pulse' 
                        : 'bg-blue-50 text-blue-700 border-2 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                    }`}>
                      <Timer className="h-5 w-5" />
                      <span>{formatTime(timeRemaining)}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Progress Section */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-6 mb-8 border border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {quizState.currentQuestionIndex + 1}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-foreground">
                        Domanda {quizState.currentQuestionIndex + 1} di {quizState.questions.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round(((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100)}% completato
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <span>{Object.keys(quizState.answers).length} risposte date</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100} 
                    className="h-3 bg-gray-200 dark:bg-gray-700"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Inizio</span>
                    <span>Fine</span>
                  </div>
                </div>
              </div>
              
              {/* Modern Question Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border/50 shadow-xl overflow-hidden mb-8">
                <div className="p-6 sm:p-8 lg:p-10">
                  {/* Question Text */}
                  <div className="mb-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        ?
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground leading-relaxed">
                          {quizState.questions[quizState.currentQuestionIndex].question}
                        </h2>
                      </div>
                    </div>
                  </div>
                  
                  {/* Answer Options */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Seleziona la risposta corretta:
                    </h3>
                    
                    <RadioGroup 
                      value={currentAnswer?.toString() || ''} 
                      onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                      className="space-y-3"
                    >
                      {quizState.questions[quizState.currentQuestionIndex].options.map((option, index) => {
                        const isCorrect = index === quizState.questions[quizState.currentQuestionIndex].correct_answer;
                        const isSelected = currentAnswer === index;
                        const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                        
                        return (
                          <motion.div 
                            key={index} 
                            className="group"
                            whileHover={{ scale: showExplanation ? 1 : 1.02 }}
                            whileTap={{ scale: showExplanation ? 1 : 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-start gap-4">
                              <RadioGroupItem 
                                value={index.toString()} 
                                id={`option-${index}`}
                                disabled={showExplanation}
                                className="mt-2 w-5 h-5"
                              />
                              <Label 
                                htmlFor={`option-${index}`}
                                className={`flex-1 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group-hover:shadow-md ${
                                  getOptionClass(index, isCorrect, isSelected)
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                                    showExplanation && isCorrect 
                                      ? 'bg-green-500 text-white' 
                                      : showExplanation && isSelected && !isCorrect
                                      ? 'bg-red-500 text-white'
                                      : isSelected
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {optionLetter}
                                  </div>
                                  <div className="flex-1 text-base sm:text-lg leading-relaxed">
                                    {getOptionText(option)}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          </motion.div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                    
                  {/* Enhanced Explanation Section */}
                  {showExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="mt-8 pt-8 border-t border-border/50"
                    >
                      <div className="space-y-6">
                        {/* Result Badge */}
                        <div className="flex items-center justify-center">
                          {currentAnswer === quizState.questions[quizState.currentQuestionIndex].correct_answer ? (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-2xl"
                            >
                              <CheckCircle className="h-6 w-6 text-green-600" />
                              <span className="font-bold text-green-700 dark:text-green-300 text-lg">Risposta corretta!</span>
                              <div className="text-2xl">🎉</div>
                            </motion.div>
                          ) : (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl"
                            >
                              <div className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center">
                                <div className="h-3 w-3 bg-white rounded-full" />
                              </div>
                              <span className="font-bold text-red-700 dark:text-red-300 text-lg">Risposta errata</span>
                              <div className="text-2xl">💪</div>
                            </motion.div>
                          )}
                        </div>
                        
                        {/* Explanation Content */}
                        {user?.subscription_type === 'premium' ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                                <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">Spiegazione</h4>
                            </div>
                            <p className="text-blue-800 dark:text-blue-200 leading-relaxed text-base">
                              {quizState.questions[quizState.currentQuestionIndex].explanation || 
                               'Spiegazione non disponibile per questa domanda.'}
                            </p>
                          </motion.div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-2xl border-2 border-amber-200 dark:border-amber-800"
                          >
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50">
                                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                              </div>
                              <h4 className="font-semibold text-amber-900 dark:text-amber-100 text-lg">Spiegazione Premium</h4>
                            </div>
                            <p className="text-amber-800 dark:text-amber-200 mb-4 leading-relaxed">
                              Sblocca spiegazioni dettagliate per ogni domanda e migliora la tua preparazione con contenuti premium.
                            </p>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg"
                            >
                              <Star className="mr-2 h-4 w-4" />
                              Scopri Premium
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Modern Navigation */}
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Left Navigation */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={quizState.currentQuestionIndex === 0}
                      className="flex-1 sm:flex-none h-12 rounded-xl border-2 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <ArrowLeft className="mr-2 h-5 w-5" />
                      <span className="hidden sm:inline">Precedente</span>
                      <span className="sm:hidden">Prec</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleEndQuiz}
                      className="flex-1 sm:flex-none h-12 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:scale-105 transition-all duration-200 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <RotateCcw className="mr-2 h-5 w-5" />
                      <span className="hidden sm:inline">Termina</span>
                      <span className="sm:hidden">Fine</span>
                    </Button>
                  </div>
                  
                  {/* Right Navigation */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {quizState.currentQuestionIndex < quizState.questions.length - 1 ? (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={!showExplanation}
                        className="flex-1 sm:flex-none h-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white border-0 shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 disabled:from-gray-400 disabled:to-gray-500"
                      >
                        <span className="hidden sm:inline">Prossima Domanda</span>
                        <span className="sm:hidden">Prossima</span>
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleEndQuiz}
                        disabled={!showExplanation}
                        className="flex-1 sm:flex-none h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <span className="hidden sm:inline">Completa Quiz</span>
                        <span className="sm:hidden">Completa</span>
                        <CheckCircle className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Progress Indicator */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-center gap-2">
                    {Array.from({ length: quizState.questions.length }, (_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index < quizState.currentQuestionIndex
                            ? 'bg-green-500 scale-110'
                            : index === quizState.currentQuestionIndex
                            ? 'bg-primary scale-125'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {Object.keys(quizState.answers).length} di {quizState.questions.length} risposte date
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Results Modal */}
          <Dialog open={showResults} onOpenChange={setShowResults}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Trophy className="h-6 w-6 text-primary" />
                  Risultati della Sessione
                </DialogTitle>
                <DialogDescription>
                  Ecco come è andata la tua sessione di allenamento
                </DialogDescription>
              </DialogHeader>
              
              {quizResults && (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                      <span className="text-2xl font-bold text-primary">
                        {quizResults.score}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {quizResults.correctAnswers}
                        </div>
                        <div className="text-sm text-muted-foreground">Corrette</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {Object.keys(quizState?.answers || {}).length}
                        </div>
                        <div className="text-sm text-muted-foreground">Risposte</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-foreground">
                          {formatTime(quizResults.timeSpent)}
                        </div>
                        <div className="text-sm text-muted-foreground">Tempo totale</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Tempo medio per domanda: {formatTime(Math.round(quizResults.averageTimePerQuestion))}
                    </div>
                  </div>
                  
                  {/* Error Summary */}
                  {quizResults.incorrectAnswers.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Riepilogo Errori
                      </h3>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {quizResults.incorrectAnswers.map((error, index) => (
                          <div key={index} className="p-3 bg-muted rounded-lg">
                            <div className="text-sm font-medium text-foreground mb-1">
                              {error.question}
                            </div>
                            <div className="text-xs space-y-1">
                              <div className="text-red-600 dark:text-red-400">
                                ❌ La tua risposta: {error.userAnswer}
                              </div>
                              <div className="text-green-600 dark:text-green-400">
                                ✅ Risposta corretta: {error.correctAnswer}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {quizResults.incorrectAnswers.length === 0 && (
                    <div className="text-center py-6">
                      <div className="text-green-600 dark:text-green-400 mb-2">
                        <CheckCircle className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">Perfetto!</h3>
                      <p className="text-sm text-muted-foreground">
                        Hai risposto correttamente a tutte le domande!
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleNewPractice}>
                  Nuova Sessione
                </Button>
                <Button onClick={() => setLocation('/practice')}>
                  Torna alla Pratica
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TopicStudyPage;