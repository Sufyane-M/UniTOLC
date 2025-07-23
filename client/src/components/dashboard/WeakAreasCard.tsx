import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, BookOpen, AlertTriangle, TrendingDown } from 'lucide-react';
import { useWeakAreas, WeakArea } from '@/hooks/useDashboardStats';
import { useLocation } from 'wouter';

interface WeakAreasCardProps {
  className?: string;
}

const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'low':
      return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const getPriorityLabel = (priority: 'high' | 'medium' | 'low') => {
  switch (priority) {
    case 'high':
      return 'Urgente';
    case 'medium':
      return 'Importante';
    case 'low':
      return 'Da migliorare';
    default:
      return 'Normale';
  }
};

const WeakAreaItem = ({ weakArea, onPractice }: { weakArea: WeakArea; onPractice: (topicId: number) => void }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-sm text-foreground truncate">
            {weakArea.topic_name}
          </h4>
          <Badge 
            variant="secondary" 
            className={`text-xs ${getPriorityColor(weakArea.priority)}`}
          >
            {getPriorityLabel(weakArea.priority)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {weakArea.subject_name}
        </p>
        <div className="flex items-center gap-2">
          <Progress 
            value={weakArea.accuracy} 
            className="flex-1 h-2"
          />
          <span className="text-xs font-medium text-muted-foreground min-w-0">
            {weakArea.accuracy}%
          </span>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onPractice(weakArea.topic_id)}
        className="ml-3 shrink-0"
      >
        Ripassa
      </Button>
    </div>
  );
};

const WeakAreasCard = ({ className }: WeakAreasCardProps) => {
  const { data: weakAreas, isLoading, error } = useWeakAreas();
  const [, setLocation] = useLocation();

  const handlePractice = (topicId: number) => {
    // Naviga alla pagina di studio per il topic specifico
    setLocation(`/study?topic=${topicId}&mode=practice`);
  };

  const handlePracticeAll = () => {
    // Naviga alla pagina di studio per tutte le aree deboli
    setLocation('/study?mode=weak-areas');
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
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-3 w-20 mb-2" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 flex-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasWeakAreas = weakAreas && weakAreas.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-heading">Aree da Migliorare</CardTitle>
        </div>
        {hasWeakAreas && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handlePracticeAll}
            className="gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Ripassa tutto
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Errore nel caricamento</p>
            <p className="text-sm text-muted-foreground">
              Non è stato possibile caricare le aree deboli
            </p>
          </div>
        ) : hasWeakAreas ? (
          <div className="space-y-3">
            {weakAreas.map((weakArea) => (
              <WeakAreaItem
                key={weakArea.topic_id}
                weakArea={weakArea}
                onPractice={handlePractice}
              />
            ))}
            
            {weakAreas.length >= 5 && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Mostrando le prime 5 aree da migliorare
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingDown className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Nessuna area debole rilevata</p>
            <p className="text-sm text-muted-foreground">
              Completa alcuni quiz per identificare le aree da migliorare!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeakAreasCard;