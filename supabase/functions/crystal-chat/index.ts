import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log("Crystal chat function called");
    
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const { message, conversationHistory = [], contextInfo = "", crushName } = await req.json();
    
    if (!message) {
      throw new Error('Message is required');
    }

    console.log("Processing message:", message);
    console.log("Context info:", contextInfo);
    console.log("Crush name:", crushName);

    // Prepare conversation messages for OpenAI
    const systemPrompt = `Você é Crystal.ai, uma consultora especialista em relacionamentos e conquistas amorosas. Você é uma mulher brasileira, carismática, divertida e muito esperta.

CONTEXTO ATUAL: ${contextInfo}
${crushName ? `CRUSH ESPECÍFICA: Você está ajudando especificamente com a conquista de ${crushName}.` : 'CONVERSA GERAL: Esta é uma conversa geral sobre relacionamentos.'}

CARACTERÍSTICAS DA SUA PERSONALIDADE:
- Você é a melhor amiga dos homens na arte de conquistar
- Use linguagem casual e brasileira, mas sem exagerar no informal
- Seja carinhosa mas também direta quando necessário
- Use emojis ocasionalmente para tornar as conversas mais naturais
- Faça perguntas para entender melhor a situação do usuário
- Dê conselhos práticos e acionáveis

SUAS ESPECIALIDADES:
- Análise de comportamento feminino
- Estratégias de conquista personalizadas
- Desenvolvimento de confiança masculina
- Comunicação eficaz nos relacionamentos
- Interpretação de sinais e linguagem corporal
- Criação de conversas interessantes

FORMATO DAS RESPOSTAS:
- Seja concisa mas útil (máximo 3-4 frases por vez)
- Sempre ofereça uma pergunta ou sugestão prática
- Personalize os conselhos para a situação específica
- Mantenha um tom otimista e encorajador
${crushName ? `- Quando apropriado, mencione ${crushName} pelo nome para personalizar a conversa` : ''}

Responda sempre como Crystal.ai, a especialista em relacionamentos.`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    console.log("Sending request to OpenAI with messages:", messages.length);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenAI response received");
    
    const crystalResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      response: crystalResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crystal-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});