import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Clock, Target, Flame, Star, TrendingUp } from 'lucide-react';
import { DashboardStats } from '@/hooks/useDashboardStats';
import { useEffect, useState } from 'react';

interface StatsOverviewProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

const StatCard = ({ title, value, icon, description, trend, isLoading }: StatCardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;

  // Animazione contatore
  useEffect(() => {
    if (isLoading || targetValue === 0) return;
    
    const duration = 1000; // 1 secondo
    const steps = 30;
    const increment = targetValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetValue) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [targetValue, isLoading]);

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  const formatValue = (val: number) => {
    if (title.includes('Ore')) {
      return val.toFixed(1);
    }
    if (title.includes('Punteggio')) {
      return val.toFixed(0) + '%';
    }
    return val.toLocaleString();
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:scale-105">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="text-primary">{icon}</div>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground">
            {formatValue(displayValue)}
          </p>
          {trend && trend !== 'neutral' && (
            <div className={`flex items-center text-xs ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-3 w-3 ${
                trend === 'down' ? 'rotate-180' : ''
              }`} />
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const StatsOverview = ({ stats, isLoading }: StatsOverviewProps) => {
  const getStreakDescription = (streak: number) => {
    if (streak === 0) return 'Inizia oggi!';
    if (streak === 1) return 'Ottimo inizio!';
    if (streak < 7) return 'Continua così!';
    if (streak < 30) return 'Fantastico!';
    return 'Incredibile!';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 90) return 'Eccellente!';
    if (score >= 80) return 'Molto bene!';
    if (score >= 70) return 'Buono!';
    if (score >= 60) return 'Discreto';
    return 'Da migliorare';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        title="Quiz Completati"
        value={stats?.total_quiz_sessions || 0}
        icon={<Trophy className="h-5 w-5" />}
        description="Quiz totali"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Ore di Studio"
        value={stats?.total_study_hours || 0}
        icon={<Clock className="h-5 w-5" />}
        description="Tempo investito"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Punteggio Medio"
        value={stats?.average_score || 0}
        icon={<Target className="h-5 w-5" />}
        description={getScoreDescription(stats?.average_score || 0)}
        trend={stats?.average_score && stats.average_score >= 70 ? 'up' : 'neutral'}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Giorni Consecutivi"
        value={stats?.current_streak || 0}
        icon={<Flame className="h-5 w-5" />}
        description={getStreakDescription(stats?.current_streak || 0)}
        trend={stats?.current_streak && stats.current_streak > 0 ? 'up' : 'neutral'}
        isLoading={isLoading}
      />
      
      <StatCard
        title="XP Totali"
        value={stats?.total_xp || 0}
        icon={<Star className="h-5 w-5" />}
        description="Punti esperienza"
        isLoading={isLoading}
      />
    </div>
  );
};

export default StatsOverview;