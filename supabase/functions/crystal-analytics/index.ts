import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  data: any;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Crystal Analytics - Processing request');
    
    const { event_type, data, user_id, timestamp }: AnalyticsEvent = await req.json();
    
    if (!event_type || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing event_type or data' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user from auth header if not provided
    let userId = user_id;
    if (!userId) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(
          authHeader.replace('Bearer ', '')
        );
        userId = user?.id;
      }
    }

    console.log(`Processing analytics event: ${event_type}`, { userId, data });

    // Generate insights based on event type
    const insights = await generateInsights(event_type, data, userId);
    
    // Prepare analytics payload
    const analyticsPayload = {
      event_type,
      user_id: userId,
      data,
      insights,
      timestamp: timestamp || new Date().toISOString(),
      source: 'crystal_ai',
    };

    // Send analytics to N8N webhook if configured
    const analyticsWebhookUrl = Deno.env.get('N8N_ANALYTICS_WEBHOOK_URL');
    if (analyticsWebhookUrl) {
      try {
        await fetch(analyticsWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Crystal-Event': 'analytics_processed',
          },
          body: JSON.stringify(analyticsPayload),
        });
        console.log('Analytics sent to N8N webhook');
      } catch (error) {
        console.warn('Failed to send analytics to N8N:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        event_type,
        insights,
        message: 'Analytics processed successfully'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in Crystal Analytics:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function generateInsights(eventType: string, data: any, userId?: string) {
  const insights: any = {
    event_type: eventType,
    processed_at: new Date().toISOString(),
    recommendations: [],
  };

  try {
    // Get user data for personalized insights
    let userData = null;
    if (userId) {
      const { data: crushes } = await supabase
        .from('crushes')
        .select('*')
        .eq('user_id', userId);

      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId);

      userData = { crushes, conversations };
    }

    switch (eventType) {
      case 'crush_added':
        insights.recommendations = [
          'Comece com uma conversa leve e descontraída',
          'Mostre interesse genuíno nos hobbies dela',
          'Use humor apropriado para quebrar o gelo'
        ];
        break;

      case 'conversation_started':
        insights.recommendations = [
          'Seja autêntico e verdadeiro',
          'Faça perguntas abertas para conhecê-la melhor',
          'Compartilhe experiências interessantes'
        ];
        break;

      case 'stage_changed':
        const newStage = data.new_stage || data.stage;
        if (newStage === 'Encontro') {
          insights.recommendations = [
            'Escolha um local neutro e público',
            'Seja pontual e apresentável',
            'Tenha tópicos de conversa preparados'
          ];
        } else if (newStage === 'Relacionamento') {
          insights.recommendations = [
            'Parabéns! Continue sendo você mesmo',
            'Comunicação é a chave do sucesso',
            'Compartilhem experiências juntos'
          ];
        }
        break;

      case 'message_sent':
        insights.recommendations = [
          'Dê tempo para ela responder',
          'Evite mensagens muito longas',
          'Seja interessante mas não invasivo'
        ];
        break;

      case 'dashboard_viewed':
        if (userData?.crushes?.length === 0) {
          insights.recommendations = [
            'Que tal adicionar sua primeira paquera?',
            'Comece devagar e seja natural',
            'A Crystal está aqui para ajudar!'
          ];
        } else if (userData?.crushes?.length >= 5) {
          insights.recommendations = [
            'Você está gerenciando bem suas conquistas!',
            'Foque na qualidade das conversas',
            'Considere marcar encontros presenciais'
          ];
        }
        break;

      default:
        insights.recommendations = [
          'Continue sendo autêntico',
          'A paciência é uma virtude na conquista',
          'Crystal está sempre aqui para ajudar'
        ];
    }

    // Add personalized insights based on user data
    if (userData) {
      const totalCrushes = userData.crushes?.length || 0;
      const totalConversations = userData.conversations?.length || 0;
      
      insights.stats = {
        total_crushes: totalCrushes,
        total_conversations: totalConversations,
        success_rate: totalCrushes > 0 ? Math.round((totalConversations / totalCrushes) * 100) : 0
      };

      if (insights.stats.success_rate > 70) {
        insights.recommendations.unshift('Sua taxa de sucesso está excelente!');
      } else if (insights.stats.success_rate < 30) {
        insights.recommendations.unshift('A Crystal pode te ajudar a melhorar suas abordagens');
      }
    }

  } catch (error) {
    console.error('Error generating insights:', error);
    insights.error = 'Failed to generate personalized insights';
  }

  return insights;
}