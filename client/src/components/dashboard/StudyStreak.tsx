import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Clock } from "lucide-react";

interface StudyStreakProps {
  streak?: number;
  record?: number;
  todayStudyTime?: string;
}

const StudyStreak = ({ 
  streak = 7, 
  record = 14, 
  todayStudyTime = "1h 15m" 
}: StudyStreakProps) => {
  const { isAuthenticated } = useAuth();
  
  // Array di giorni della settimana
  const weekdays = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  
  // Indice del giorno corrente (0 = Lunedì, 6 = Domenica)
  const today = new Date().getDay();
  const mondayBasedToday = today === 0 ? 6 : today - 1; // Converti a base lunedì (0 = Lunedì)
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-heading">Streak di studio</CardTitle>
        {isAuthenticated && (
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="mr-2">Tempo oggi: {todayStudyTime}</span>
            <Clock className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isAuthenticated ? (
          <>
            <div className="flex items-center mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-3 mr-4">
                <i className="ri-fire-fill text-2xl text-amber-500 drop-shadow-md"></i>
              </div>
              <div>
                <div className="text-3xl font-heading font-bold">{streak} giorni</div>
                <p className="text-sm text-muted-foreground">
                  Continua così! Il tuo record è di {record} giorni.
                </p>
              </div>
            </div>
            
            {/* Weekly calendar */}
            <div className="grid grid-cols-7 gap-2 mt-2">
              {weekdays.map((day, i) => (
                <div key={`day-${i}`} className="text-xs text-center font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Previous week */}
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={`prev-${i}`} 
                  className="h-8 rounded-md flex items-center justify-center bg-green-500/20 dark:bg-green-500/30"
                >
                  <i className="ri-check-line text-green-500"></i>
                </div>
              ))}
              
              {/* Current week (with today highlighted) */}
              {Array.from({ length: 7 }).map((_, i) => (
                <div 
                  key={`curr-${i}`}
                  className={`h-8 rounded-md flex items-center justify-center ${
                    i === mondayBasedToday 
                      ? 'bg-amber-500 text-white' 
                      : (i < mondayBasedToday 
                          ? 'bg-green-500/20 dark:bg-green-500/30' 
                          : 'bg-gray-100 dark:bg-gray-800')
                  }`}
                >
                  {i <= mondayBasedToday && (
                    <i className={`ri-check-line ${i === mondayBasedToday ? 'text-white' : 'text-green-500'}`}></i>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-3 mb-4">
              <i className="ri-fire-fill text-2xl text-amber-500"></i>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Accedi per tracciare la tua streak di studio giornaliera e monitorare i tuoi progressi.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudyStreak;
