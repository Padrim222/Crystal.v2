import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { supabase } from "../_shared/supabase.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Generate insights function called");
    
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { conversations, userId } = await req.json();
    
    if (!conversations || !userId) {
      throw new Error('Conversations and userId are required');
    }

    console.log("Processing insights for user:", userId);
    console.log("Number of conversations:", conversations.length);

    // Prepare conversation data for analysis
    const conversationSummaries = conversations.map((conv: any) => {
      const messages = conv.messages || [];
      const crushName = conv.crushes?.name || 'Conversa Geral';
      const userMessages = messages.filter((m: any) => m.sender === 'user');
      const crystalMessages = messages.filter((m: any) => m.sender === 'crystal');
      
      return {
        crushName,
        type: conv.type,
        messageCount: messages.length,
        userMessageCount: userMessages.length,
        crystalMessageCount: crystalMessages.length,
        lastMessages: messages.slice(-5).map((m: any) => ({
          sender: m.sender,
          content: m.content.substring(0, 200) // Limit content for API
        })),
        conversationId: conv.id,
        crushId: conv.crush_id
      };
    });

    const systemPrompt = `Você é Crystal.ai, uma especialista em relacionamentos e conquistas amorosas. Analise as conversas do usuário e gere insights valiosos.

INSTRUÇÕES PARA ANÁLISE:
- Analise os padrões de comunicação do usuário
- Identifique pontos de melhoria específicos
- Sugira próximos passos práticos
- Forneça análises de relacionamento personalizadas
- Seja específica e prática nas suas recomendações

TIPOS DE INSIGHTS:
1. improvement_tip: Dicas específicas para melhorar comunicação ou abordagem
2. relationship_analysis: Análise do progresso/status com cada pessoa
3. next_steps: Próximas ações recomendadas

Para cada insight, forneça:
- Um título claro e específico
- Conteúdo detalhado e acionável
- Um score de relevância (0-100)
- O tipo apropriado

Responda APENAS com um array JSON de insights no formato:
[
  {
    "type": "improvement_tip",
    "title": "Título específico",
    "content": "Conteúdo detalhado e prático",
    "score": 85,
    "conversation_id": "uuid ou null",
    "crush_id": "uuid ou null"
  }
]

Gere entre 3-8 insights baseados nas conversas fornecidas.`;

    console.log("Sending request to OpenAI");

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Analise estas conversas e gere insights:\n\n${JSON.stringify(conversationSummaries, null, 2)}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response received");
    
    const insightsText = data.choices[0].message.content;
    console.log("Generated insights text:", insightsText);

    // Parse the JSON response
    let generatedInsights;
    try {
      generatedInsights = JSON.parse(insightsText);
    } catch (jsonError) {
      console.error("JSON parse error:", jsonError);
      console.error("Raw response:", insightsText);
      throw new Error("Failed to parse insights from AI response");
    }

    if (!Array.isArray(generatedInsights)) {
      throw new Error("AI response is not an array of insights");
    }

    // Insert insights into database
    const insightsToInsert = generatedInsights.map((insight: any) => ({
      user_id: userId,
      conversation_id: insight.conversation_id || null,
      crush_id: insight.crush_id || null,
      insight_type: insight.type,
      title: insight.title,
      content: insight.content,
      score: insight.score || 0
    }));

    console.log("Inserting insights into database:", insightsToInsert.length);

    const { data: insertedInsights, error: insertError } = await supabase
      .from('conversation_insights')
      .insert(insightsToInsert)
      .select();

    if (insertError) {
      console.error("Database insert error:", insertError);
      throw insertError;
    }

    console.log("Successfully inserted insights:", insertedInsights?.length);

    return new Response(JSON.stringify({ 
      success: true,
      insights: insertedInsights,
      count: insertedInsights?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});