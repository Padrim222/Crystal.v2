import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Conversation = Tables<'conversations'>;
type Message = Tables<'messages'>;
type ConversationInsert = TablesInsert<'conversations'>;
type MessageInsert = TablesInsert<'messages'>;

interface ConversationWithMessages extends Conversation {
  messages?: Message[];
  crush?: Tables<'crushes'>;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [activeConversation, setActiveConversation] = useState<ConversationWithMessages | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all conversations for current user
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          crushes (
            id,
            name,
            age,
            current_stage
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar conversas';
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

  // Start new conversation
  const startConversation = async (crushId?: string, type: string = 'crystal_chat') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const conversationData: ConversationInsert = {
        user_id: user.id,
        type,
        crush_id: crushId || null,
        started_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('conversations')
        .insert(conversationData)
        .select(`
          *,
          crushes (
            id,
            name,
            age,
            current_stage
          )
        `)
        .single();

      if (error) throw error;

      setConversations(prev => [data, ...prev]);
      setActiveConversation(data);

      // Trigger N8N webhook for new conversation
      await triggerN8NWebhook('conversation_started', { 
        conversation: data,
        crush_id: crushId 
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao iniciar conversa';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Send message in conversation
  const sendMessage = async (conversationId: string, content: string, sender: string = 'user') => {
    try {
      const messageData: MessageInsert = {
        conversation_id: conversationId,
        content,
        sender,
        timestamp: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Update conversation's updated_at timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Update local state
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: [...(conv.messages || []), data],
              updated_at: new Date().toISOString()
            }
          : conv
      ));

      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), data],
          updated_at: new Date().toISOString()
        } : null);
      }

      // Trigger N8N webhook for new message
      await triggerN8NWebhook('message_sent', { 
        message: data,
        conversation_id: conversationId,
        sender 
      });

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar mensagem';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Load conversation messages
  const loadConversationMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Update conversation with messages
      const updatedConversation = conversations.find(conv => conv.id === conversationId);
      if (updatedConversation) {
        const conversationWithMessages = {
          ...updatedConversation,
          messages: data || []
        };
        
        setActiveConversation(conversationWithMessages);
        setConversations(prev => prev.map(conv => 
          conv.id === conversationId ? conversationWithMessages : conv
        ));
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar mensagens';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // End conversation
  const endConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          ended_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              ended_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : conv
      ));

      // Trigger N8N webhook for conversation end
      await triggerN8NWebhook('conversation_ended', { 
        conversation_id: conversationId 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao finalizar conversa';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  // Get conversation statistics
  const stats = {
    total: conversations.length,
    active: conversations.filter(conv => !conv.ended_at).length,
    withCrush: conversations.filter(conv => conv.crush_id).length,
    crystal: conversations.filter(conv => conv.type === 'crystal_chat').length,
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    activeConversation,
    stats,
    loading,
    error,
    startConversation,
    sendMessage,
    loadConversationMessages,
    endConversation,
    setActiveConversation,
    refetch: fetchConversations,
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