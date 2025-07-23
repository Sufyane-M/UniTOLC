import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, Target } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface WelcomeHeaderProps {
  lastVisit?: string | null;
  currentStreak?: number;
}

const getWelcomeMessage = (userName: string, lastVisit: string | null) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';
  
  const daysSinceLastVisit = lastVisit 
    ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
    
  if (daysSinceLastVisit === 0) {
    return `${greeting}, ${userName}! 👋`;
  } else if (daysSinceLastVisit === 1) {
    return `${greeting}, ${userName}! Bentornato dopo ieri! 🎯`;
  } else if (daysSinceLastVisit > 7) {
    return `${greeting}, ${userName}! È passato un po' di tempo, ricominciamo! 💪`;
  } else {
    return `${greeting}, ${userName}! Bentornato! 🚀`;
  }
};

const getTimeBasedEmoji = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '🌙';
  if (hour < 12) return '☀️';
  if (hour < 18) return '🌤️';
  return '🌆';
};

const WelcomeHeader = ({ lastVisit, currentStreak = 0 }: WelcomeHeaderProps) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const userName = user.full_name || user.username || 'Studente';
  const welcomeMessage = getWelcomeMessage(userName, lastVisit);
  const timeEmoji = getTimeBasedEmoji();
  
  return (
    <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{timeEmoji}</span>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {welcomeMessage}
              </h1>
            </div>
            <p className="text-muted-foreground">
              Pronto per continuare il tuo percorso di studio?
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {currentStreak > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                  <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    {currentStreak} giorni di fila!
                  </span>
                </div>
              </div>
            )}
            
            {currentStreak >= 7 && (
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                <Target className="h-3 w-3 mr-1" />
                Obiettivo raggiunto!
              </Badge>
            )}
          </div>
        </div>
        
        {currentStreak >= 3 && currentStreak < 7 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Ancora {7 - currentStreak} giorni per raggiungere una settimana di studio consecutivo!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WelcomeHeader;