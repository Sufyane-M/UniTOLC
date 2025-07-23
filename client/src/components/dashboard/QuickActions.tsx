import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  BookOpen, 
  Target, 
  Calendar, 
  TrendingUp, 
  Clock,
  Zap,
  BarChart3
} from 'lucide-react';
import { useLocation } from 'wouter';
import { useDashboardStats } from '@/hooks/useDashboardStats';

interface QuickActionsProps {
  className?: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  badge?: string;
  className?: string;
}

const ActionButton = ({ 
  icon, 
  title, 
  description, 
  onClick, 
  variant = 'outline',
  badge,
  className = ''
}: ActionButtonProps) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      className={`h-auto p-4 flex flex-col items-start gap-2 relative ${className}`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-sm">{title}</span>
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs">
            {badge}
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground text-left">
        {description}
      </p>
    </Button>
  );
};

const QuickActions = ({ className }: QuickActionsProps) => {
  const [, setLocation] = useLocation();
  const { data: stats } = useDashboardStats();

  const handleQuickQuiz = () => {
    setLocation('/quiz?mode=quick');
  };

  const handlePracticeMode = () => {
    setLocation('/quiz?mode=practice');
  };

  const handleStudySession = () => {
    setLocation('/topic-study');
  };

  const handleWeakAreas = () => {
    setLocation('/study?mode=weak-areas');
  };

  const handleExamMode = () => {
    setLocation('/quiz?mode=exam');
  };

  const handleProgress = () => {
    setLocation('/progress');
  };

  const handleSchedule = () => {
    setLocation('/schedule');
  };

  const handleAnalytics = () => {
    setLocation('/analytics');
  };

  // Determina se mostrare badge per aree deboli
  const hasWeakAreas = stats && stats.average_score < 70;
  const isOnStreak = stats && stats.current_streak > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-heading">Azioni Rapide</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {/* Quiz Rapido */}
          <ActionButton
            icon={<Clock className="h-4 w-4 text-blue-600" />}
            title="Quiz Rapido"
            description="5 domande casuali per un ripasso veloce"
            onClick={handleQuickQuiz}
            variant="default"
            className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
          />

          {/* Modalità Allenamento */}
          <ActionButton
            icon={<Brain className="h-4 w-4 text-green-600" />}
            title="Allenamento"
            description="Quiz personalizzato per migliorare le tue competenze"
            onClick={handlePracticeMode}
            badge={isOnStreak ? `Streak ${stats?.current_streak}` : undefined}
          />

          {/* Sessione di Studio */}
          <ActionButton
            icon={<BookOpen className="h-4 w-4 text-purple-600" />}
            title="Studia"
            description="Accedi ai materiali di studio e alle lezioni"
            onClick={handleStudySession}
          />

          {/* Aree Deboli */}
          <ActionButton
            icon={<Target className="h-4 w-4 text-orange-600" />}
            title="Aree Deboli"
            description="Concentrati sui tuoi punti di miglioramento"
            onClick={handleWeakAreas}
            badge={hasWeakAreas ? "Consigliato" : undefined}
            className={hasWeakAreas ? "ring-2 ring-orange-200 dark:ring-orange-800" : ""}
          />

          {/* Modalità Esame */}
          <ActionButton
            icon={<TrendingUp className="h-4 w-4 text-red-600" />}
            title="Modalità Esame"
            description="Simula un esame reale con tempo limitato"
            onClick={handleExamMode}
          />

          {/* Progressi */}
          <ActionButton
            icon={<BarChart3 className="h-4 w-4 text-indigo-600" />}
            title="Progressi"
            description="Visualizza i tuoi miglioramenti nel tempo"
            onClick={handleProgress}
          />

          {/* Pianificazione */}
          <ActionButton
            icon={<Calendar className="h-4 w-4 text-teal-600" />}
            title="Pianifica"
            description="Organizza le tue sessioni di studio"
            onClick={handleSchedule}
          />

          {/* Analytics */}
          <ActionButton
            icon={<BarChart3 className="h-4 w-4 text-pink-600" />}
            title="Analytics"
            description="Analisi dettagliate delle tue performance"
            onClick={handleAnalytics}
          />
        </div>

        {/* Suggerimenti Intelligenti */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-medium text-foreground mb-3">Suggerimenti per oggi</h4>
          <div className="space-y-2">
            {hasWeakAreas && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <Target className="h-4 w-4 text-orange-600" />
                <p className="text-xs text-orange-700 dark:text-orange-300">
                  Il tuo punteggio medio è sotto il 70%. Concentrati sulle aree deboli!
                </p>
              </div>
            )}
            
            {isOnStreak && stats && stats.current_streak >= 3 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-700 dark:text-green-300">
                  Ottimo! Hai una streak di {stats.current_streak} giorni. Continua così!
                </p>
              </div>
            )}
            
            {stats && stats.total_quiz_sessions === 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <Brain className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Benvenuto! Inizia con un quiz rapido per valutare il tuo livello.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;