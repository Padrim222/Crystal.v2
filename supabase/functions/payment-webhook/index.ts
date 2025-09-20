import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentWebhookPayload {
  event_type: string;
  user_email?: string;
  user_id?: string;
  plan_type?: string;
  payment_status: string;
  transaction_id: string;
  payment_data?: any;
  external_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Payment Webhook - Processing request');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the webhook payload
    const payload: PaymentWebhookPayload = await req.json();
    console.log('Payment webhook received:', payload);

    const { 
      event_type, 
      user_email, 
      user_id, 
      plan_type = 'premium',
      payment_status,
      transaction_id,
      payment_data,
      external_id
    } = payload;

    // Find user by email or ID
    let targetUserId = user_id;
    
    if (!targetUserId && user_email) {
      // Search by email in profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user_email)
        .single();

      if (profileError) {
        console.error('Error finding user by email:', profileError);
        return new Response(
          JSON.stringify({ error: 'User not found' }), 
          { status: 404, headers: corsHeaders }
        );
      }

      targetUserId = profile.id;
    }

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'User ID or email required' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    // Process different event types
    switch (event_type) {
      case 'payment_completed':
      case 'subscription_activated':
        // Create or update subscription
        const subscriptionData = {
          user_id: targetUserId,
          plan_type: plan_type,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          external_id: external_id || transaction_id,
          payment_data: payment_data || {
            transaction_id,
            payment_status,
            processed_at: new Date().toISOString()
          }
        };

        const { data: subscription, error: subError } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (subError) {
          console.error('Error creating/updating subscription:', subError);
          return new Response(
            JSON.stringify({ error: 'Failed to update subscription' }), 
            { status: 500, headers: corsHeaders }
          );
        }

        console.log('Subscription activated:', subscription);
        break;

      case 'payment_failed':
      case 'subscription_cancelled':
        // Deactivate subscription
        const { error: deactivateError } = await supabase
          .from('subscriptions')
          .update({ 
            status: event_type === 'payment_failed' ? 'inactive' : 'cancelled',
            payment_data: {
              ...payment_data,
              cancelled_at: new Date().toISOString(),
              reason: event_type
            }
          })
          .eq('user_id', targetUserId);

        if (deactivateError) {
          console.error('Error deactivating subscription:', deactivateError);
          return new Response(
            JSON.stringify({ error: 'Failed to deactivate subscription' }), 
            { status: 500, headers: corsHeaders }
          );
        }

        console.log('Subscription deactivated for user:', targetUserId);
        break;

      case 'subscription_renewed':
        // Extend subscription
        const { error: renewError } = await supabase
          .from('subscriptions')
          .update({ 
            expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            payment_data: {
              ...payment_data,
              renewed_at: new Date().toISOString(),
              transaction_id
            }
          })
          .eq('user_id', targetUserId);

        if (renewError) {
          console.error('Error renewing subscription:', renewError);
          return new Response(
            JSON.stringify({ error: 'Failed to renew subscription' }), 
            { status: 500, headers: corsHeaders }
          );
        }

        console.log('Subscription renewed for user:', targetUserId);
        break;

      default:
        console.warn('Unknown event type:', event_type);
        break;
    }

    // Send success webhook to N8N if configured
    const n8nWebhookUrl = Deno.env.get('N8N_PAYMENT_WEBHOOK_URL');
    if (n8nWebhookUrl) {
      try {
        await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'payment_processed',
            user_id: targetUserId,
            plan_type,
            status: payment_status,
            timestamp: new Date().toISOString(),
            ...payload
          })
        });
        console.log('Notification sent to N8N');
      } catch (error) {
        console.warn('Failed to notify N8N:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment processed successfully',
        user_id: targetUserId,
        event_type
      }), 
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Payment webhook error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), 
      { status: 500, headers: corsHeaders }
    );
  }
});