import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

export interface DashboardStats {
  total_quiz_sessions: number;
  total_study_hours: number;
  average_score: number;
  current_streak: number;
  total_xp: number;
}

export interface UserInfo {
  last_active: string | null;
  current_streak: number;
}

export function useDashboardStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      console.log('🔍 useDashboardStats: Starting query for user:', user?.id);
      
      if (!user?.id) {
        console.error('❌ useDashboardStats: User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log('📡 useDashboardStats: Calling RPC with user ID:', user.id);
      const { data, error } = await supabase
        .rpc('get_user_dashboard_stats', { p_user_id: user.id });
      
      if (error) {
        console.error('❌ useDashboardStats: RPC error:', error);
        throw error;
      }
      
      console.log('✅ useDashboardStats: RPC success, data:', data);
      
      return data || {
        total_quiz_sessions: 0,
        total_study_hours: 0,
        average_score: 0,
        current_streak: 0,
        total_xp: 0
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
    cacheTime: 10 * 60 * 1000, // 10 minuti
    refetchOnWindowFocus: false,
  });
}

export interface PerformanceData {
  date: string;
  avg_score: number;
  quiz_count: number;
  total_xp: number;
}

export function usePerformanceData(timeRange: '7days' | '30days' | 'all' = '7days') {
  const { user } = useAuth();
  
  const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 365;
  
  return useQuery({
    queryKey: ['performance-data', user?.id, timeRange],
    queryFn: async (): Promise<PerformanceData[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .rpc('get_performance_chart_data', { 
          p_user_id: user.id,
          p_days: days 
        });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minuti
  });
}

export interface WeakArea {
  topic_id: number;
  topic_name: string;
  subject_name: string;
  accuracy: number;
  last_updated: string;
  priority: 'high' | 'medium' | 'low';
}

export function useWeakAreas() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['weak-areas', user?.id],
    queryFn: async (): Promise<WeakArea[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .rpc('get_weak_areas_with_topics', { p_user_id: user.id });
      
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
    cacheTime: 10 * 60 * 1000, // 10 minuti
    refetchOnWindowFocus: false,
  });
}

export interface RecentActivity {
  last_quiz?: {
    id: number;
    mode: string;
    score: number;
    completed_at: string;
    topic_name: string;
  };
  last_study?: {
    id: number;
    duration: number;
    date: string;
    topic_name: string;
    subject_name: string;
  };
}

export function useRecentActivity() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async (): Promise<RecentActivity> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .rpc('get_recent_activity', { p_user_id: user.id });
      
      if (error) {
        throw error;
      }
      
      return data || {};
    },
    enabled: !!user?.id,
    staleTime: 1 * 60 * 1000, // 1 minuto
    cacheTime: 5 * 60 * 1000, // 5 minuti
    refetchOnWindowFocus: false,
  });
}

export function useUserInfo() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-info', user?.id],
    queryFn: async (): Promise<UserInfo> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('last_active')
        .eq('id', user.id)
        .single();
      
      if (error) {
        throw error;
      }
      
      // Recupera anche il current_streak dalle stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_user_dashboard_stats', { p_user_id: user.id });
      
      if (statsError) {
        throw statsError;
      }
      
      const result = {
        last_active: data?.last_active || null,
        current_streak: statsData?.current_streak || 0
      };
      
      return result;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minuti
    cacheTime: 10 * 60 * 1000, // 10 minuti
    refetchOnWindowFocus: false,
  });
}