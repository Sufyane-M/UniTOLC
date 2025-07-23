import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, Clock, BarChart3, ArrowRight, RefreshCw, ListChecks, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
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
}

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: SimulationResults;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ isOpen, onClose, results }) => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 20;
  
  if (!results) return null;
  
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
  
  // Calculate pagination values for question summary
  const totalPages = results.questions ? Math.ceil(results.questions.length / questionsPerPage) : 0;
  const paginatedQuestions = results.questions ? 
    results.questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage) : 
    [];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            Risultati Simulazione TOLC {results.exam_type}
          </DialogTitle>
          <DialogDescription>
            Ecco il report dettagliato della tua simulazione completa.
          </DialogDescription>
        </DialogHeader>
        
        {/* Overall Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Punteggio complessivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {results.overall_score.toFixed(2)} / {maxPossibleScore.toFixed(0)}
                <span className="text-lg font-normal text-muted-foreground ml-2">
                  ({percentageScore}%)
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mb-1" />
                  <span className="text-xs text-muted-foreground">Corrette</span>
                  <span className="font-semibold">{totalCorrect}</span>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mb-1" />
                  <span className="text-xs text-muted-foreground">Errate</span>
                  <span className="font-semibold">{totalIncorrect}</span>
                </div>
                
                <div className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-lg font-semibold mb-1">-</span>
                  <span className="text-xs text-muted-foreground">Non risposte</span>
                  <span className="font-semibold">{totalUnanswered}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tempo totale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <span className="text-xl font-mono font-semibold">
                    {formatTime(results.sections.reduce((sum, section) => sum + section.time_spent, 0))}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Tempo totale di svolgimento
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="sections">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="sections">Sezioni</TabsTrigger>
            <TabsTrigger value="charts">Grafici</TabsTrigger>
            <TabsTrigger value="analysis">Analisi</TabsTrigger>
            <TabsTrigger value="question-summary" className="flex items-center gap-1">
              <ListChecks className="h-4 w-4" />
              <span>Riepilogo Domande</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Section Scores Tab */}
          <TabsContent value="sections" className="space-y-4">
            {results.sections.map((section, index) => (
              <Card key={index}>
                <CardHeader className="py-3">
                  <CardTitle className="text-md flex justify-between items-center">
                    {section.name}
                    <Badge className={
                      section.score.raw / section.score.max_score > 0.75 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" :
                      section.score.raw / section.score.max_score > 0.5 ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" :
                      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }>
                      {section.score.raw.toFixed(2)} / {section.score.max_score}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Corrette</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{section.score.correct}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Errate</span>
                      <span className="font-medium text-red-600 dark:text-red-400">{section.score.incorrect}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Non risposte</span>
                      <span className="font-medium">{section.score.unanswered}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground">Tempo</span>
                      <span className="font-medium">{formatTime(section.time_spent)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          {/* Charts Tab */}
          <TabsContent value="charts">
            <div className="space-y-6">
              {/* Accuracy Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-md flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Precisione per sezione
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={accuracyData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis type="category" dataKey="name" width={120} />
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Percentuale']}
                        labelFormatter={(label) => `Sezione: ${label}`}
                      />
                      <Bar dataKey="correct" name="Risposte corrette" stackId="a" fill="#16a34a">
                        <LabelList dataKey="correct" position="center" formatter={(v: any) => v > 15 ? `${v}%` : ''} fill="#fff" />
                      </Bar>
                      <Bar dataKey="incorrect" name="Risposte errate" stackId="a" fill="#dc2626">
                        <LabelList dataKey="incorrect" position="center" formatter={(v: any) => v > 15 ? `${v}%` : ''} fill="#fff" />
                      </Bar>
                      <Bar dataKey="unanswered" name="Non risposte" stackId="a" fill="#94a3b8">
                        <LabelList dataKey="unanswered" position="center" formatter={(v: any) => v > 15 ? `${v}%` : ''} fill="#fff" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Time Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-md flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Tempo medio per domanda
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis unit="s" />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'seconds_per_question' ? `${value} secondi` : formatTime(Number(value)),
                          name === 'seconds_per_question' ? 'Tempo per domanda' : 'Tempo totale'
                        ]}
                      />
                      <Bar dataKey="seconds_per_question" name="Secondi per domanda" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Analysis Tab */}
          <TabsContent value="analysis">
            <div className="space-y-6">
              {/* Strengths */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-md text-green-700 dark:text-green-400">
                    Punti di forza
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {strengths.map((section, index) => (
                      <li key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span>{section.name}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {section.percentage}%
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Weaknesses */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-md text-red-700 dark:text-red-400">
                    Aree da migliorare
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {weaknesses.map((section, index) => (
                      <li key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                          <span>{section.name}</span>
                        </div>
                        <Badge className={
                          section.percentage < 30 ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" : 
                          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        }>
                          {section.percentage}%
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-md">Consigli per il miglioramento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {weaknesses.map((section, index) => (
                      <li key={index} className="flex items-start gap-2 py-2">
                        <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                        <span>
                          Dedica più tempo allo studio di <strong>{section.name}</strong>. 
                          Utilizza i materiali didattici della sezione "Studio per argomenti" per migliorare in questa area.
                        </span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 py-2">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-primary" />
                      <span>
                        Migliora la gestione del tempo: nelle sezioni con più risposte non date, 
                        cerca di velocizzare la lettura e comprensione delle domande.
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Question Summary Tab */}
          <TabsContent value="question-summary">
            <Card>
              <CardHeader>
                <CardTitle className="text-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-5 w-5" />
                    Riepilogo Domande
                  </div>
                  {user?.isPremium && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-amber-400 text-white">
                      Premium
                    </Badge>
                  )}
                </CardTitle>
                
                {/* Summary Statistics */}
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center p-2">
                      <span className="text-sm text-muted-foreground">Domande totali</span>
                      <span className="text-xl font-semibold">{totalQuestions}</span>
                    </div>
                    <div className="flex flex-col items-center p-2">
                      <span className="text-sm text-muted-foreground">Risposte corrette</span>
                      <span className="text-xl font-semibold">{totalCorrect}</span>
                    </div>
                    <div className="flex flex-col items-center p-2">
                      <span className="text-sm text-muted-foreground">Percentuale</span>
                      <span className="text-xl font-semibold">{Math.round((totalCorrect / totalQuestions) * 100)}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!results.questions || results.questions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-muted/20 rounded-lg text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-1">Nessun dato disponibile</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Il riepilogo dettagliato delle domande non è disponibile per questa simulazione.
                    </p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableCaption>
                        {totalPages > 1 && (
                          <div className="flex items-center justify-center mt-4 space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                              disabled={currentPage === 0}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                              Pagina {currentPage + 1} di {totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                              disabled={currentPage === totalPages - 1}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Domanda</TableHead>
                          <TableHead>Risposta</TableHead>
                          <TableHead className="text-center">Risultato</TableHead>
                          {user?.isPremium && (
                            <TableHead>Spiegazione</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedQuestions.map((question, idx) => (
                          <TableRow key={idx} className={idx % 2 === 0 ? 'bg-muted/10' : ''}>
                            <TableCell className="font-medium align-top p-3">
                              {currentPage * questionsPerPage + idx + 1}
                            </TableCell>
                            <TableCell className="align-top p-3">
                              <div dangerouslySetInnerHTML={{ __html: question.text }} />
                            </TableCell>
                            <TableCell className="align-top p-3">
                              {question.userAnswer ? (
                                <div dangerouslySetInnerHTML={{ __html: question.userAnswer }} />
                              ) : (
                                <span className="text-muted-foreground italic">Non risposta</span>
                              )}
                              {!question.isCorrect && (
                                <div className="mt-2 pt-2 border-t border-dashed border-muted-foreground/30">
                                  <span className="text-xs text-muted-foreground">Risposta corretta:</span>
                                  <div className="text-sm text-green-600 dark:text-green-400 font-medium mt-1" dangerouslySetInnerHTML={{ __html: question.correctAnswer }} />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-center align-top p-3">
                              {question.isCorrect ? (
                                <div className="flex flex-col items-center gap-1">
                                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Corretto</span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Errato</span>
                                </div>
                              )}
                            </TableCell>
                            {user?.isPremium && (
                              <TableCell className="align-top p-3">
                                {question.explanation ? (
                                  <div dangerouslySetInnerHTML={{ __html: question.explanation }} />
                                ) : (
                                  <span className="text-muted-foreground italic">Nessuna spiegazione disponibile</span>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
                
                {!user?.isPremium && (
                  <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-1" />
                      <div>
                        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">
                          Passa a Premium per sbloccare spiegazioni dettagliate
                        </h4>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Con il piano Premium puoi accedere alle spiegazioni complete delle risposte corrette per 
                          comprendere meglio i tuoi errori e migliorare rapidamente.
                        </p>
                        <Button
                          size="sm"
                          variant="default"
                          className="mt-3 bg-gradient-to-r from-amber-500 to-amber-400 text-white hover:from-amber-600 hover:to-amber-500"
                          onClick={() => setLocation('/premium')}
                        >
                          Scopri Premium
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Separator className="my-6" />
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setLocation('/topic-study')}
          >
            <BarChart3 className="h-4 w-4" />
            Studio per argomenti
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setLocation('/practice')}
          >
            <ArrowRight className="h-4 w-4" />
            Torna alla pratica
          </Button>
          <Button
            className="gap-2"
            onClick={onClose}
          >
            <RefreshCw className="h-4 w-4" />
            Nuova simulazione
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultsModal; 