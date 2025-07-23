import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { ChevronDown, TrendingUp, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { usePerformanceData, PerformanceData } from '@/hooks/useDashboardStats';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface PerformanceChartProps {
  className?: string;
}

const timeRangeLabels = {
  '7days': 'Ultimi 7 giorni',
  '30days': 'Ultimi 30 giorni',
  'all': 'Tutto il tempo'
};

const PerformanceChart = ({ className }: PerformanceChartProps) => {
  const [selectedRange, setSelectedRange] = useState<'7days' | '30days' | 'all'>('7days');
  const { data: performanceData, isLoading, error } = usePerformanceData(selectedRange);

  const formatTooltipDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd MMM yyyy', { locale: it });
    } catch {
      return dateString;
    }
  };

  const formatXAxisDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (selectedRange === '7days') {
        return format(date, 'dd/MM');
      }
      return format(date, 'dd/MM');
    } catch {
      return dateString;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">
            {formatTooltipDate(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {entry.dataKey === 'avg_score' ? 'Punteggio medio:' : 
                 entry.dataKey === 'quiz_count' ? 'Quiz completati:' : 'XP guadagnati:'}
              </span>
              <span className="font-medium text-foreground">
                {entry.dataKey === 'avg_score' ? `${entry.value.toFixed(1)}%` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const getEmptyStateMessage = () => {
    if (error) {
      return "Errore nel caricamento dei dati";
    }
    if (selectedRange === '7days') {
      return "Nessun quiz completato negli ultimi 7 giorni";
    }
    if (selectedRange === '30days') {
      return "Nessun quiz completato negli ultimi 30 giorni";
    }
    return "Nessun dato disponibile";
  };

  const hasData = performanceData && performanceData.length > 0;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-heading">Andamento Performance</CardTitle>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {timeRangeLabels[selectedRange]}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(timeRangeLabels).map(([value, label]) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setSelectedRange(value as '7days' | '30days' | 'all')}
                className={selectedRange === value ? 'bg-accent' : ''}
              >
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : hasData ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-1" />
                <span>Punteggio medio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-chart-2" />
                <span>Quiz completati</span>
              </div>
            </div>
            
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatXAxisDate}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis 
                    yAxisId="score"
                    orientation="left"
                    domain={[0, 100]}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis 
                    yAxisId="count"
                    orientation="right"
                    className="text-xs fill-muted-foreground"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="score"
                    type="monotone"
                    dataKey="avg_score"
                    stroke="hsl(var(--chart-1))"
                    fill="url(#scoreGradient)"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="count"
                    type="monotone"
                    dataKey="quiz_count"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            {hasData && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>
                  {performanceData.length} {performanceData.length === 1 ? 'giorno' : 'giorni'} con attività
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">{getEmptyStateMessage()}</p>
            <p className="text-sm text-muted-foreground">
              Completa alcuni quiz per vedere i tuoi progressi qui!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;