import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, 
  XCircle, 
  Clock, 
  BarChart3, 
  ArrowRight, 
  RefreshCw, 
  ListChecks, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen,
  Trophy,
  Target,
  TrendingUp,
  Home
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Types
interface SectionResult {
  name: string;
  score: {
    raw: number;
    total_questions: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    max_score: number;
  };
  time_spent: number;
}

interface SimulationResults {
  session_id: number;
  exam_type: string;
  completion_time: string;
  sections: SectionResult[];
  overall_score: number;
  questions?: QuestionSummaryItem[];
}

interface QuestionSummaryItem {
  id: number;
  text: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  topic?: string;
  subject?: string;
}

const ResultsPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const [questionFilter, setQuestionFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');
  const [results, setResults] = useState<SimulationResults | null>(null);
  const questionsPerPage = 10;
  
  // Get results from localStorage or state management
  useEffect(() => {
    const savedResults = localStorage.getItem('simulationResults');
    if (savedResults) {
      setResults(JSON.parse(savedResults));
    } else {
      // Redirect to practice if no results found
      setLocation('/practice');
    }
  }, [setLocation]);
  
  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [questionFilter]);
  
  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento risultati...</p>
        </div>
      </div>
    );
  }
  
  // Calculate overall statistics
  const totalQuestions = results.sections.reduce((sum, section) => sum + section.score.total_questions, 0);
  const totalCorrect = results.sections.reduce((sum, section) => sum + section.score.correct, 0);
  const totalIncorrect = results.sections.reduce((sum, section) => sum + section.score.incorrect, 0);
  const totalUnanswered = results.sections.reduce((sum, section) => sum + section.score.unanswered, 0);
  const maxPossibleScore = results.sections.reduce((sum, section) => sum + section.score.max_score, 0);
  const percentageScore = Math.round((results.overall_score / maxPossibleScore) * 100);
  
  // Calculate time spent
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  // Prepare chart data
  const accuracyData = results.sections.map(section => ({
    name: section.name,
    correct: Math.round((section.score.correct / section.score.total_questions) * 100),
    incorrect: Math.round((section.score.incorrect / section.score.total_questions) * 100),
    unanswered: Math.round((section.score.unanswered / section.score.total_questions) * 100),
  }));
  
  const timeData = results.sections.map(section => ({
    name: section.name,
    seconds_per_question: Math.round(section.time_spent / section.score.total_questions),
    time_spent: section.time_spent,
  }));
  
  // Identify strengths and weaknesses
  const sectionPerformance = results.sections.map(section => ({
    name: section.name,
    score: section.score.raw,
    maxScore: section.score.max_score,
    percentage: Math.round((section.score.raw / section.score.max_score) * 100)
  })).sort((a, b) => b.percentage - a.percentage);
  
  const strengths = sectionPerformance.slice(0, 2);
  const weaknesses = [...sectionPerformance].sort((a, b) => a.percentage - b.percentage).slice(0, 2);
  
  // Filter questions based on selected filter
  const filteredQuestions = results.questions ? results.questions.filter(question => {
    switch (questionFilter) {
      case 'correct':
        return question.isCorrect;
      case 'incorrect':
        return !question.isCorrect && question.userAnswer && question.userAnswer.trim() !== '';
      case 'unanswered':
        return !question.userAnswer || question.userAnswer.trim() === '';
      default:
        return true;
    }
  }) : [];
  
  // Calculate pagination values for question summary
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const paginatedQuestions = filteredQuestions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  // Get performance level and color
  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 85) return { level: 'Eccellente', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (percentage >= 70) return { level: 'Buono', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
    if (percentage >= 60) return { level: 'Sufficiente', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20' };
    return { level: 'Da migliorare', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-900/20' };
  };

  const performance = getPerformanceLevel(percentageScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section */}
      <div className="bg-card border-b">
        <div className="container mx-auto px-4 py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Risultati Simulazione</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              TOLC {results.exam_type} - Completata il {new Date(results.completion_time).toLocaleDateString('it-IT')}
            </p>
            
            {/* Quick Navigation */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => setLocation('/')}>
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={() => setLocation('/practice')}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Nuova Simulazione
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Overall Score Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="overflow-hidden">
            <div className={`${performance.bgColor} p-6`}>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Target className="h-8 w-8 text-primary" />
                  <h2 className="text-2xl font-bold">Punteggio Complessivo</h2>
                </div>
                
                <div className="space-y-2">
                  <div className="text-5xl font-bold">
                    {results.overall_score.toFixed(2)}
                    <span className="text-2xl text-muted-foreground ml-2">/ {maxPossibleScore.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <Badge className={`${performance.color} text-lg px-4 py-2`} variant="secondary">
                      {percentageScore}%
                    </Badge>
                    <Badge className={`${performance.color} text-lg px-4 py-2`} variant="outline">
                      {performance.level}
                    </Badge>
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{totalCorrect}</div>
                    <div className="text-sm text-muted-foreground">Corrette</div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{totalIncorrect}</div>
                    <div className="text-sm text-muted-foreground">Errate</div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
                    <div className="h-6 w-6 mx-auto mb-2 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold text-lg">-</div>
                    <div className="text-2xl font-bold">{totalUnanswered}</div>
                    <div className="text-sm text-muted-foreground">Non risposte</div>
                  </div>
                  
                  <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4 text-center">
                    <Clock className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold font-mono">
                      {formatTime(results.sections.reduce((sum, section) => sum + section.time_spent, 0))}
                    </div>
                    <div className="text-sm text-muted-foreground">Tempo totale</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs defaultValue="sections" className="space-y-6">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1">
              <TabsTrigger value="sections" className="flex items-center gap-2 py-3">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Sezioni</span>
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-2 py-3">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Grafici</span>
              </TabsTrigger>
              <TabsTrigger value="analysis" className="flex items-center gap-2 py-3">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Analisi</span>
              </TabsTrigger>
              <TabsTrigger value="question-summary" className="flex items-center gap-2 py-3">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Domande</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Section Scores Tab */}
            <TabsContent value="sections" className="space-y-4">
              <div className="grid gap-4">
                {results.sections.map((section, index) => {
                  const sectionPercentage = Math.round((section.score.raw / section.score.max_score) * 100);
                  const sectionPerf = getPerformanceLevel(sectionPercentage);
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{section.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge className={sectionPerf.color} variant="secondary">
                                {sectionPercentage}%
                              </Badge>
                              <Badge variant="outline">
                                {section.score.raw.toFixed(2)} / {section.score.max_score}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {section.score.correct}
                              </div>
                              <div className="text-sm text-muted-foreground">Corrette</div>
                            </div>
                            
                            <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                                {section.score.incorrect}
                              </div>
                              <div className="text-sm text-muted-foreground">Errate</div>
                            </div>
                            
                            <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="text-lg font-bold">
                                {section.score.unanswered}
                              </div>
                              <div className="text-sm text-muted-foreground">Non risposte</div>
                            </div>
                            
                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <div className="text-lg font-bold font-mono text-primary">
                                {formatTime(section.time_spent)}
                              </div>
                              <div className="text-sm text-muted-foreground">Tempo</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
            
            {/* Charts Tab */}
            <TabsContent value="charts" className="space-y-6">
              {/* Performance Overview Chart */}
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2 border-0 shadow-lg bg-gradient-to-br from-card via-card to-muted/5">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl font-semibold">
                            Panoramica Performance
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Analisi dettagliata delle tue performance per sezione
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"></div>
                          <span className="text-muted-foreground">Corrette</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400"></div>
                          <span className="text-muted-foreground">Errate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-500 to-slate-400"></div>
                          <span className="text-muted-foreground">Non risposte</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ResponsiveContainer width="100%" height={450}>
                      <BarChart 
                        data={accuracyData} 
                        margin={{ top: 30, right: 40, left: 40, bottom: 60 }}
                        barCategoryGap="20%"
                      >
                        <defs>
                          <linearGradient id="correctGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="incorrectGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                          </linearGradient>
                          <linearGradient id="unansweredGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#64748b" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#475569" stopOpacity={0.8}/>
                          </linearGradient>
                          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
                          </filter>
                        </defs>
                        <CartesianGrid 
                          strokeDasharray="2 4" 
                          stroke="#e2e8f0" 
                          strokeOpacity={0.6}
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
                          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          tickLine={false}
                          interval={0}
                          angle={window.innerWidth < 768 ? -45 : 0}
                          textAnchor={window.innerWidth < 768 ? 'end' : 'middle'}
                          height={window.innerWidth < 768 ? 80 : 60}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                          tickLine={false}
                          tickFormatter={(value) => `${value}%`}
                          width={50}
                        />

                        <Bar 
                          dataKey="correct" 
                          name="Corrette" 
                          fill="url(#correctGradient)"
                          radius={[2, 2, 0, 0]}
                          strokeWidth={0}
                          filter="url(#shadow)"
                        >
                          <LabelList 
                            dataKey="correct" 
                            position="center" 
                            formatter={(v: any) => v > 8 ? `${v}%` : ''} 
                            fill="#ffffff"
                            fontSize={11}
                            fontWeight={700}
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                          />
                        </Bar>
                        <Bar 
                          dataKey="incorrect" 
                          name="Errate" 
                          fill="url(#incorrectGradient)"
                          radius={[2, 2, 0, 0]}
                          strokeWidth={0}
                          filter="url(#shadow)"
                        >
                          <LabelList 
                            dataKey="incorrect" 
                            position="center" 
                            formatter={(v: any) => v > 8 ? `${v}%` : ''} 
                            fill="#ffffff"
                            fontSize={11}
                            fontWeight={700}
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                          />
                        </Bar>
                        <Bar 
                          dataKey="unanswered" 
                          name="Non risposte" 
                          fill="url(#unansweredGradient)"
                          radius={[2, 2, 0, 0]}
                          strokeWidth={0}
                          filter="url(#shadow)"
                        >
                          <LabelList 
                            dataKey="unanswered" 
                            position="center" 
                            formatter={(v: any) => v > 8 ? `${v}%` : ''} 
                            fill="#ffffff"
                            fontSize={11}
                            fontWeight={700}
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    
                    {/* Mobile Legend */}
                    <div className="sm:hidden flex justify-center gap-6 mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"></div>
                        <span className="text-xs text-muted-foreground">Corrette</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-400"></div>
                        <span className="text-xs text-muted-foreground">Errate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-500 to-slate-400"></div>
                        <span className="text-xs text-muted-foreground">Non risposte</span>
                      </div>
                    </div>
                    
                    {/* Performance Summary */}
                    <div className="mt-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {Math.round((totalCorrect / totalQuestions) * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Precisione media</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                            {totalQuestions}
                          </div>
                          <div className="text-xs text-muted-foreground">Domande totali</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {results.sections.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Sezioni</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {Math.round((totalUnanswered / totalQuestions) * 100)}%
                          </div>
                          <div className="text-xs text-muted-foreground">Non completate</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis Charts */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Time Efficiency Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Efficienza Temporale
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tempo medio per domanda in ogni sezione
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <defs>
                          <linearGradient id="timeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          axisLine={{ stroke: '#d1d5db' }}
                          tickLine={{ stroke: '#d1d5db' }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#6b7280' }}
                          axisLine={{ stroke: '#d1d5db' }}
                          tickLine={{ stroke: '#d1d5db' }}
                          label={{ value: 'Secondi', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6b7280' } }}
                        />

                        <Bar 
                          dataKey="seconds_per_question" 
                          fill="url(#timeGradient)"
                          radius={[4, 4, 0, 0]}
                          strokeWidth={1}
                          stroke="#2563eb"
                        >
                          <LabelList 
                            dataKey="seconds_per_question" 
                            position="top" 
                            formatter={(v: any) => `${v}s`} 
                            fill="#374151"
                            fontSize={11}
                            fontWeight={600}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Performance Radar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Analisi Prestazioni
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Distribuzione delle tue performance
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.sections.map((section, index) => {
                        const sectionPercentage = Math.round((section.score.raw / section.score.max_score) * 100);
                        const getPerformanceColor = (perc: number) => {
                          if (perc >= 85) return { bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', bar: 'bg-green-500' };
                          if (perc >= 70) return { bg: 'bg-blue-100 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', bar: 'bg-blue-500' };
                          if (perc >= 60) return { bg: 'bg-amber-100 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', bar: 'bg-amber-500' };
                          return { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', bar: 'bg-red-500' };
                        };
                        const colors = getPerformanceColor(sectionPercentage);
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className={`p-4 rounded-lg ${colors.bg}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{section.name}</span>
                              <span className={`font-bold text-lg ${colors.text}`}>
                                {sectionPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                              <motion.div
                                className={`h-2 rounded-full ${colors.bar}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${sectionPercentage}%` }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{section.score.correct}/{section.score.total_questions} corrette</span>
                              <span>{formatTime(section.time_spent)}</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Insights and Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Insights e Raccomandazioni
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Analisi dettagliata delle tue performance
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Performance Insights */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Analisi Performance
                      </h4>
                      
                      {/* Best Section */}
                      {strengths.length > 0 && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-green-700 dark:text-green-300">Miglior Performance</span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            <strong>{strengths[0].name}</strong> con {strengths[0].percentage}% di successo
                          </p>
                        </div>
                      )}
                      
                      {/* Worst Section */}
                      {weaknesses.length > 0 && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="flex items-center gap-2 mb-2">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="font-medium text-red-700 dark:text-red-300">Area da Migliorare</span>
                          </div>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            <strong>{weaknesses[0].name}</strong> con {weaknesses[0].percentage}% di successo
                          </p>
                        </div>
                      )}
                      
                      {/* Time Analysis */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-medium text-blue-700 dark:text-blue-300">Gestione del Tempo</span>
                        </div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Tempo medio: {Math.round(results.sections.reduce((sum, s) => sum + s.time_spent, 0) / results.sections.reduce((sum, s) => sum + s.score.total_questions, 0))} secondi per domanda
                        </p>
                      </div>
                    </div>
                    
                    {/* Actionable Recommendations */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Raccomandazioni
                      </h4>
                      
                      <div className="space-y-3">
                        {weaknesses.slice(0, 2).map((weakness, index) => (
                          <div key={index} className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-2">
                              <ArrowRight className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-amber-700 dark:text-amber-300 text-sm">
                                  Concentrati su {weakness.name}
                                </p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                  Dedica più tempo allo studio di questa sezione per migliorare dal {weakness.percentage}% attuale.
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-start gap-2">
                            <BookOpen className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-purple-700 dark:text-purple-300 text-sm">
                                Strategia di Studio
                              </p>
                              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                Utilizza la sezione "Studio per argomenti" per approfondire le aree più deboli.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-700 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Punti di forza
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {strengths.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="font-medium">{section.name}</span>
                          </div>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            {section.percentage}%
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Weaknesses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Aree da migliorare
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weaknesses.map((section, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <span className="font-medium">{section.name}</span>
                          </div>
                          <Badge className={
                            section.percentage < 30 ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : 
                            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          }>
                            {section.percentage}%
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Consigli per il miglioramento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weaknesses.map((section, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg"
                      >
                        <ArrowRight className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                        <div>
                          <p className="font-medium mb-1">Migliora in {section.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Dedica più tempo allo studio di questa sezione. 
                            Utilizza i materiali didattici della sezione "Studio per argomenti" per migliorare in questa area.
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: weaknesses.length * 0.1 }}
                      className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                    >
                      <Clock className="h-5 w-5 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1 text-blue-700 dark:text-blue-300">Gestione del tempo</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Nelle sezioni con più risposte non date, cerca di velocizzare la lettura e comprensione delle domande.
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Question Summary Tab */}
            <TabsContent value="question-summary">
              <div className="space-y-6">
                {/* Header with Statistics */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <ListChecks className="h-6 w-6" />
                        Riepilogo Domande
                      </CardTitle>
                      {user?.isPremium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-amber-400 text-white px-3 py-1">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Enhanced Summary Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">{totalQuestions}</div>
                        <div className="text-base text-gray-600 dark:text-gray-400 mt-2">Domande totali</div>
                      </div>
                      <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">{totalCorrect}</div>
                        <div className="text-base text-gray-600 dark:text-gray-400 mt-2">Corrette</div>
                      </div>
                      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">{totalIncorrect}</div>
                        <div className="text-base text-gray-600 dark:text-gray-400 mt-2">Errate</div>
                      </div>
                      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                        <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">{Math.round((totalCorrect / totalQuestions) * 100)}%</div>
                        <div className="text-base text-gray-600 dark:text-gray-400 mt-2">Successo</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Filters and Navigation */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                      {/* Filter Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant={questionFilter === 'all' ? 'default' : 'outline'}
                          onClick={() => setQuestionFilter('all')}
                          className="text-base px-4 py-2"
                        >
                          Tutte ({results.questions?.length || 0})
                        </Button>
                        <Button
                          variant={questionFilter === 'correct' ? 'default' : 'outline'}
                          onClick={() => setQuestionFilter('correct')}
                          className={`text-base px-4 py-2 ${questionFilter === 'correct' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-600 text-green-600 hover:bg-green-50'}`}
                        >
                          Corrette ({totalCorrect})
                        </Button>
                        <Button
                          variant={questionFilter === 'incorrect' ? 'default' : 'outline'}
                          onClick={() => setQuestionFilter('incorrect')}
                          className={`text-base px-4 py-2 ${questionFilter === 'incorrect' ? 'bg-red-600 hover:bg-red-700 text-white' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                        >
                          Errate ({totalIncorrect})
                        </Button>
                        <Button
                          variant={questionFilter === 'unanswered' ? 'default' : 'outline'}
                          onClick={() => setQuestionFilter('unanswered')}
                          className={`text-base px-4 py-2 ${questionFilter === 'unanswered' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'border-gray-600 text-gray-600 hover:bg-gray-50'}`}
                        >
                          Non risposte ({totalQuestions - totalCorrect - totalIncorrect})
                        </Button>
                      </div>
                      
                      {/* Quick Navigation */}
                      <div className="flex items-center gap-3">
                        <span className="text-base text-gray-600 dark:text-gray-400">Vai alla domanda:</span>
                        <select 
                          className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-base min-w-[100px]"
                          onChange={(e) => {
                            const questionNum = parseInt(e.target.value);
                            if (questionNum) {
                              const targetPage = Math.floor((questionNum - 1) / questionsPerPage);
                              setCurrentPage(targetPage);
                              // Scroll to question after a brief delay
                              setTimeout(() => {
                                const element = document.getElementById(`question-${questionNum}`);
                                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }, 100);
                            }
                          }}
                          value=""
                        >
                          <option value="">Seleziona</option>
                          {Array.from({ length: totalQuestions }, (_, i) => (
                            <option key={i + 1} value={i + 1}>#{i + 1}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Questions List */}
                {!results.questions || results.questions.length === 0 ? (
                  <Card>
                    <CardContent className="p-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-3">Nessun dato disponibile</h3>
                        <p className="text-base text-muted-foreground max-w-md mx-auto">
                          Il riepilogo dettagliato delle domande non è disponibile per questa simulazione.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {/* Questions Grid */}
                    <div className="space-y-8">
                      {paginatedQuestions.map((question, idx) => {
                        const originalIndex = results.questions?.findIndex(q => q === question) || 0;
                        const questionNumber = originalIndex + 1;
                        const isCorrect = question.isCorrect;
                        const hasUserAnswer = question.userAnswer && question.userAnswer.trim() !== '';
                        
                        return (
                          <motion.div
                            key={`question-${questionNumber}`}
                            id={`question-${questionNumber}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                          >
                            <Card className="transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
                              {/* Status Header - Primo elemento */}
                              <div className={`px-8 py-6 border-b-2 ${
                                isCorrect 
                                  ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700'
                                  : hasUserAnswer 
                                    ? 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700'
                                    : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 border-gray-200 dark:border-gray-600'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={`flex items-center justify-center w-14 h-14 rounded-full font-bold text-lg ${
                                      isCorrect 
                                        ? 'bg-green-600 text-white'
                                        : hasUserAnswer 
                                          ? 'bg-red-600 text-white'
                                          : 'bg-gray-500 text-white'
                                    }`}>
                                      #{questionNumber}
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {isCorrect ? (
                                        <>
                                          <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
                                          <span className="text-2xl font-bold text-green-700 dark:text-green-300">Risposta Corretta</span>
                                        </>
                                      ) : hasUserAnswer ? (
                                        <>
                                          <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
                                          <span className="text-2xl font-bold text-red-700 dark:text-red-300">Risposta Errata</span>
                                        </>
                                      ) : (
                                        <>
                                          <Clock className="h-7 w-7 text-gray-600 dark:text-gray-400" />
                                          <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">Non Risposta</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  {/* Topic badges se presenti */}
                                  {(question.topic || question.subject) && (
                                    <div className="flex flex-wrap gap-2">
                                      {question.subject && (
                                        <Badge className="px-3 py-1 text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                          {question.subject}
                                        </Badge>
                                      )}
                                      {question.topic && (
                                        <Badge className="px-3 py-1 text-sm bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                                          {question.topic}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <CardContent className="p-8 space-y-10">
                                {/* Testo della Domanda - Focus principale */}
                                <div className="space-y-6">
                                  <div className="text-center">
                                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight mb-8">
                                      Domanda
                                    </h2>
                                  </div>
                                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                                    <div 
                                      className="prose prose-2xl max-w-none dark:prose-invert leading-relaxed text-gray-900 dark:text-gray-100 font-medium text-xl sm:text-2xl text-center"
                                      dangerouslySetInnerHTML={{ __html: question.text }} 
                                    />
                                  </div>
                                </div>

                                {/* Risposta Selezionata dall'Utente */}
                                <div className="space-y-6">
                                  <div className="flex items-center gap-3 mb-4">
                                    {isCorrect ? (
                                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    ) : hasUserAnswer ? (
                                      <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                                    ) : (
                                      <Clock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    )}
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                      La Tua Risposta
                                    </h3>
                                  </div>
                                  <div className={`p-6 rounded-xl border-2 shadow-sm ${
                                    isCorrect 
                                      ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                      : hasUserAnswer 
                                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600'
                                  }`}>
                                    {hasUserAnswer ? (
                                      <div 
                                        className="prose prose-lg max-w-none dark:prose-invert text-gray-800 dark:text-gray-200 font-medium text-lg leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: question.userAnswer }} 
                                      />
                                    ) : (
                                      <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <Clock className="h-5 w-5" />
                                        <span className="text-lg font-medium italic">Domanda non risposta nel tempo disponibile</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Risposta Corretta - Solo se l'utente ha sbagliato */}
                                {!isCorrect && (
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                      <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
                                        Risposta Corretta
                                      </h3>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-sm">
                                      <div 
                                        className="prose prose-lg max-w-none dark:prose-invert text-green-800 dark:text-green-200 font-semibold text-lg leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: question.correctAnswer }} 
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Spiegazione Dettagliata */}
                                {user?.isPremium && question.explanation && (
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-4">
                                      <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                      <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300">
                                        Spiegazione
                                      </h3>
                                    </div>
                                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-6 rounded-xl border-2 border-blue-300 dark:border-blue-700 shadow-sm">
                                      <div 
                                        className="prose prose-lg max-w-none dark:prose-invert text-blue-800 dark:text-blue-200 font-medium text-lg leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: question.explanation }} 
                                      />
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-base text-gray-600 dark:text-gray-400">
                              Visualizzando <span className="font-semibold">{paginatedQuestions.length}</span> di <span className="font-semibold">{filteredQuestions.length}</span> domande
                              {questionFilter !== 'all' && (
                                <span className="ml-2 text-sm text-gray-500">
                                  (filtrate: {questionFilter === 'correct' ? 'corrette' : questionFilter === 'incorrect' ? 'errate' : 'non risposte'})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="px-6 py-2 text-base"
                              >
                                <ChevronLeft className="h-5 w-5 mr-2" />
                                Precedente
                              </Button>
                              <div className="flex items-center gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  let pageNum;
                                  if (totalPages <= 5) {
                                    pageNum = i;
                                  } else if (currentPage < 3) {
                                    pageNum = i;
                                  } else if (currentPage > totalPages - 4) {
                                    pageNum = totalPages - 5 + i;
                                  } else {
                                    pageNum = currentPage - 2 + i;
                                  }
                                  
                                  return (
                                    <Button
                                      key={pageNum}
                                      variant={currentPage === pageNum ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => setCurrentPage(pageNum)}
                                      className="w-10 h-10 text-base"
                                    >
                                      {pageNum + 1}
                                    </Button>
                                  );
                                })}
                              </div>
                              <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="px-6 py-2 text-base"
                              >
                                Successiva
                                <ChevronRight className="h-5 w-5 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}

                {/* Premium Upsell */}
                {!user?.isPremium && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="border-amber-200 dark:border-amber-800">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
                              Sblocca spiegazioni dettagliate con Premium
                            </h4>
                            <p className="text-amber-700 dark:text-amber-400 mb-4">
                              Accedi alle spiegazioni complete per ogni risposta e comprendi meglio i tuoi errori. 
                              Migliora rapidamente le tue performance con contenuti esclusivi.
                            </p>
                            <Button
                              className="bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:from-amber-600 hover:to-amber-500"
                              onClick={() => setLocation('/premium')}
                            >
                              Scopri Premium
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
        >
          <Button
            variant="outline"
            size="lg"
            className="gap-2 min-w-[200px]"
            onClick={() => setLocation('/topic-study')}
          >
            <BookOpen className="h-5 w-5" />
            Studio per argomenti
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 min-w-[200px]"
            onClick={() => setLocation('/practice')}
          >
            <ArrowRight className="h-5 w-5" />
            Torna alla pratica
          </Button>
          <Button
            size="lg"
            className="gap-2 min-w-[200px] bg-primary hover:bg-primary/90"
            onClick={() => {
              localStorage.removeItem('simulationResults');
              setLocation('/practice');
            }}
          >
            <RefreshCw className="h-5 w-5" />
            Nuova simulazione
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultsPage;