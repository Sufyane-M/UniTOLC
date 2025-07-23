import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Calculator, Library, Clock, Award, Loader2, AlertCircle, BookOpen, Target } from "lucide-react";
import { 
  useAnalyticsSummary, 
  usePerformanceTrend, 
  useTopicPerformance, 
  useStudyTimeDistribution,
  useQuizSessionsSummary,
  useStudySessionsSummary
} from "../hooks/useAnalytics";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

// Componente per mostrare lo stato di caricamento
const LoadingCard = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center p-6">
      <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
      <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
      <p className="text-sm text-muted-foreground">{title}</p>
    </CardContent>
  </Card>
);

// Componente per mostrare errori
const ErrorCard = ({ title, error }: { title: string; error: string }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center p-6">
      <div className="bg-destructive/10 p-3 rounded-full mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Errore</h3>
      <p className="text-sm text-muted-foreground text-center">{error}</p>
    </CardContent>
  </Card>
);

const Analytics = () => {
  const { isAuthenticated } = useAuth();
  const { data: summary, loading: summaryLoading, error: summaryError } = useAnalyticsSummary();
  const { data: performanceData, loading: trendLoading, error: trendError } = usePerformanceTrend();
  const { data: topicData, loading: topicLoading, error: topicError } = useTopicPerformance();
  const { data: timeData, loading: timeLoading, error: timeError } = useStudyTimeDistribution();
  const { data: quizSummary, loading: quizLoading, error: quizError } = useQuizSessionsSummary();
  const { data: studySummary, loading: studyLoading, error: studyError } = useStudySessionsSummary();

  // Formatta i dati per i grafici
  const formattedPerformanceData = performanceData?.map(point => ({
    date: format(new Date(point.date), 'dd/MM', { locale: it }),
    score: point.average_score,
    sessions: point.sessions_count
  })) || [];

  const formattedTopicData = topicData?.slice(0, 6).map(topic => ({
    subject: topic.topic_name,
    score: topic.average_score,
    sessions: topic.sessions_count
  })) || [];

  const formattedTimeData = timeData?.map(item => ({
    name: item.activity_type,
    value: item.total_minutes,
    percentage: item.percentage
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Statistiche e Analytics</h1>
      
      {isAuthenticated ? (
        <>
          {/* Riepilogo generale */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {summaryLoading ? (
              <div className="col-span-full flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : summaryError ? (
              <div className="col-span-full">
                <ErrorCard title="Errore nel caricamento del riepilogo" error={summaryError} />
              </div>
            ) : (
              <>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
                      <Calculator className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold">{summary?.average_score || 0}%</h3>
                    <p className="text-sm text-muted-foreground">Punteggio medio generale</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
                      <Library className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold">{summary?.total_quiz_sessions || 0}</h3>
                    <p className="text-sm text-muted-foreground">Sessioni totali</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold">{summary?.total_study_time_hours || 0}h</h3>
                    <p className="text-sm text-muted-foreground">Tempo di studio</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold">{summary?.total_xp_earned || 0}</h3>
                    <p className="text-sm text-muted-foreground">XP guadagnati</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Statistiche separate per Quiz e Test per materia */}
          <Tabs defaultValue="quiz" className="mb-8">
            <TabsList className="mb-6 w-full md:w-auto">
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Quiz Completi
              </TabsTrigger>
              <TabsTrigger value="study" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Test per Materia
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Quiz Completi */}
            <TabsContent value="quiz">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {quizLoading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : quizError ? (
                  <div className="col-span-full">
                    <ErrorCard title="Errore nel caricamento delle statistiche quiz" error={quizError} />
                  </div>
                ) : (
                  <>
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-4">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-3xl font-bold">{quizSummary?.total_quiz_sessions || 0}</h3>
                        <p className="text-sm text-muted-foreground">Quiz completati</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
                          <Calculator className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-bold">{quizSummary?.average_score?.toFixed(1) || 0}%</h3>
                        <p className="text-sm text-muted-foreground">Punteggio medio</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-4">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-3xl font-bold">
                          {quizSummary?.total_questions > 0 
                            ? ((quizSummary.total_correct_answers / quizSummary.total_questions) * 100).toFixed(1)
                            : 0}%
                        </h3>
                        <p className="text-sm text-muted-foreground">Risposte corrette</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-4">
                          <Library className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-3xl font-bold">{quizSummary?.total_questions || 0}</h3>
                        <p className="text-sm text-muted-foreground">Domande totali</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-gray-100 dark:bg-gray-900/30 p-3 rounded-full mb-4">
                          <Clock className="h-6 w-6 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold">
                          {quizSummary?.last_attempt_date 
                            ? format(new Date(quizSummary.last_attempt_date), 'dd/MM/yyyy')
                            : 'Mai'}
                        </h3>
                        <p className="text-sm text-muted-foreground">Ultimo tentativo</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
            
            {/* Tab Test per Materia */}
            <TabsContent value="study">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {studyLoading ? (
                  <div className="col-span-full flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : studyError ? (
                  <div className="col-span-full">
                    <ErrorCard title="Errore nel caricamento delle statistiche test per materia" error={studyError} />
                  </div>
                ) : (
                  <>
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full mb-4">
                          <BookOpen className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-3xl font-bold">{studySummary?.total_study_sessions || 0}</h3>
                        <p className="text-sm text-muted-foreground">Test completati</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full mb-4">
                          <Calculator className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-3xl font-bold">{studySummary?.average_score?.toFixed(1) || 0}%</h3>
                        <p className="text-sm text-muted-foreground">Punteggio medio</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mb-4">
                          <Award className="h-6 w-6 text-purple-600" />
                        </div>
                        <h3 className="text-3xl font-bold">
                          {studySummary?.total_questions > 0 
                            ? ((studySummary.total_correct_answers / studySummary.total_questions) * 100).toFixed(1)
                            : 0}%
                        </h3>
                        <p className="text-sm text-muted-foreground">Risposte corrette</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-full mb-4">
                          <Library className="h-6 w-6 text-orange-600" />
                        </div>
                        <h3 className="text-3xl font-bold">{studySummary?.total_questions || 0}</h3>
                        <p className="text-sm text-muted-foreground">Domande totali</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-6">
                        <div className="bg-gray-100 dark:bg-gray-900/30 p-3 rounded-full mb-4">
                          <Clock className="h-6 w-6 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold">
                          {studySummary?.last_attempt_date 
                            ? format(new Date(studySummary.last_attempt_date), 'dd/MM/yyyy')
                            : 'Mai'}
                        </h3>
                        <p className="text-sm text-muted-foreground">Ultimo tentativo</p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
          
          <Tabs defaultValue="performance">
            <TabsList className="mb-6 w-full md:w-auto">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="subjects">Argomenti</TabsTrigger>
              <TabsTrigger value="time">Tempo di studio</TabsTrigger>
            </TabsList>
            
            {/* Performance Tab */}
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Andamento Performance (Ultimi 30 giorni)</CardTitle>
                </CardHeader>
                <CardContent>
                  {trendLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : trendError ? (
                    <div className="h-80 flex items-center justify-center">
                      <ErrorCard title="Errore nel caricamento dei trend" error={trendError} />
                    </div>
                  ) : formattedPerformanceData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-muted-foreground">Nessun dato disponibile per il periodo selezionato</p>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={formattedPerformanceData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            className="text-xs text-muted-foreground"
                          />
                          <YAxis
                            domain={[0, 100]}
                            ticks={[0, 20, 40, 60, 80, 100]}
                            className="text-xs text-muted-foreground"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              padding: '0.5rem'
                            }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value, name) => {
                              if (name === 'score') return [`Punteggio: ${value}%`, 'Punteggio'];
                              if (name === 'sessions') return [`Sessioni: ${value}`, 'Sessioni'];
                              return [value, name];
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ r: 4, strokeWidth: 1 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Subjects Tab */}
            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle>Performance per Argomento</CardTitle>
                </CardHeader>
                <CardContent>
                  {topicLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : topicError ? (
                    <div className="h-80 flex items-center justify-center">
                      <ErrorCard title="Errore nel caricamento degli argomenti" error={topicError} />
                    </div>
                  ) : formattedTopicData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-muted-foreground">Nessun dato disponibile sugli argomenti</p>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={formattedTopicData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="subject" 
                            className="text-xs text-muted-foreground" 
                            angle={-45} 
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis
                            domain={[0, 100]}
                            ticks={[0, 20, 40, 60, 80, 100]}
                            className="text-xs text-muted-foreground"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              padding: '0.5rem'
                            }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value, name) => {
                              if (name === 'score') return [`Punteggio: ${value}%`, 'Punteggio'];
                              if (name === 'sessions') return [`Sessioni: ${value}`, 'Sessioni'];
                              return [value, name];
                            }}
                          />
                          <Bar 
                            dataKey="score" 
                            fill="hsl(var(--primary))" 
                            barSize={30}
                          >
                            {formattedTopicData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Time Distribution Tab */}
            <TabsContent value="time">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuzione Tempo di Studio</CardTitle>
                </CardHeader>
                <CardContent>
                  {timeLoading ? (
                    <div className="h-80 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : timeError ? (
                    <div className="h-80 flex items-center justify-center">
                      <ErrorCard title="Errore nel caricamento della distribuzione tempo" error={timeError} />
                    </div>
                  ) : formattedTimeData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center">
                      <p className="text-muted-foreground">Nessun dato disponibile sulla distribuzione del tempo</p>
                    </div>
                  ) : (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={formattedTimeData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {formattedTimeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                              color: 'white',
                              borderRadius: '0.375rem',
                              border: 'none',
                              padding: '0.5rem'
                            }}
                            itemStyle={{ color: 'white' }}
                            formatter={(value) => [`${Math.round(value)} minuti`]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-4 mb-6">
              <i className="ri-bar-chart-2-line text-3xl text-primary"></i>
            </div>
            <h2 className="text-2xl font-heading font-semibold mb-3">
              Accedi per visualizzare le tue statistiche
            </h2>
            <p className="text-muted-foreground max-w-xl mb-6">
              Le statistiche dettagliate ti aiutano a monitorare i tuoi progressi, identificare le aree di miglioramento e ottimizzare il tuo percorso di studio.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
