import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Crush = Tables<'crushes'>;
type Conversation = Tables<'conversations'> & {
  messages?: Tables<'messages'>[];
};

interface InsightsData {
  crushes: Crush[];
  conversations: Conversation[];
}

export const useInsights = () => {
  const { user } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsightsData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch crushes
      const { data: crushes, error: crushError } = await supabase
        .from('crushes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (crushError) throw crushError;

      // Fetch conversations with messages
      const { data: conversations, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          messages (*)
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (convError) throw convError;

      setData({
        crushes: crushes || [],
        conversations: conversations || []
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar insights';
      setError(errorMessage);
      console.error('Error fetching insights data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, [user]);

  return {
    data,
    loading,
    error,
    refetch: fetchInsightsData
  };
};