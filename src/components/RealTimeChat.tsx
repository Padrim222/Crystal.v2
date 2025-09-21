import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatedAIChat } from "@/components/ui/animated-ai-chat";
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
  Target
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
  const [input, setInput] = useState("");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
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
      } else if (!activeConversation) {
        // Start new conversation
        await startConversation(crushId, type);
      }
    };

    initConversation();
  }, [conversationId, crushId, type]);

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
      if (type === 'crystal_chat') {
        setIsGeneratingResponse(true);
        
        try {
          // Prepare conversation history for context
          const conversationHistory = (activeConversation.messages || []).slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content
          }));

          // Call Crystal chat edge function
          const { data, error } = await supabase.functions.invoke('crystal-chat', {
            body: {
              message: messageContent,
              conversationHistory: conversationHistory
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Iniciando conversa...</p>
        </div>
      </div>
    );
  }

  const messages = activeConversation.messages || [];

  // Transform messages for AnimatedAIChat component
  const transformedMessages = messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender as 'user' | 'crystal',
    timestamp: new Date(msg.timestamp || '')
  }));

  return (
    <div className="h-[600px]">
      <AnimatedAIChat
        messages={transformedMessages}
        onSendMessage={handleSendMessage}
        isGeneratingResponse={isGeneratingResponse}
        className="h-full"
      />
    </div>
  );
}