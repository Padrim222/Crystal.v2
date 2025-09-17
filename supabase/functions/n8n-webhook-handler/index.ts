import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
}

interface WebhookConfig {
  url: string;
  events: string[];
  active: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('N8N Webhook Handler - Processing request');
    
    const { event, data, timestamp }: WebhookPayload = await req.json();
    
    if (!event || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing event or data' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing webhook event: ${event}`, { data, timestamp });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user settings to check for configured N8N webhooks
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User authentication failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user's webhook configurations (stored in user_settings or a dedicated table)
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('custom_prompt')
      .eq('user_id', user.id)
      .single();

    // For now, we'll use environment variables for N8N webhook URLs
    // In a production app, these would be stored in user settings
    const webhookConfigs: Record<string, WebhookConfig> = {
      crush_events: {
        url: Deno.env.get('N8N_CRUSH_WEBHOOK_URL') || '',
        events: ['crush_added', 'crush_updated', 'crush_deleted'],
        active: true,
      },
      conversation_events: {
        url: Deno.env.get('N8N_CONVERSATION_WEBHOOK_URL') || '',
        events: ['conversation_started', 'conversation_ended', 'message_sent'],
        active: true,
      },
      dashboard_events: {
        url: Deno.env.get('N8N_DASHBOARD_WEBHOOK_URL') || '',
        events: ['dashboard_viewed'],
        active: true,
      },
      analytics_events: {
        url: Deno.env.get('N8N_ANALYTICS_WEBHOOK_URL') || '',
        events: ['stage_changed', 'insight_generated'],
        active: true,
      },
    };

    // Prepare webhook payload
    const webhookPayload = {
      event,
      data: {
        ...data,
        user_id: user.id,
        user_email: user.email,
      },
      timestamp,
      source: 'crystal_ai',
    };

    // Send to relevant N8N webhooks
    const webhookPromises = [];
    
    for (const [configName, config] of Object.entries(webhookConfigs)) {
      if (config.active && config.url && config.events.includes(event)) {
        console.log(`Sending webhook to ${configName}: ${config.url}`);
        
        const webhookPromise = fetch(config.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Crystal-Event': event,
            'X-Crystal-Source': 'crystal-ai-webhook-handler',
          },
          body: JSON.stringify(webhookPayload),
        }).then(response => ({
          configName,
          success: response.ok,
          status: response.status,
          url: config.url,
        })).catch(error => ({
          configName,
          success: false,
          error: error.message,
          url: config.url,
        }));

        webhookPromises.push(webhookPromise);
      }
    }

    // Wait for all webhooks to complete
    const results = await Promise.all(webhookPromises);
    
    console.log('Webhook results:', results);

    // Log webhook activity (you might want to store this in a dedicated table)
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Webhook processed successfully`,
        event,
        webhooks_sent: totalCount,
        webhooks_successful: successCount,
        results: results.map(r => ({
          config: r.configName,
          success: r.success,
          status: r.status || 'error',
        })),
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in N8N webhook handler:', error);
    
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