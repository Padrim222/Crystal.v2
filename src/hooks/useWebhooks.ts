import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CustomWebhook {
  url: string;
  secret?: string;
  events: string[];
  active: boolean;
}

export const useWebhooks = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Send custom webhook to N8N
  const sendCustomWebhook = async (
    webhookUrl: string, 
    eventType: string, 
    data: any, 
    secret?: string
  ) => {
    try {
      setLoading(true);
      
      const { data: response, error } = await supabase.functions.invoke('n8n-custom-webhook', {
        body: {
          webhook_url: webhookUrl,
          event_type: eventType,
          data,
          secret,
        }
      });

      if (error) throw error;

      toast({
        title: 'Webhook enviado',
        description: `Evento ${eventType} enviado para N8N com sucesso`,
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar webhook';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Test webhook connection
  const testWebhook = async (webhookUrl: string, secret?: string) => {
    return sendCustomWebhook(
      webhookUrl,
      'webhook_test',
      {
        message: 'Teste de conexão do Crystal.AI',
        timestamp: new Date().toISOString(),
        test: true,
      },
      secret
    );
  };

  // Send analytics event
  const sendAnalytics = async (eventType: string, data: any) => {
    try {
      const { data: response, error } = await supabase.functions.invoke('crystal-analytics', {
        body: {
          event_type: eventType,
          data,
          timestamp: new Date().toISOString(),
        }
      });

      if (error) throw error;
      return response;
    } catch (error) {
      console.warn('Failed to send analytics:', error);
      // Don't show error to user - analytics are optional
    }
  };

  // Webhook templates for common N8N integrations
  const webhookTemplates = {
    discord_notification: {
      name: 'Notificação Discord',
      description: 'Enviar notificações para canal do Discord',
      events: ['crush_added', 'stage_changed', 'conversation_started'],
      payload_example: {
        username: 'Crystal.AI',
        content: 'Nova paquera adicionada ao pipeline! 💕',
        embeds: [{
          title: 'Crystal.AI - Atualização',
          description: 'Sua paquera progrediu no pipeline',
          color: 15418782, // Pink color
        }]
      }
    },
    slack_notification: {
      name: 'Notificação Slack',
      description: 'Enviar mensagens para canal do Slack',
      events: ['crush_added', 'stage_changed', 'relationship_milestone'],
      payload_example: {
        text: 'Crystal.AI - Nova atualização',
        blocks: [{
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Nova paquera adicionada!* 💕\nSua conquista está progredindo bem!'
          }
        }]
      }
    },
    email_automation: {
      name: 'Automação de Email',
      description: 'Enviar emails automáticos baseados em eventos',
      events: ['stage_changed', 'insight_generated', 'reminder_scheduled'],
      payload_example: {
        to: 'user@example.com',
        subject: 'Crystal.AI - Atualização do seu pipeline',
        body: 'Sua paquera progrediu para o próximo estágio!'
      }
    },
    calendar_integration: {
      name: 'Integração com Calendário',
      description: 'Criar eventos no calendário para encontros',
      events: ['stage_changed'],
      conditions: { stage: 'Encontro' },
      payload_example: {
        title: 'Encontro com {crush_name}',
        description: 'Encontro marcado através do Crystal.AI',
        start_time: new Date().toISOString(),
        duration: 120, // minutes
      }
    },
    crm_update: {
      name: 'Atualização CRM',
      description: 'Sincronizar dados com sistema CRM',
      events: ['crush_added', 'stage_changed', 'conversation_started'],
      payload_example: {
        contact: {
          name: '{crush_name}',
          stage: '{current_stage}',
          last_interaction: '{last_interaction}',
          source: 'Crystal.AI'
        }
      }
    }
  };

  return {
    sendCustomWebhook,
    testWebhook,
    sendAnalytics,
    webhookTemplates,
    loading,
  };
};