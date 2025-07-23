import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WelcomeHeader from '../components/dashboard/WelcomeHeader';
import StatsOverview from '../components/dashboard/StatsOverview';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import WeakAreasCard from '../components/dashboard/WeakAreasCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import QuickActions from '../components/dashboard/QuickActions';
import { useDashboardStats, useUserInfo } from '@/hooks/useDashboardStats';
import { supabase } from '@/lib/supabase';


const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo();

  // Aggiorna last_active quando l'utente accede alla dashboard
  useEffect(() => {
    if (user?.id) {
      supabase.rpc('update_user_last_active', { p_user_id: user.id });
    }
  }, [user?.id]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accesso Richiesto</CardTitle>
            <CardDescription>
              Effettua il login per accedere alla dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Welcome Header */}
        <WelcomeHeader 
          lastVisit={userInfo?.last_active} 
          currentStreak={userInfo?.current_streak || stats?.current_streak} 
        />

        {/* Stats Overview */}
        <StatsOverview stats={stats} isLoading={!stats} />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Charts and Performance */}
          <div className="xl:col-span-2 space-y-6">
            {/* Performance Chart */}
            <PerformanceChart />
            
            {/* Recent Activity */}
            <RecentActivity />
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Weak Areas */}
            <WeakAreasCard />
          </div>
        </div>

        {/* Quick Actions - Full Width */}
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
