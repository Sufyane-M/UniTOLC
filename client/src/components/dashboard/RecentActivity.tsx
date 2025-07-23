import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, BookOpen, Brain, Trophy, AlertTriangle, Activity } from 'lucide-react';
import { useRecentActivity, RecentActivity as RecentActivityData } from '@/hooks/useDashboardStats';
import { useLocation } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface RecentActivityCardProps {
  className?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

const getScoreBadgeVariant = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
  if (score >= 60) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
  return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

const QuizActivityItem = ({ quiz }: { quiz: RecentActivityData['last_quiz'] }) => {
  if (!quiz) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-primary/10">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-foreground">
              Quiz {quiz.mode === 'practice' ? 'Allenamento' : quiz.mode === 'exam' ? 'Esame' : 'Rapido'}
            </h4>
            <Badge 
              variant="secondary" 
              className={`text-xs ${getScoreBadgeVariant(quiz.score)}`}
            >
              {quiz.score}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            {quiz.topic_name || 'General'}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(quiz.completed_at), { addSuffix: true, locale: it })}</span>
          </div>
        </div>
      </div>
      <Trophy className={`h-4 w-4 ${getScoreColor(quiz.score)}`} />
    </div>
  );
};

const StudyActivityItem = ({ study }: { study: RecentActivityData['last_study'] }) => {
  if (!study) return null;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-foreground">
              Sessione di Studio
            </h4>
            <Badge variant="outline" className="text-xs">
              {formatDuration(study.duration)}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            {study.topic_name} • {study.subject_name}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatDistanceToNow(new Date(study.date), { addSuffix: true, locale: it })}</span>
          </div>
        </div>
      </div>
      <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    </div>
  );
};

const RecentActivity = ({ className }: RecentActivityCardProps) => {
  const { data: recentActivity, isLoading, error } = useRecentActivity();
  const [, setLocation] = useLocation();

  const handleContinueStudying = () => {
    setLocation('/topic-study');
  };

  const handleTakeQuiz = () => {
    setLocation('/full-simulation');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasActivity = recentActivity && (recentActivity.last_quiz || recentActivity.last_study);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-heading">Attività Recente</CardTitle>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleContinueStudying}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Studia
          </Button>
          <Button 
            size="sm" 
            onClick={handleTakeQuiz}
            className="gap-2"
          >
            <Brain className="h-4 w-4" />
            Quiz
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Errore nel caricamento</p>
            <p className="text-sm text-muted-foreground">
              Non è stato possibile caricare l'attività recente
            </p>
          </div>
        ) : hasActivity ? (
          <div className="space-y-3">
            {recentActivity.last_quiz && (
              <QuizActivityItem quiz={recentActivity.last_quiz} />
            )}
            {recentActivity.last_study && (
              <StudyActivityItem study={recentActivity.last_study} />
            )}
            
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Continua dove hai lasciato
                </p>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation('/history')}
                  className="text-xs"
                >
                  Vedi tutto
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Nessuna attività recente</p>
            <p className="text-sm text-muted-foreground mb-4">
              Inizia a studiare o fai un quiz per vedere le tue attività qui!
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleContinueStudying}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Inizia a studiare
              </Button>
              <Button 
                size="sm" 
                onClick={handleTakeQuiz}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                Fai un quiz
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;