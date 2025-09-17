import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface DashboardStats {
  activeCrushes: number;
  pendingMessages: number;
  totalConversations: number;
  successRate: number;
}

interface RecentActivity {
  id: string;
  type: 'crush_added' | 'conversation_started' | 'stage_changed' | 'message_sent';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export const useDashboard = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    activeCrushes: 0,
    pendingMessages: 0,
    totalConversations: 0,
    successRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Get crush statistics
      const { data: crushes, error: crushError } = await supabase
        .from('crushes')
        .select('current_stage')
        .eq('user_id', user.id);

      if (crushError) throw crushError;

      // Get conversation statistics
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select('id, ended_at')
        .eq('user_id', user.id);

      if (convError) throw convError;

      // Calculate statistics
      const activeCrushes = crushes?.length || 0;
      const totalConversations = conversations?.length || 0;
      const activeConversations = conversations?.filter(conv => !conv.ended_at).length || 0;
      
      const relationshipCrushes = crushes?.filter(
        crush => crush.current_stage === 'Relacionamento'
      ).length || 0;
      
      const successRate = activeCrushes > 0 ? 
        Math.round((relationshipCrushes / activeCrushes) * 100) : 0;

      const newStats = {
        activeCrushes,
        pendingMessages: activeConversations, // Simplified for now
        totalConversations,
        successRate,
      };

      setStats(newStats);

      // Trigger N8N webhook with dashboard stats
      await triggerN8NWebhook('dashboard_viewed', { 
        stats: newStats,
        user_id: user.id 
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
      console.error('Error fetching dashboard stats:', err);
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // This is a simplified version - in a real app you'd have an activity log table
      const activities: RecentActivity[] = [
        {
          id: '1',
          type: 'crush_added',
          title: 'Nova paquera adicionada',
          description: 'Maria Silva foi adicionada ao pipeline',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'conversation_started',
          title: 'Conversa com Crystal iniciada',
          description: 'Você começou uma nova sessão de aconselhamento',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          type: 'stage_changed',
          title: 'Paquera progrediu no pipeline',
          description: 'Ana Santos movida para "Encontro"',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setRecentActivity(activities);
    } catch (err) {
      console.error('Error fetching recent activity:', err);
    }
  };

  // Get personalized insights
  const getInsights = () => {
    const insights = [];

    if (stats.activeCrushes === 0) {
      insights.push({
        type: 'suggestion',
        message: 'Que tal adicionar sua primeira paquera ao pipeline?',
        action: 'Adicionar Paquera',
      });
    }

    if (stats.successRate < 50 && stats.activeCrushes > 0) {
      insights.push({
        type: 'tip',
        message: 'Sua taxa de sucesso pode melhorar. Converse com Crystal para dicas!',
        action: 'Conversar com Crystal',
      });
    }

    if (stats.pendingMessages > 0) {
      insights.push({
        type: 'reminder',
        message: `Você tem ${stats.pendingMessages} conversas pendentes.`,
        action: 'Ver Conversas',
      });
    }

    if (stats.activeCrushes >= 5) {
      insights.push({
        type: 'achievement',
        message: 'Parabéns! Você está gerenciando várias paqueras com sucesso!',
        action: 'Ver Pipeline',
      });
    }

    return insights[0] || {
      type: 'default',
      message: 'Tudo funcionando perfeitamente! Continue assim.',
      action: 'Ver Insights',
    };
  };

  // Initialize dashboard data
  const initializeDashboard = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchStats(),
        fetchRecentActivity(),
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  return {
    profile,
    stats,
    recentActivity,
    insights: getInsights(),
    loading,
    error,
    refetch: initializeDashboard,
  };
};

// Helper function to trigger N8N webhooks
const triggerN8NWebhook = async (event: string, data: any) => {
  try {
    await supabase.functions.invoke('n8n-webhook-handler', {
      body: { event, data, timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.warn('Failed to trigger N8N webhook:', error);
    // Don't throw error - webhooks are optional
  }
};