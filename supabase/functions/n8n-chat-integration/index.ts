import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

interface ChatRequest {
  message: string;
  sessionId: string;
  timestamp?: string;
  source?: string;
  user_id?: string;
}

interface ChatResponse {
  response: string;
  sessionId: string;
  timestamp: string;
  metadata?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('N8N Chat Integration - Processing request');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify webhook secret (optional but recommended)
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('N8N_WEBHOOK_SECRET');
    
    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.warn('Invalid webhook secret');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse the chat request from N8N
    const chatRequest: ChatRequest = await req.json();
    console.log('Chat request received:', chatRequest);

    const { message, sessionId, user_id, source = 'n8n' } = chatRequest;

    if (!message || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Message and sessionId are required' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    // Find or create conversation
    let conversation = null;
    let targetUserId = user_id;

    // Try to find existing conversation by sessionId
    const { data: existingConv, error: convError } = await supabase
      .from('conversations')
      .select('*, profiles!inner(email)')
      .eq('id', sessionId)
      .maybeSingle();

    if (convError && convError.code !== 'PGRST116') {
      console.error('Error finding conversation:', convError);
    }

    if (existingConv) {
      conversation = existingConv;
      targetUserId = existingConv.user_id;
    } else if (targetUserId) {
      // Create new conversation for the user
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          id: sessionId,
          user_id: targetUserId,
          type: 'crystal_chat',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create conversation' }), 
          { status: 500, headers: corsHeaders }
        );
      }

      conversation = newConv;
    } else {
      return new Response(
        JSON.stringify({ error: 'User ID required for new conversations' }), 
        { status: 400, headers: corsHeaders }
      );
    }

    // Store user message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      });

    if (messageError) {
      console.error('Error storing user message:', messageError);
    }

    // Get user's Crystal personality settings
    const { data: userSettings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    // Get recent conversation context (last 10 messages)
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('content, sender, timestamp')
      .eq('conversation_id', conversation.id)
      .order('timestamp', { ascending: false })
      .limit(10);

    // Prepare Crystal's personality prompt
    const personalityPrompt = userSettings ? `
Você é a Crystal, uma especialista em relacionamentos com uma personalidade única:
- Safada: ${userSettings.personality_safada}%
- Fofa: ${userSettings.personality_fofa}%
- Consciente: ${userSettings.personality_conscious}%
- Calma: ${userSettings.personality_calma}%

Comportamentos:
- Usar palavrões: ${userSettings.behavior_palavrao ? 'Sim' : 'Não'}
- Humor: ${userSettings.behavior_humor ? 'Sim' : 'Não'}
- Direta: ${userSettings.behavior_direta ? 'Sim' : 'Não'}
- Romântica: ${userSettings.behavior_romantica ? 'Sim' : 'Não'}

${userSettings.custom_prompt ? `Prompt personalizado: ${userSettings.custom_prompt}` : ''}
    ` : `
Você é a Crystal, uma consultora especialista em relacionamentos. Seja carismática, direta e útil.
    `;

    // Prepare conversation context
    const contextMessages = recentMessages?.reverse().map(msg => 
      `${msg.sender === 'user' ? 'Usuário' : 'Crystal'}: ${msg.content}`
    ).join('\n') || '';

    // Generate Crystal's response using OpenAI via N8N (or direct call)
    const crystalPrompt = `${personalityPrompt}

Contexto da conversa:
${contextMessages}

Nova mensagem do usuário: ${message}

Responda como Crystal de forma natural e útil:`;

    // Here you can either:
    // 1. Call OpenAI directly (if API key is available)
    // 2. Forward to another N8N endpoint for AI processing
    // 3. Use a simple rule-based response for testing

    const openAiApiKey = Deno.env.get('OPENAI_API_KEY');
    let crystalResponse = "Oi! Sou a Crystal, sua consultora de relacionamentos. Como posso te ajudar hoje? 💕";

    if (openAiApiKey) {
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: crystalPrompt },
              { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.8
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          crystalResponse = aiData.choices[0]?.message?.content || crystalResponse;
        }
      } catch (aiError) {
        console.warn('AI API call failed, using fallback response:', aiError);
      }
    }

    // Store Crystal's response
    const { error: crystalMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        content: crystalResponse,
        sender: 'crystal',
        timestamp: new Date().toISOString()
      });

    if (crystalMessageError) {
      console.error('Error storing Crystal message:', crystalMessageError);
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id);

    // Prepare response for N8N
    const response: ChatResponse = {
      response: crystalResponse,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      metadata: {
        conversation_id: conversation.id,
        user_id: targetUserId,
        source: source,
        personality_applied: !!userSettings
      }
    };

    console.log('Sending response to N8N:', response);

    return new Response(
      JSON.stringify(response), 
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('N8N Chat Integration error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }), 
      { status: 500, headers: corsHeaders }
    );
  }
});