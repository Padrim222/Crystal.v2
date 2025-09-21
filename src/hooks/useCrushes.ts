import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

type Crush = Tables<'crushes'>;
type CrushInsert = TablesInsert<'crushes'>;
type CrushUpdate = TablesUpdate<'crushes'>;

export const useCrushes = () => {
  const [crushes, setCrushes] = useState<Crush[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all crushes for current user
  const fetchCrushes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crushes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCrushes(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar paqueras';
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

  // Add new crush
  const addCrush = async (crushData: Omit<CrushInsert, 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('crushes')
        .insert({ ...crushData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setCrushes(prev => [data, ...prev]);
      toast({
        title: 'Sucesso',
        description: 'Nova paquera adicionada com sucesso!',
      });

      // Trigger N8N webhook for new crush
      await triggerN8NWebhook('crush_added', { crush: data });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar paquera';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Update crush
  const updateCrush = async (id: string, updates: CrushUpdate) => {
    try {
      const { data, error } = await supabase
        .from('crushes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCrushes(prev => prev.map(crush => 
        crush.id === id ? data : crush
      ));

      // Trigger N8N webhook for crush update
      await triggerN8NWebhook('crush_updated', { crush: data, updates });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar paquera';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Delete crush
  const deleteCrush = async (id: string) => {
    try {
      const { error } = await supabase
        .from('crushes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCrushes(prev => prev.filter(crush => crush.id !== id));
      toast({
        title: 'Sucesso',
        description: 'Paquera removida com sucesso!',
      });

      // Trigger N8N webhook for crush deletion
      await triggerN8NWebhook('crush_deleted', { crush_id: id });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover paquera';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Move crush to different stage
  const moveCrushStage = async (id: string, newStage: string) => {
    return updateCrush(id, { 
      current_stage: newStage, 
      updated_at: new Date().toISOString() 
    });
  };

  // Update crush position (for drag and drop)
  const updateCrushPosition = async (id: string, newStage: string, newPosition: number) => {
    try {
      // First, update the dragged crush
      const { data, error } = await supabase
        .from('crushes')
        .update({ 
          current_stage: newStage, 
          position: newPosition,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Then, update positions of other crushes in the same stage
      const stagecrushes = crushesByStage[newStage] || [];
      const updates = stagecrushes
        .filter(crush => crush.id !== id)
        .map((crush, index) => ({
          id: crush.id,
          position: index >= newPosition ? index + 1 : index
        }));

      if (updates.length > 0) {
        for (const update of updates) {
          await supabase
            .from('crushes')
            .update({ position: update.position })
            .eq('id', update.id);
        }
      }

      // Refresh data
      await fetchCrushes();

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar posição';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Group crushes by stage and sort by position
  const crushesByStage = crushes.reduce((acc, crush) => {
    const stage = crush.current_stage || 'Primeiro Contato';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(crush);
    return acc;
  }, {} as Record<string, Crush[]>);

  // Sort each stage by position
  Object.keys(crushesByStage).forEach(stage => {
    crushesByStage[stage].sort((a, b) => (a.position || 0) - (b.position || 0));
  });

  // Get crush statistics
  const stats = {
    total: crushes.length,
    byStage: {
      'Primeiro Contato': crushesByStage['Primeiro Contato']?.length || 0,
      'Conversa Inicial': crushesByStage['Conversa Inicial']?.length || 0,
      'Encontro': crushesByStage['Encontro']?.length || 0,
      'Relacionamento': crushesByStage['Relacionamento']?.length || 0,
    },
    successRate: crushes.length > 0 ? 
      Math.round((crushesByStage['Relacionamento']?.length || 0) / crushes.length * 100) : 0
  };

  useEffect(() => {
    fetchCrushes();
  }, []);

  return {
    crushes,
    crushesByStage,
    stats,
    loading,
    error,
    addCrush,
    updateCrush,
    deleteCrush,
    moveCrushStage,
    updateCrushPosition,
    refetch: fetchCrushes,
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