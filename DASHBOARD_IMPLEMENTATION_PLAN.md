# 📊 Piano Tecnico Implementazione Dashboard

## 🎯 Panoramica

Questo documento fornisce un piano tecnico completo per rifare la pagina `/dashboard` rendendola una vera pagina principale per l'utente loggato, con dati reali, design coerente e esperienza utente ottimizzata.

## 📋 Analisi Situazione Attuale

### Problemi Identificati
- **Dati statici**: La dashboard attuale usa dati hardcoded invece di dati reali dal database
- **Stile discordante**: Componenti non allineati al design system esistente
- **UX confusa**: Flusso delle informazioni non ottimizzato
- **Performance**: Mancanza di ottimizzazioni per caricamento dati

### Componenti Esistenti da Migliorare
- `ProgressOverview.tsx`: Usa dati statici, necessita integrazione con database
- `UserStatsDisplay.tsx`: Limitato ai soli XP points
- `ExamCountdown.tsx`: Funzionale ma può essere migliorato
- `WeakAreasQuickPractice.tsx`: Da analizzare e ottimizzare

## 🏗️ Architettura Dati

### Tabelle Database Principali

#### 1. Tabella `users`
```sql
-- Colonne rilevanti per dashboard:
- id (integer, PK)
- email, username, full_name
- xp_points (integer)
- last_active (timestamp)
- is_premium (boolean)
- onboarding_completed (boolean)
- preferences (jsonb)
- created_at (timestamp)
```

#### 2. Tabella `quiz_sessions`
```sql
-- Dati per statistiche quiz:
- user_id (FK to users)
- mode, difficulty
- started_at, completed_at
- total_time_seconds
- score, max_section_score
- xp_earned
- metadata (jsonb)
```

#### 3. Tabella `study_sessions`
```sql
-- Dati per tempo di studio:
- user_id (FK to users)
- subject_id, topic_id
- duration (integer, in seconds)
- date (timestamp)
- difficulty
- question_count
```

#### 4. Tabella `weak_areas`
```sql
-- Aree deboli dell'utente:
- user_id (FK to users)
- topic_id (FK to topics)
- accuracy (integer, percentage)
- last_updated (timestamp)
```

#### 5. Tabella `user_exams`
```sql
-- Esami configurati:
- user_id (FK to users)
- exam_type (enum)
- university, exam_date
- target_score
```

### Query e Aggregazioni Necessarie

#### A. Statistiche Generali Utente
```sql
-- RPC: get_user_dashboard_stats(user_id)
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(p_user_id INTEGER)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_quiz_sessions', (
      SELECT COUNT(*) FROM quiz_sessions 
      WHERE user_id = p_user_id AND completed_at IS NOT NULL
    ),
    'total_study_hours', (
      SELECT COALESCE(SUM(duration), 0) / 3600.0 FROM study_sessions 
      WHERE user_id = p_user_id
    ),
    'average_score', (
      SELECT COALESCE(AVG(score), 0) FROM quiz_sessions 
      WHERE user_id = p_user_id AND score IS NOT NULL
    ),
    'current_streak', (
      -- Calcolo streak giorni consecutivi
      SELECT COUNT(*) FROM (
        SELECT DISTINCT DATE(created_at) as study_date 
        FROM quiz_sessions 
        WHERE user_id = p_user_id 
        ORDER BY study_date DESC
      ) recent_days
    ),
    'total_xp', (
      SELECT COALESCE(xp_points, 0) FROM users WHERE id = p_user_id
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

#### B. Andamento Performance (Ultimi 7/30 giorni)
```sql
-- RPC: get_performance_chart_data(user_id, days)
CREATE OR REPLACE FUNCTION get_performance_chart_data(p_user_id INTEGER, p_days INTEGER DEFAULT 7)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'date', date_trunc('day', created_at),
        'avg_score', AVG(score),
        'quiz_count', COUNT(*),
        'total_xp', SUM(xp_earned)
      ) ORDER BY date_trunc('day', created_at)
    )
    FROM quiz_sessions
    WHERE user_id = p_user_id 
      AND completed_at IS NOT NULL
      AND created_at >= NOW() - INTERVAL '%s days'
    GROUP BY date_trunc('day', created_at)
  );
END;
$$ LANGUAGE plpgsql;
```

#### C. Aree Deboli e Raccomandazioni
```sql
-- RPC: get_weak_areas_with_topics(user_id)
CREATE OR REPLACE FUNCTION get_weak_areas_with_topics(p_user_id INTEGER)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'topic_id', wa.topic_id,
        'topic_name', t.name,
        'subject_name', s.name,
        'accuracy', wa.accuracy,
        'last_updated', wa.last_updated,
        'priority', CASE 
          WHEN wa.accuracy < 50 THEN 'high'
          WHEN wa.accuracy < 70 THEN 'medium'
          ELSE 'low'
        END
      ) ORDER BY wa.accuracy ASC
    )
    FROM weak_areas wa
    JOIN topics t ON wa.topic_id = t.id
    JOIN subjects s ON t.subject_id = s.id
    WHERE wa.user_id = p_user_id
    LIMIT 5
  );
END;
$$ LANGUAGE plpgsql;
```

#### D. Sessione di Studio Recente
```sql
-- RPC: get_recent_activity(user_id)
CREATE OR REPLACE FUNCTION get_recent_activity(p_user_id INTEGER)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'last_quiz', (
        SELECT json_build_object(
          'id', id,
          'mode', mode,
          'score', score,
          'completed_at', completed_at,
          'topic_name', COALESCE(t.name, 'Generale')
        )
        FROM quiz_sessions qs
        LEFT JOIN topics t ON qs.topic_id = t.id
        WHERE qs.user_id = p_user_id AND completed_at IS NOT NULL
        ORDER BY completed_at DESC
        LIMIT 1
      ),
      'last_study', (
        SELECT json_build_object(
          'id', id,
          'duration', duration,
          'date', date,
          'topic_name', COALESCE(t.name, 'Generale'),
          'subject_name', COALESCE(s.name, 'Generale')
        )
        FROM study_sessions ss
        LEFT JOIN topics t ON ss.topic_id = t.id
        LEFT JOIN subjects s ON ss.subject_id = s.id
        WHERE ss.user_id = p_user_id
        ORDER BY date DESC
        LIMIT 1
      )
    )
  );
END;
$$ LANGUAGE plpgsql;
```

## 🎨 Design System e Componenti UI

### Palette Colori Esistente
```css
/* Colori principali da utilizzare */
--primary: 221.2 83.2% 53.3%;        /* Blu principale */
--secondary: 210 40% 96.1%;          /* Grigio chiaro */
--accent: 210 40% 96.1%;             /* Accent grigio */
--chart-1: 221.2 83.2% 53.3%;       /* Blu grafici */
--chart-2: 141.9 69.2% 58%;         /* Verde grafici */
--chart-3: 32.1 94.6% 53.7%;        /* Arancione grafici */
```

### Tipografia
```css
/* Font families da utilizzare */
.font-heading    /* Per titoli principali */
.font-sans       /* Per testo normale */
.text-lg         /* Titoli sezioni */
.text-sm         /* Testo secondario */
.text-xs         /* Labels e metadata */
```

### Componenti UI da Creare/Aggiornare

#### 1. Componente Statistiche Principali
```typescript
// components/dashboard/StatsOverview.tsx
interface StatsOverviewProps {
  stats: {
    totalQuizzes: number;
    studyHours: number;
    averageScore: number;
    currentStreak: number;
    totalXp: number;
  };
  isLoading?: boolean;
}

// Layout: Grid 2x3 su mobile, 5 colonne su desktop
// Icone: Trophy, Clock, Target, Flame, Star
// Animazioni: CountUp per numeri, pulse per loading
```

#### 2. Componente Grafico Performance
```typescript
// components/dashboard/PerformanceChart.tsx
interface PerformanceChartProps {
  data: Array<{
    date: string;
    avgScore: number;
    quizCount: number;
    totalXp: number;
  }>;
  timeRange: '7days' | '30days' | 'all';
  onTimeRangeChange: (range: string) => void;
}

// Libreria: Recharts (già in uso)
// Tipo: LineChart con area fill
// Responsive: ResponsiveContainer
// Tooltip personalizzato con data italiana
```

#### 3. Componente Aree Deboli
```typescript
// components/dashboard/WeakAreasCard.tsx
interface WeakAreasCardProps {
  weakAreas: Array<{
    topicId: number;
    topicName: string;
    subjectName: string;
    accuracy: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  onPracticeClick: (topicId: number) => void;
}

// Design: Lista con progress bars
// Colori: Rosso (high), Giallo (medium), Verde (low)
// CTA: "Ripassa ora" button per ogni area
```

#### 4. Componente Attività Recente
```typescript
// components/dashboard/RecentActivity.tsx
interface RecentActivityProps {
  lastQuiz?: {
    id: number;
    mode: string;
    score: number;
    completedAt: string;
    topicName: string;
  };
  lastStudy?: {
    id: number;
    duration: number;
    date: string;
    topicName: string;
    subjectName: string;
  };
}

// Design: Timeline verticale
// Icone: BookOpen, Target
// Formato date: "2 ore fa", "Ieri", etc.
```

#### 5. Componente Azioni Rapide
```typescript
// components/dashboard/QuickActions.tsx
interface QuickActionsProps {
  onStartQuiz: () => void;
  onContinueStudy: () => void;
  onViewAnalytics: () => void;
  onPracticeWeakAreas: () => void;
}

// Design: Grid 2x2 con icone grandi
// Stile: Card con hover effects
// Icone: Play, BookOpen, BarChart, Target
```

## 🔄 Logica Dati Lato Client

### Hook Personalizzati

#### 1. Hook Dashboard Stats
```typescript
// hooks/useDashboardStats.ts
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useDashboardStats(userId: number) {
  return useQuery({
    queryKey: ['dashboard-stats', userId],
    queryFn: () => apiRequest('GET', `/api/dashboard/stats/${userId}`),
    staleTime: 5 * 60 * 1000, // 5 minuti
    cacheTime: 10 * 60 * 1000, // 10 minuti
    refetchOnWindowFocus: false,
  });
}
```

#### 2. Hook Performance Data
```typescript
// hooks/usePerformanceData.ts
export function usePerformanceData(userId: number, timeRange: string) {
  return useQuery({
    queryKey: ['performance-data', userId, timeRange],
    queryFn: () => apiRequest('GET', `/api/dashboard/performance/${userId}?range=${timeRange}`),
    staleTime: 2 * 60 * 1000, // 2 minuti
    enabled: !!userId,
  });
}
```

#### 3. Hook Real-time Updates
```typescript
// hooks/useRealtimeDashboard.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useRealtimeDashboard(userId: number) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quiz_sessions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          // Invalida cache quando ci sono nuove sessioni
          queryClient.invalidateQueries(['dashboard-stats', userId]);
          queryClient.invalidateQueries(['performance-data', userId]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
```

### Gestione Stato Globale

#### Store Zustand per Dashboard
```typescript
// stores/dashboardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DashboardState {
  selectedTimeRange: '7days' | '30days' | 'all';
  showWelcomeMessage: boolean;
  lastVisit: string | null;
  preferences: {
    showPerformanceChart: boolean;
    showWeakAreas: boolean;
    showRecentActivity: boolean;
  };
  setTimeRange: (range: '7days' | '30days' | 'all') => void;
  setWelcomeMessage: (show: boolean) => void;
  updateLastVisit: () => void;
  updatePreferences: (prefs: Partial<DashboardState['preferences']>) => void;
}

export const useDashboardStore = create<DashboardState>()()
  persist(
    (set) => ({
      selectedTimeRange: '7days',
      showWelcomeMessage: true,
      lastVisit: null,
      preferences: {
        showPerformanceChart: true,
        showWeakAreas: true,
        showRecentActivity: true,
      },
      setTimeRange: (range) => set({ selectedTimeRange: range }),
      setWelcomeMessage: (show) => set({ showWelcomeMessage: show }),
      updateLastVisit: () => set({ lastVisit: new Date().toISOString() }),
      updatePreferences: (prefs) => 
        set((state) => ({ 
          preferences: { ...state.preferences, ...prefs } 
        })),
    }),
    {
      name: 'dashboard-preferences',
    }
  )
);
```

## 🚀 Implementazione Backend

### Endpoint API Necessari

#### 1. Dashboard Stats
```typescript
// server/routes/api/dashboard.ts
app.get('/api/dashboard/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .rpc('get_user_dashboard_stats', { p_user_id: parseInt(userId) });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### 2. Performance Data
```typescript
app.get('/api/dashboard/performance/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { range = '7days' } = req.query;
    
    const days = range === '7days' ? 7 : range === '30days' ? 30 : 365;
    
    const { data, error } = await supabase
      .rpc('get_performance_chart_data', { 
        p_user_id: parseInt(userId),
        p_days: days 
      });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### 3. Weak Areas
```typescript
app.get('/api/dashboard/weak-areas/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .rpc('get_weak_areas_with_topics', { p_user_id: parseInt(userId) });
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 📱 Layout e Responsività

### Struttura Layout Dashboard

```typescript
// pages/dashboard.tsx - Nuova struttura
const Dashboard = () => {
  const { user } = useAuth();
  const { selectedTimeRange } = useDashboardStore();
  
  // Hooks per dati
  const { data: stats, isLoading: statsLoading } = useDashboardStats(user?.id);
  const { data: performance } = usePerformanceData(user?.id, selectedTimeRange);
  const { data: weakAreas } = useWeakAreas(user?.id);
  const { data: recentActivity } = useRecentActivity(user?.id);
  
  // Real-time updates
  useRealtimeDashboard(user?.id);
  
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header con benvenuto */}
      <WelcomeHeader user={user} />
      
      {/* Statistiche principali */}
      <StatsOverview stats={stats} isLoading={statsLoading} />
      
      {/* Layout responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonna principale (2/3 su desktop) */}
        <div className="lg:col-span-2 space-y-6">
          <PerformanceChart 
            data={performance} 
            timeRange={selectedTimeRange}
          />
          <RecentActivity activity={recentActivity} />
        </div>
        
        {/* Sidebar (1/3 su desktop) */}
        <div className="space-y-6">
          <ExamCountdown />
          <WeakAreasCard weakAreas={weakAreas} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};
```

### Breakpoints Responsivi

```css
/* Mobile First Approach */

/* Mobile (default) */
.dashboard-grid {
  @apply grid grid-cols-1 gap-4;
}

.stats-grid {
  @apply grid grid-cols-2 gap-3;
}

/* Tablet */
@media (min-width: 768px) {
  .stats-grid {
    @apply grid-cols-3;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-grid {
    @apply grid-cols-3;
  }
  
  .stats-grid {
    @apply grid-cols-5;
  }
}
```

## ⚡ Ottimizzazioni Performance

### 1. Caching Strategy

```typescript
// lib/queryClient.ts - Configurazione cache
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minuti
      cacheTime: 10 * 60 * 1000, // 10 minuti
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Prefetch dati dashboard
export const prefetchDashboardData = async (userId: number) => {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['dashboard-stats', userId],
      queryFn: () => apiRequest('GET', `/api/dashboard/stats/${userId}`),
    }),
    queryClient.prefetchQuery({
      queryKey: ['performance-data', userId, '7days'],
      queryFn: () => apiRequest('GET', `/api/dashboard/performance/${userId}?range=7days`),
    }),
  ]);
};
```

### 2. Lazy Loading Componenti

```typescript
// Lazy loading per componenti pesanti
const PerformanceChart = lazy(() => import('@/components/dashboard/PerformanceChart'));
const WeakAreasCard = lazy(() => import('@/components/dashboard/WeakAreasCard'));

// Wrapper con Suspense
const LazyPerformanceChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <PerformanceChart {...props} />
  </Suspense>
);
```

### 3. Skeleton Loading States

```typescript
// components/dashboard/skeletons/StatsSkeleton.tsx
export const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i} className="p-4">
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-8 w-12" />
      </Card>
    ))}
  </div>
);
```

## 🎯 Contenuti Dashboard

### 1. Header di Benvenuto
```typescript
// Messaggio personalizzato basato su:
// - Ora del giorno ("Buongiorno", "Buon pomeriggio", "Buonasera")
// - Ultimo accesso ("Bentornato!", "È passato un po' di tempo")
// - Streak ("Continua così!", "Non perdere la serie!")
// - Livello XP ("Complimenti per il livello X!")

const getWelcomeMessage = (user: User, lastVisit: string | null) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera';
  
  const daysSinceLastVisit = lastVisit 
    ? Math.floor((Date.now() - new Date(lastVisit).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
    
  if (daysSinceLastVisit === 0) {
    return `${greeting}, ${user.full_name || user.username}! 👋`;
  } else if (daysSinceLastVisit === 1) {
    return `${greeting}, ${user.full_name || user.username}! Bentornato dopo ieri! 🎯`;
  } else if (daysSinceLastVisit > 7) {
    return `${greeting}, ${user.full_name || user.username}! È passato un po' di tempo, ricominciamo! 💪`;
  } else {
    return `${greeting}, ${user.full_name || user.username}! Bentornato! 🚀`;
  }
};
```

### 2. Statistiche Chiave
- **Quiz Completati**: Numero totale con badge "Questa settimana: +X"
- **Ore di Studio**: Totale con breakdown settimanale
- **Punteggio Medio**: Con trend (↑↓) rispetto alla settimana precedente
- **Streak Giorni**: Giorni consecutivi di attività
- **XP Totali**: Con progress bar verso prossimo livello

### 3. Sezione "Continua da dove hai lasciato"
- **Ultimo Quiz**: "Quiz Logica - 78% - 2 ore fa"
- **Ultima Sessione Studio**: "Chimica Organica - 45 min - Ieri"
- **CTA**: "Riprendi" button per continuare

### 4. Notifiche e Suggerimenti
```typescript
// Logica per suggerimenti automatici
const getSmartSuggestions = (stats: DashboardStats, weakAreas: WeakArea[]) => {
  const suggestions = [];
  
  // Suggerimento basato su streak
  if (stats.currentStreak >= 7) {
    suggestions.push({
      type: 'achievement',
      message: '🔥 Fantastico! Hai una serie di 7 giorni!',
      action: 'Continua così'
    });
  }
  
  // Suggerimento aree deboli
  if (weakAreas.length > 0) {
    const weakestArea = weakAreas[0];
    suggestions.push({
      type: 'improvement',
      message: `💡 Ripassa ${weakestArea.topicName} per migliorare`,
      action: 'Inizia ripasso',
      actionUrl: `/study/${weakestArea.topicId}`
    });
  }
  
  // Suggerimento esame vicino
  // ... altre logiche
  
  return suggestions;
};
```

### 5. Azioni Rapide
- **Inizia Quiz Rapido**: Modal per selezione argomento
- **Ripassa Aree Deboli**: Link diretto alla prima area debole
- **Simulazione Esame**: Se esame configurato
- **Visualizza Analytics**: Link a pagina analytics completa

## 🔧 Implementazione Graduale

### Fase 1: Backend e Database (Settimana 1)
1. Creare RPC functions in Supabase
2. Implementare endpoint API
3. Testare query performance
4. Configurare caching

### Fase 2: Componenti Base (Settimana 2)
1. Creare hook personalizzati
2. Implementare StatsOverview
3. Aggiornare PerformanceChart con dati reali
4. Creare skeleton loading states

### Fase 3: Componenti Avanzati (Settimana 3)
1. Implementare WeakAreasCard
2. Creare RecentActivity
3. Aggiornare QuickActions
4. Implementare WelcomeHeader

### Fase 4: Ottimizzazioni e Real-time (Settimana 4)
1. Configurare real-time updates
2. Implementare prefetching
3. Ottimizzare performance
4. Testing e debugging

### Fase 5: UX e Polish (Settimana 5)
1. Animazioni e transizioni
2. Messaggi personalizzati
3. Responsive design fine-tuning
4. Accessibility improvements

## 📊 Metriche di Successo

### Performance
- **Tempo di caricamento iniziale**: < 2 secondi
- **Time to Interactive**: < 3 secondi
- **Lighthouse Score**: > 90

### UX
- **Bounce Rate**: < 20% (miglioramento da dashboard attuale)
- **Tempo sulla pagina**: > 2 minuti
- **Click-through rate** su azioni rapide: > 30%

### Tecnico
- **Cache Hit Rate**: > 80%
- **API Response Time**: < 500ms
- **Real-time Update Latency**: < 1 secondo

## 🚨 Problemi da Evitare

### 1. Performance
- ❌ **Query N+1**: Usare JOIN e aggregazioni
- ❌ **Over-fetching**: Implementare pagination e lazy loading
- ❌ **Cache invalidation**: Strategia chiara per invalidare cache

### 2. UX
- ❌ **Loading states lunghi**: Skeleton loading e progressive enhancement
- ❌ **Dati stale**: Real-time updates per dati critici
- ❌ **Mobile experience**: Design mobile-first

### 3. Sicurezza
- ❌ **Data exposure**: RLS policies corrette
- ❌ **XSS**: Sanitizzazione input utente
- ❌ **Rate limiting**: Protezione endpoint API

## 🎨 Mockup Visuale

```
┌─────────────────────────────────────────────────────────────┐
│ 👋 Buongiorno, Mario! Bentornato!                          │
│ ⚡ Hai una serie di 5 giorni consecutivi!                   │
└─────────────────────────────────────────────────────────────┘

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 📊  │ │ ⏱️   │ │ 🎯  │ │ 🔥  │ │ ⭐  │
│ 24  │ │18.5h│ │ 68% │ │ 5   │ │1245│
│Quiz │ │Study│ │Avg  │ │Days │ │ XP │
└─────┘ └─────┘ └─────┘ └─────┘ └─────┘

┌─────────────────────────────┐ ┌─────────────────┐
│ 📈 Andamento Performance    │ │ ⏰ Esame TOLC-I │
│                             │ │ 📅 15 giorni    │
│     ╭─╮                     │ │ 🎯 Target: 70%  │
│    ╱   ╲                    │ │ [Configura]    │
│   ╱     ╲╱╲                 │ └─────────────────┘
│  ╱       ╲  ╲               │
│ ╱         ╲  ╲              │ ┌─────────────────┐
│╱           ╲  ╲             │ │ 🎯 Aree Deboli  │
│             ╲  ╲            │ │ • Logica    45% │
│              ╲  ╲           │ │ • Chimica   62% │
│               ╲  ╲          │ │ • Fisica    58% │
│                ╲  ╲         │ │ [Ripassa ora]   │
└─────────────────────────────┘ └─────────────────┘

┌─────────────────────────────┐ ┌─────────────────┐
│ 📚 Attività Recente         │ │ ⚡ Azioni Rapide │
│                             │ │                 │
│ 🎯 Quiz Logica              │ │ [▶️ Inizia Quiz] │
│    78% • 2 ore fa           │ │ [📖 Studia]     │
│                             │ │ [📊 Analytics]  │
│ 📖 Studio Chimica           │ │ [🎯 Ripassa]    │
│    45 min • Ieri            │ │                 │
└─────────────────────────────┘ └─────────────────┘
```

## 🎯 Risultato Atteso

Una dashboard completamente funzionale che:

✅ **Mostra dati reali e aggiornati** dal database Supabase
✅ **Fornisce insights utili** sui progressi dell'utente
✅ **È responsive e performante** su tutti i dispositivi
✅ **Mantiene coerenza visiva** con il design system esistente
✅ **Offre UX ottimizzata** con flusso logico delle informazioni
✅ **Include real-time updates** per dati critici
✅ **Utilizza caching intelligente** per ottimizzare performance
✅ **Fornisce azioni rapide** per migliorare engagement

Questa implementazione trasformerà la dashboard da un semplice placeholder a uno strumento potente e coinvolgente per il monitoraggio dei progressi degli studenti.