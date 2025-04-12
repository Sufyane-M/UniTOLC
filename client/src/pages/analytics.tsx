import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
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
import { Calculator, Library, Clock, Award } from "lucide-react";

// Dati statici per dimostrazione
const performanceData = [
  { date: "01/05", score: 54 },
  { date: "08/05", score: 67 },
  { date: "15/05", score: 62 },
  { date: "22/05", score: 71 },
  { date: "29/05", score: 65 },
  { date: "05/06", score: 78 },
  { date: "12/06", score: 68 },
];

const subjectPerformance = [
  { subject: "Matematica", score: 62 },
  { subject: "Fisica", score: 58 },
  { subject: "Logica", score: 82 },
  { subject: "Comprensione verbale", score: 75 },
  { subject: "Chimica", score: 71 },
  { subject: "Informatica", score: 68 },
];

const timeDistribution = [
  { name: "Matematica", value: 45 },
  { name: "Fisica", value: 30 },
  { name: "Logica", value: 15 },
  { name: "Comprensione verbale", value: 10 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const Analytics = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 className="text-2xl font-heading font-bold mb-6">Statistiche e Analytics</h1>
      
      {isAuthenticated ? (
        <>
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">68%</h3>
                <p className="text-sm text-muted-foreground">Punteggio medio</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
                  <Library className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">24</h3>
                <p className="text-sm text-muted-foreground">Quiz completati</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">18.5h</h3>
                <p className="text-sm text-muted-foreground">Tempo di studio</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-3xl font-bold">1,245</h3>
                <p className="text-sm text-muted-foreground">XP guadagnati</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="performance">
            <TabsList className="mb-6 w-full md:w-auto">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="subjects">Materie</TabsTrigger>
              <TabsTrigger value="time">Tempo di studio</TabsTrigger>
            </TabsList>
            
            {/* Performance Tab */}
            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Andamento Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceData}
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
                          formatter={(value) => [`Score: ${value}%`]}
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
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Subjects Tab */}
            <TabsContent value="subjects">
              <Card>
                <CardHeader>
                  <CardTitle>Performance per Materia</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={subjectPerformance}
                        margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="subject" 
                          className="text-xs text-muted-foreground" 
                          angle={-45} 
                          textAnchor="end"
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
                          formatter={(value) => [`Score: ${value}%`]}
                        />
                        <Bar 
                          dataKey="score" 
                          fill="hsl(var(--primary))" 
                          barSize={30}
                        >
                          {subjectPerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={timeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {timeDistribution.map((entry, index) => (
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
                          formatter={(value) => [`${value} ore`]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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
