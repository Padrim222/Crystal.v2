import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

  const handleSendMessage = async () => {
    if (!input.trim() || !activeConversation) return;

    const messageContent = input.trim();
    setInput("");

    try {
      // Send user message
      await sendMessage(activeConversation.id, messageContent, 'user');

      // Generate Crystal's response using OpenAI
      if (type === 'crystal_chat') {
        setIsGeneratingResponse(true);
        
        try {
          // Prepare conversation history for context
          const conversationHistory = messages.slice(-10).map(msg => ({
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
      handleSendMessage();
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

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="Crystal" />
            <AvatarFallback className="bg-gradient-to-r from-coral to-crimson text-white">
              <Sparkles className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">
              {type === 'crystal_chat' ? 'Crystal.ai' : `Conversa sobre ${activeConversation.crush?.name}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <MessageCircle className="h-3 w-3 mr-1" />
                {messages.length} mensagens
              </Badge>
              {isGeneratingResponse && (
                <Badge variant="outline" className="text-xs animate-pulse">
                  <Bot className="h-3 w-3 mr-1" />
                  Crystal está digitando...
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4" ref={scrollRef}>
          <div className="space-y-4 py-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.sender !== 'user' && (
                        <div className="flex-shrink-0 mt-1">
                          {message.sender === 'crystal' ? (
                            <Sparkles className="h-4 w-4 text-coral" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground/70'
                        }`}>
                          {format(new Date(message.timestamp || ''), 'HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isGeneratingResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="bg-muted rounded-2xl px-4 py-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-coral" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-coral rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                type === 'crystal_chat' 
                  ? "Pergunte algo para a Crystal..." 
                  : "Digite sua mensagem..."
              }
              className="flex-1"
              disabled={isGeneratingResponse}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isGeneratingResponse}
              size="icon"
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {type === 'crystal_chat' && (
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("/dicas ")}
                className="text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Dicas
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("/estrategia ")}
                className="text-xs"
              >
                <Target className="h-3 w-3 mr-1" />
                Estratégia
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInput("/perfil ")}
                className="text-xs"
              >
                <User className="h-3 w-3 mr-1" />
                Análise de Perfil
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}