import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface AnalyticsSummary {
  total_quiz_sessions: number;
  average_score: number;
  total_study_time_hours: number;
  total_xp_earned: number;
  exam_sessions_completed: number;
}

export interface QuizSessionsSummary {
  total_quiz_sessions: number;
  average_score: number;
  total_correct_answers: number;
  total_questions: number;
  last_attempt_date: string | null;
}

export interface StudySessionsSummary {
  total_study_sessions: number;
  average_score: number;
  total_correct_answers: number;
  total_questions: number;
  last_attempt_date: string | null;
}

export interface PerformanceTrendPoint {
  date: string;
  average_score: number;
  sessions_count: number;
  total_time_minutes: number;
}

export interface TopicPerformance {
  topic_id: number;
  topic_name: string;
  subject_name: string;
  average_score: number;
  sessions_count: number;
  total_time_minutes: number;
  accuracy: number;
}

export interface StudyTimeDistribution {
  activity_type: string;
  total_minutes: number;
  sessions_count: number;
  percentage: number;
}

export function useAnalyticsSummary() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: result, error } = await supabase
          .rpc('get_user_analytics_summary', { p_user_id: user.id });

        if (error) throw error;
        
        setData(result);
      } catch (err) {
        console.error('Error fetching analytics summary:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user?.id]);

  return { data, loading, error, refetch: () => setLoading(true) };
}

export function usePerformanceTrend(days: number = 30) {
  const [data, setData] = useState<PerformanceTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchTrend = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: result, error } = await supabase
          .rpc('get_user_performance_trend', { 
            p_user_id: user.id, 
            p_days: days 
          });

        if (error) throw error;
        
        setData(result || []);
      } catch (err) {
        console.error('Error fetching performance trend:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [user?.id, days]);

  return { data, loading, error };
}

export function useTopicPerformance() {
  const [data, setData] = useState<TopicPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchTopicPerformance = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: result, error } = await supabase
          .rpc('get_user_topic_performance', { p_user_id: user.id });

        if (error) throw error;
        
        setData(result || []);
      } catch (err) {
        console.error('Error fetching topic performance:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchTopicPerformance();
  }, [user?.id]);

  return { data, loading, error };
}

export function useStudyTimeDistribution() {
  const [data, setData] = useState<StudyTimeDistribution[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchDistribution = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: distributionData, error: distributionError } = await supabase
          .rpc('get_user_study_time_distribution', { user_id_param: user.id });

        if (distributionError) {
          throw distributionError;
        }

        setData(distributionData || []);
      } catch (err) {
        console.error('Error fetching study time distribution:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento della distribuzione tempo');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, [user?.id]);

  return { data, loading, error };
}

export function useQuizSessionsSummary() {
  const [data, setData] = useState<QuizSessionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: summaryData, error: summaryError } = await supabase
          .rpc('get_quiz_sessions_summary', { user_id_param: user.id });

        if (summaryError) {
          throw summaryError;
        }

        setData(summaryData?.[0] || null);
      } catch (err) {
        console.error('Error fetching quiz sessions summary:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche quiz');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user?.id]);

  return { data, loading, error };
}

export function useStudySessionsSummary() {
  const [data, setData] = useState<StudySessionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: summaryData, error: summaryError } = await supabase
          .rpc('get_study_sessions_summary', { user_id_param: user.id });

        if (summaryError) {
          throw summaryError;
        }

        setData(summaryData?.[0] || null);
      } catch (err) {
        console.error('Error fetching study sessions summary:', err);
        setError(err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche test per materia');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [user?.id]);

  return { data, loading, error };
}