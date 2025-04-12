import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Award, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserStatsDisplay() {
  const { user } = useAuth();
  const [showAnimation, setShowAnimation] = useState(false);
  const [prevXp, setPrevXp] = useState(0);
  const [prevStreak, setPrevStreak] = useState(0);

  // Detect changes to animate
  useEffect(() => {
    if (!user) return;

    const xp = user.xpPoints || 0;
    const streak = user.studyStreak || 0;

    // If there's a positive change, trigger animation
    if ((xp > prevXp && prevXp !== 0) || (streak > prevStreak && prevStreak !== 0)) {
      setShowAnimation(true);
      
      // Reset animation after a brief delay
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }

    // Update previous values
    setPrevXp(xp);
    setPrevStreak(streak);
  }, [user?.xpPoints, user?.studyStreak, prevXp, prevStreak]);

  if (!user) return null;

  const xpToNextLevel = 100; // Example threshold
  const currentXp = user.xpPoints || 0;
  const currentLevel = Math.floor(currentXp / xpToNextLevel) + 1;
  const progressToNextLevel = (currentXp % xpToNextLevel) / xpToNextLevel * 100;

  return (
    <Card className={cn(
      "transition-all duration-200",
      showAnimation && "border-green-500 shadow-lg shadow-green-100 dark:shadow-green-900/20"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>I Tuoi Progressi</span>
          {showAnimation && (
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" /> Aggiornato
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Statistiche aggiornate in tempo reale</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Livello {currentLevel}</span>
            <span className="text-sm text-muted-foreground">{currentXp} / {currentLevel * xpToNextLevel} XP</span>
          </div>
          <Progress 
            value={progressToNextLevel} 
            className={cn(
              "h-2 transition-all",
              showAnimation && "bg-green-100 dark:bg-green-900/20"
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
            <Award className="h-5 w-5 mb-1 text-orange-500" />
            <span className="text-xl font-bold">{user.xpPoints || 0}</span>
            <span className="text-xs text-muted-foreground">Punti XP</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
            <Calendar className="h-5 w-5 mb-1 text-blue-500" />
            <span className="text-xl font-bold">{user.studyStreak || 0}</span>
            <span className="text-xs text-muted-foreground">Giorni di studio</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t pt-3">
        <Clock className="h-3 w-3 mr-1" />
        Ultimo aggiornamento: {new Date(user.lastActive || Date.now()).toLocaleTimeString('it-IT')}
      </CardFooter>
    </Card>
  );
}