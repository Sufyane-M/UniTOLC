import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { MoreHorizontal } from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";

// Dati statici per la demo
const performanceData = [
  { day: 'Lun', score: 54 },
  { day: 'Mar', score: 67 },
  { day: 'Mer', score: 62 },
  { day: 'Gio', score: 71 },
  { day: 'Ven', score: 65 },
  { day: 'Sab', score: 78 },
  { day: 'Dom', score: 68 },
];

const subjects = [
  { name: "Logica", score: 82 },
  { name: "Comprensione verbale", score: 75 },
  { name: "Chimica", score: 71 },
];

interface ProgressOverviewProps {
  quizzesCompleted?: number;
  studyHours?: number;
  averageScore?: number;
  xpEarned?: number;
}

const ProgressOverview = ({
  quizzesCompleted = 24,
  studyHours = 18.5,
  averageScore = 68,
  xpEarned = 1245
}: ProgressOverviewProps) => {
  const { isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "all">("7days");
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-heading">Panoramica progressi</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTimeRange("7days")}>
              Ultimi 7 giorni
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("30days")}>
              Ultimi 30 giorni
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("all")}>
              Dall'inizio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <>
            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="day" 
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
            
            {/* Stats summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <span className="text-sm text-muted-foreground">Quiz completati</span>
                <p className="text-xl font-semibold mt-1">{quizzesCompleted}</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <span className="text-sm text-muted-foreground">Ore di studio</span>
                <p className="text-xl font-semibold mt-1">{studyHours}</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <span className="text-sm text-muted-foreground">Punteggio medio</span>
                <p className="text-xl font-semibold mt-1">{averageScore}%</p>
              </div>
              <div className="bg-accent/50 rounded-lg p-3 text-center">
                <span className="text-sm text-muted-foreground">XP guadagnati</span>
                <p className="text-xl font-semibold mt-1">{xpEarned}</p>
              </div>
            </div>
            
            <div className="mt-5 pt-4 border-t border-border">
              <h3 className="text-sm font-medium mb-3">Materie migliori</h3>
              
              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">{subject.name}</span>
                      <span className="text-sm font-medium">{subject.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${subject.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="bg-primary-100 dark:bg-primary-900/30 rounded-full p-3 mb-4">
              <i className="ri-bar-chart-line text-2xl text-primary-500"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">Traccia i tuoi progressi</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-2">
              Accedi per visualizzare statistiche dettagliate sul tuo percorso di studio e monitorare i tuoi miglioramenti.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressOverview;
