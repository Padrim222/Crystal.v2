import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { V0AiChat } from "@/components/ui/v0-ai-chat";
import { CrystalWelcome } from "@/components/CrystalWelcome";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  MessageCircle,
  Loader2,
  Target,
  ArrowLeft,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Message = Tables<'messages'>;
type Conversation = Tables<'conversations'>;

interface RealTimeChatProps {
  conversationId?: string;
  crushId?: string;
  type?: string;
}

export function RealTimeChat({ 
  conversationId, 
  crushId, 
  type = 'crystal_chat' 
}: RealTimeChatProps) {
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedCrushId, setSelectedCrushId] = useState<string | undefined>(crushId);
  const [selectedCrushName, setSelectedCrushName] = useState<string | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    activeConversation,
    startConversation,
    sendMessage,
    loadConversationMessages,
    setActiveConversation
  } = useConversations();

  // Initialize conversation if needed
  useEffect(() => {
    const initConversation = async () => {
      if (conversationId) {
        // Load existing conversation
        await loadConversationMessages(conversationId);
        setShowWelcome(false);
      } else if (selectedCrushId && !showWelcome) {
        // Start new conversation with selected crush
        await startConversation(selectedCrushId, type);
      }
    };

    initConversation();
  }, [conversationId, selectedCrushId, type, showWelcome]);

  const handleStartChat = async (crushId?: string, crushName?: string) => {
    setSelectedCrushId(crushId);
    setSelectedCrushName(crushName);
    setShowWelcome(false);
    
    // Start conversation
    if (crushId) {
      await startConversation(crushId, 'crush_chat');
    } else {
      await startConversation(undefined, 'crystal_chat');
    }
  };

  const handleGeneralChat = () => {
    setSelectedCrushId(undefined);
    setSelectedCrushName(undefined);
    setShowWelcome(false);
    startConversation(undefined, 'crystal_chat');
  };

  const handleBackToWelcome = () => {
    setShowWelcome(true);
    setActiveConversation(null);
    setSelectedCrushId(undefined);
    setSelectedCrushName(undefined);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || !activeConversation) return;

    try {
      // Send user message
      await sendMessage(activeConversation.id, messageContent, 'user');

      // Generate Crystal's response using OpenAI
      setIsGeneratingResponse(true);
      
      try {
        // Prepare conversation history for context
        const conversationHistory = (activeConversation.messages || []).slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));

      // Get user's personalization settings
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Enhanced context for Crystal based on conversation type, crush info, and user personalization
      let contextInfo = "";
      let personalityModifier = "";
      
      if (userSettings) {
        // Build personality context based on user preferences
        const traits = [];
        if (userSettings.personality_safada > 70) traits.push("mais safada e provocante");
        if (userSettings.personality_fofa > 70) traits.push("mais fofa e carinhosa");
        if (userSettings.personality_conscious > 70) traits.push("mais consciente e reflexiva");
        if (userSettings.personality_calma > 70) traits.push("mais calma e paciente");
        
        const behaviors = [];
        if (userSettings.behavior_palavrao) behaviors.push("usar palavrões quando apropriado");
        if (userSettings.behavior_humor) behaviors.push("usar humor");
        if (userSettings.behavior_direta) behaviors.push("ser mais direta");
        if (userSettings.behavior_romantica) behaviors.push("ser mais romântica");
        
        if (traits.length > 0) {
          personalityModifier += `PERSONALIDADE AJUSTADA: Seja ${traits.join(', ')}. `;
        }
        if (behaviors.length > 0) {
          personalityModifier += `COMPORTAMENTOS: ${behaviors.join(', ')}. `;
        }
        if (userSettings.custom_prompt) {
          personalityModifier += `INSTRUÇÕES PERSONALIZADAS: ${userSettings.custom_prompt} `;
        }
      }

      if (selectedCrushId && selectedCrushName) {
        contextInfo = `Você está ajudando o usuário com a conquista de ${selectedCrushName}. `;
      } else {
        contextInfo = "Esta é uma conversa geral sobre relacionamentos. ";
      }

      // Call Crystal chat edge function
      const { data, error } = await supabase.functions.invoke('crystal-chat', {
        body: {
          message: messageContent,
          conversationHistory: conversationHistory,
          contextInfo: contextInfo + personalityModifier,
          crushName: selectedCrushName,
          userId: user.id
        }
      });

        if (error) {
          console.error('Error calling crystal-chat function:', error);
          throw new Error(error.message || 'Erro ao conectar com a Crystal');
        }

        if (data?.response) {
          await sendMessage(activeConversation.id, data.response, 'crystal');
        } else {
          throw new Error('Resposta inválida da Crystal');
        }
        
      } catch (error) {
        console.error('Crystal AI error:', error);
        
        // Fallback response
        const fallbackResponse = "Ops! Tive um problema técnico agora, mas estou aqui para te ajudar. Pode repetir sua pergunta? 😊";
        await sendMessage(activeConversation.id, fallbackResponse, 'crystal');
        
        toast({
          title: "Aviso",
          description: "Crystal teve um problema momentâneo, mas já está funcionando novamente.",
          variant: "default"
        });
      } finally {
        setIsGeneratingResponse(false);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
    }
  };

  if (showWelcome) {
    return (
      <CrystalWelcome 
        onStartChat={handleStartChat}
        onGeneralChat={handleGeneralChat}
      />
    );
  }

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Iniciando conversa com a Crystal...</p>
        </div>
      </div>
    );
  }

  // Transform messages for display
  const transformedMessages = (activeConversation.messages || []).map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender as 'user' | 'crystal',
    timestamp: new Date(msg.timestamp || '')
  }));

  const getChatTitle = () => {
    if (selectedCrushName) {
      return `Conversando sobre ${selectedCrushName}`;
    }
    return 'Conversa com Crystal';
  };

  // Custom markdown renderer for Crystal responses
  const renderMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/40 bg-background/80 shrink-0">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBackToWelcome}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        
        <Avatar className="h-8 w-8">
          <AvatarImage src="" alt="Crystal" />
          <AvatarFallback className="bg-gradient-to-r from-coral to-crimson text-white">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{getChatTitle()}</h3>
          <div className="flex items-center gap-2">
            {selectedCrushName && (
              <Badge variant="secondary" className="text-xs">
                <Heart className="h-3 w-3 mr-1" />
                {selectedCrushName}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {transformedMessages.length} msgs
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {transformedMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'crystal' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-coral to-crimson text-white">
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-first' : ''}`}>
                <div 
                  className={`p-3 rounded-2xl ${
                    message.sender === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMessage(message.content) 
                    }}
                  />
                </div>
                <div className={`text-xs text-muted-foreground mt-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {format(message.timestamp, 'HH:mm', { locale: ptBR })}
                </div>
              </div>
              
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </motion.div>
          ))}
          
          {isGeneratingResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-gradient-to-r from-coral to-crimson text-white">
                  <Sparkles className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted text-foreground p-3 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Crystal está digitando...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="shrink-0 p-4 border-t border-border/40">
        <V0AiChat
          onSendMessage={handleSendMessage}
          isGeneratingResponse={isGeneratingResponse}
          placeholder={selectedCrushName ? `Conversar sobre ${selectedCrushName}...` : "Conversar com Crystal..."}
          title=""
          showTitle={false}
        />
      </div>
    </div>
  );
}