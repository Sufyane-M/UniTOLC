# 📊 Proposta Implementazione Sezione Analytics

## 🎯 Panoramica

Questa proposta dettagliata descrive come implementare una dashboard analytics funzionale e dinamica per la web-app StudentExamPrep, sostituendo l'attuale versione con dati statici.

## 📋 Analisi Database Esistente

### Tabelle Chiave Identificate

1. **quiz_sessions** - Sessioni di quiz completate
   - `user_id`, `score`, `total_time_seconds`, `completed_at`, `topic_id`, `difficulty`
   - Contiene metadati JSON con informazioni dettagliate

2. **exam_sessions** - Sessioni di esami TOLC
   - `user_id`, `exam_type`, `status`, `started_at`, `completed_at`
   - Metadati JSON con punteggi per sezione

3. **tolc_section_attempts** - Tentativi per sezione TOLC
   - `session_id`, `section_id`, `score`, `time_spent`, `answers`
   - Traccia performance dettagliate per argomento

4. **user_quiz_attempts** - Tentativi individuali di quiz
   - `user_id`, `quiz_id`, `score`, `correct_answers`, `total_questions`, `time_spent`

5. **study_sessions** - Sessioni di studio
   - `user_id`, `subject_id`, `topic_id`, `duration`, `date`

6. **weak_areas** - Aree deboli dell'utente
   - `user_id`, `topic_id`, `accuracy`

7. **topics** e **subjects** - Organizzazione degli argomenti

## 🏗️ Architettura Proposta

### 1. Backend: Funzioni RPC Supabase

Creare funzioni PostgreSQL ottimizzate per aggregare i dati:

#### A. Funzione per Statistiche Generali
```sql
CREATE OR REPLACE FUNCTION get_user_analytics_summary(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_quiz_sessions', (
            SELECT COUNT(*) 
            FROM quiz_sessions 
            WHERE user_id = p_user_id AND completed_at IS NOT NULL
        ),
        'average_score', (
            SELECT ROUND(AVG(score::numeric), 2) 
            FROM quiz_sessions 
            WHERE user_id = p_user_id AND score IS NOT NULL
        ),
        'total_study_time_hours', (
            SELECT ROUND(SUM(total_time_seconds::numeric) / 3600, 1) 
            FROM quiz_sessions 
            WHERE user_id = p_user_id AND completed_at IS NOT NULL
        ),
        'total_xp_earned', (
            SELECT COALESCE(SUM(xp_earned), 0) 
            FROM quiz_sessions 
            WHERE user_id = p_user_id
        ),
        'exam_sessions_completed', (
            SELECT COUNT(*) 
            FROM exam_sessions 
            WHERE user_id = p_user_id AND completed_at IS NOT NULL
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;
```

#### B. Funzione per Trend Performance
```sql
CREATE OR REPLACE FUNCTION get_user_performance_trend(p_user_id INTEGER, p_days INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'date', DATE(completed_at),
            'average_score', ROUND(AVG(score::numeric), 2),
            'sessions_count', COUNT(*)
        ) ORDER BY DATE(completed_at)
    )
    FROM quiz_sessions
    WHERE user_id = p_user_id 
        AND completed_at IS NOT NULL 
        AND completed_at >= NOW() - INTERVAL '%s days'
        AND score IS NOT NULL
    GROUP BY DATE(completed_at)
    INTO result;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;
```

#### C. Funzione per Performance per Argomento
```sql
CREATE OR REPLACE FUNCTION get_user_topic_performance(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'topic_name', t.name,
            'subject_name', s.name,
            'average_score', ROUND(AVG(qs.score::numeric), 2),
            'sessions_count', COUNT(qs.id),
            'total_time_minutes', ROUND(SUM(qs.total_time_seconds::numeric) / 60, 1),
            'accuracy_percentage', COALESCE(wa.accuracy, 0)
        )
    )
    FROM quiz_sessions qs
    JOIN topics t ON qs.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    LEFT JOIN weak_areas wa ON wa.user_id = qs.user_id AND wa.topic_id = qs.topic_id
    WHERE qs.user_id = p_user_id 
        AND qs.completed_at IS NOT NULL
        AND qs.score IS NOT NULL
    GROUP BY t.id, t.name, s.name, wa.accuracy
    ORDER BY AVG(qs.score::numeric) DESC
    INTO result;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;
```

#### D. Funzione per Distribuzione Tempo di Studio
```sql
CREATE OR REPLACE FUNCTION get_user_study_time_distribution(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'subject_name', s.name,
            'total_hours', ROUND(SUM(ss.duration::numeric) / 60, 1),
            'sessions_count', COUNT(ss.id)
        )
    )
    FROM study_sessions ss
    JOIN subjects s ON ss.subject_id = s.id
    WHERE ss.user_id = p_user_id
    GROUP BY s.id, s.name
    ORDER BY SUM(ss.duration) DESC
    INTO result;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql;
```

### 2. Frontend: Hooks React Personalizzati

#### A. Hook per Dati Analytics
```typescript
// hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface AnalyticsSummary {
  total_quiz_sessions: number;
  average_score: number;
  total_study_time_hours: number;
  total_xp_earned: number;
  exam_sessions_completed: number;
}

interface PerformanceTrend {
  date: string;
  average_score: number;
  sessions_count: number;
}

interface TopicPerformance {
  topic_name: string;
  subject_name: string;
  average_score: number;
  sessions_count: number;
  total_time_minutes: number;
  accuracy_percentage: number;
}

interface StudyTimeDistribution {
  subject_name: string;
  total_hours: number;
  sessions_count: number;
}

export const useAnalyticsSummary = () => {
  const { user } = useAuth();
  
  return useQuery<AnalyticsSummary>({
    queryKey: ['analytics-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('get_user_analytics_summary', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
  });
};

export const usePerformanceTrend = (days: number = 30) => {
  const { user } = useAuth();
  
  return useQuery<PerformanceTrend[]>({
    queryKey: ['performance-trend', user?.id, days],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('get_user_performance_trend', {
        p_user_id: user.id,
        p_days: days
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopicPerformance = () => {
  const { user } = useAuth();
  
  return useQuery<TopicPerformance[]>({
    queryKey: ['topic-performance', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('get_user_topic_performance', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useStudyTimeDistribution = () => {
  const { user } = useAuth();
  
  return useQuery<StudyTimeDistribution[]>({
    queryKey: ['study-time-distribution', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('get_user_study_time_distribution', {
        p_user_id: user.id
      });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};
```

### 3. Componenti UI Aggiornati

#### A. Componente Statistiche Principali
```typescript
// components/analytics/StatsSummary.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Library, Clock, Award } from "lucide-react";
import { useAnalyticsSummary } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const StatsSummary = () => {
  const { data: stats, isLoading, error } = useAnalyticsSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center text-muted-foreground mb-8">
        Errore nel caricamento delle statistiche
      </div>
    );
  }

  const statCards = [
    {
      icon: Calculator,
      value: `${stats.average_score || 0}%`,
      label: "Punteggio medio",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: Library,
      value: stats.total_quiz_sessions || 0,
      label: "Quiz completati",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: Clock,
      value: `${stats.total_study_time_hours || 0}h`,
      label: "Tempo di studio",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      icon: Award,
      value: stats.total_xp_earned || 0,
      label: "XP guadagnati",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className={`${stat.bgColor} p-3 rounded-full mb-4`}>
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsSummary;
```

#### B. Componente Grafico Performance
```typescript
// components/analytics/PerformanceChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { usePerformanceTrend } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const PerformanceChart = () => {
  const { data: trendData, isLoading } = usePerformanceTrend(30);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Andamento Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    );
  }

  const formattedData = trendData?.map(item => ({
    ...item,
    date: format(new Date(item.date), 'dd/MM', { locale: it })
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Andamento Performance (Ultimi 30 giorni)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs text-muted-foreground" />
              <YAxis domain={[0, 100]} className="text-xs text-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(17, 24, 39, 0.9)',
                  color: 'white',
                  borderRadius: '0.375rem',
                  border: 'none',
                  padding: '0.5rem'
                }}
                formatter={(value, name) => [
                  `${value}%`,
                  name === 'average_score' ? 'Punteggio medio' : name
                ]}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="average_score"
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
  );
};

export default PerformanceChart;
```

## 🎨 Visualizzazioni Proposte

### 1. Dashboard Principale
- **Cards Statistiche**: Punteggio medio, quiz completati, tempo studio, XP
- **Grafico a Linee**: Trend performance negli ultimi 30 giorni
- **Grafico a Barre**: Performance per argomento/materia
- **Grafico a Torta**: Distribuzione tempo di studio per materia

### 2. Sezioni Aggiuntive
- **Heatmap Calendario**: Attività giornaliera
- **Radar Chart**: Punti di forza/debolezza per materia
- **Progress Bars**: Progressi verso obiettivi
- **Tabella Dettagliata**: Sessioni recenti con filtri

## 🔧 Implementazione Tecnica

### 1. Librerie Consigliate
- **Recharts**: Già presente, ottima per grafici responsive
- **date-fns**: Per formattazione date
- **React Query**: Già presente, per caching e sincronizzazione

### 2. Ottimizzazioni Database
```sql
-- Indici per migliorare performance
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_completed 
ON quiz_sessions(user_id, completed_at) 
WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_exam_sessions_user_completed 
ON exam_sessions(user_id, completed_at) 
WHERE completed_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_date 
ON study_sessions(user_id, date);
```

### 3. Gestione Errori e Loading States
- Skeleton components durante il caricamento
- Fallback per dati mancanti
- Retry automatico per errori di rete
- Messaggi informativi per utenti senza dati

## 📱 Responsività

- **Mobile**: Stack verticale, grafici ottimizzati
- **Tablet**: Layout a 2 colonne
- **Desktop**: Layout completo a 4 colonne

## 🚀 Piano di Implementazione

### Fase 1: Backend (1-2 giorni)
1. Creare funzioni RPC Supabase
2. Aggiungere indici database
3. Testare performance query

### Fase 2: Hooks e Logica (1 giorno)
1. Implementare hooks React Query
2. Gestire stati di loading/error
3. Aggiungere TypeScript types

### Fase 3: Componenti UI (2-3 giorni)
1. Aggiornare componenti esistenti
2. Creare nuovi componenti analytics
3. Implementare responsive design

### Fase 4: Testing e Ottimizzazione (1 giorno)
1. Test con dati reali
2. Ottimizzazioni performance
3. Debugging e refinement

## 🎯 Risultato Atteso

Una dashboard analytics completamente funzionale che:
- Mostra dati reali e aggiornati
- Fornisce insights utili sui progressi
- È responsive e performante
- Mantiene lo stile visivo esistente
- Utilizza caching intelligente per ottimizzare le performance

Questa implementazione trasformerà la sezione analytics da un semplice placeholder a uno strumento potente per il monitoraggio dei progressi degli studenti.