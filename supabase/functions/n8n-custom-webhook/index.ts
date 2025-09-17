import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

interface CustomWebhookPayload {
  webhook_url: string;
  event_type: string;
  data: any;
  secret?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Custom N8N Webhook - Processing request');
    
    const { webhook_url, event_type, data, secret }: CustomWebhookPayload = await req.json();
    
    if (!webhook_url || !event_type || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing webhook_url, event_type, or data' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Sending custom webhook: ${event_type} to ${webhook_url}`);

    // Prepare the payload for N8N
    const webhookPayload = {
      event: event_type,
      timestamp: new Date().toISOString(),
      source: 'crystal_ai_custom',
      data: data,
    };

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Crystal-Event': event_type,
      'X-Crystal-Source': 'crystal-ai-custom-webhook',
      'User-Agent': 'Crystal.AI/1.0',
    };

    // Add secret header if provided
    if (secret) {
      headers['X-Webhook-Secret'] = secret;
      headers['Authorization'] = `Bearer ${secret}`;
    }

    // Send webhook to N8N
    const response = await fetch(webhook_url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(webhookPayload),
    });

    const responseText = await response.text();
    
    console.log(`Webhook response: ${response.status} - ${responseText}`);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Webhook delivery failed',
          status: response.status,
          response: responseText,
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Webhook delivered successfully',
        event: event_type,
        webhook_url: webhook_url,
        response_status: response.status,
        response_data: responseText,
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in custom N8N webhook:', error);
    
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