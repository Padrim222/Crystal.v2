import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Insight = Tables<'conversation_insights'>;

export const useInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInsights = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('conversation_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // First, get user's recent conversations and messages
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (
            id,
            content,
            sender,
            timestamp
          ),
          crushes (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(10);

      if (conversationsError) throw conversationsError;

      if (!conversations || conversations.length === 0) {
        throw new Error('Nenhuma conversa encontrada para gerar insights');
      }

      // Call the insights generation edge function
      const { data: insightsData, error: insightsError } = await supabase.functions.invoke('generate-insights', {
        body: {
          conversations: conversations,
          userId: user.id
        }
      });

      if (insightsError) throw insightsError;

      // Refresh insights after generation
      await fetchInsights();

      return insightsData;
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate insights');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = async () => {
    await fetchInsights();
  };

  // Fetch insights on component mount
  useEffect(() => {
    if (user) {
      fetchInsights();
    }
  }, [user]);

  // Stats derived from insights
  const stats = {
    total: insights.length,
    improvement_tips: insights.filter(i => i.insight_type === 'improvement_tip').length,
    relationship_analysis: insights.filter(i => i.insight_type === 'relationship_analysis').length,
    next_steps: insights.filter(i => i.insight_type === 'next_steps').length,
    avgScore: insights.length > 0 
      ? Math.round(insights.reduce((sum, i) => sum + (i.score || 0), 0) / insights.length)
      : 0
  };

  return {
    insights,
    loading,
    error,
    stats,
    generateInsights,
    refreshInsights,
    refetch: fetchInsights
  };
};