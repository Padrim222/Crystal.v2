import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage } from "@/components/ui/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat-message-list";
import { ChatInput } from "@/components/ui/chat-input";
import { CrystalWelcome } from "@/components/CrystalWelcome";
import { ChatAttachments } from "@/components/ChatAttachments";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Send, 
  User, 
  Sparkles,
  Loader2,
  ArrowLeft,
  Heart,
  CornerDownLeft,
  Paperclip,
  Mic,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";
import crystalAvatar from "@/assets/crystal-avatar.jpg";

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
  const [attachedImage, setAttachedImage] = useState<string | undefined>();
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | undefined>();
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

  // Initialize conversation and auto-load last conversation if none specified
  useEffect(() => {
    const initConversation = async () => {
      if (conversationId) {
        // Load existing conversation
        await loadConversationMessages(conversationId);
        setShowWelcome(false);
      } else if (selectedCrushId && !showWelcome) {
        // Start new conversation with selected crush
        await startConversation(selectedCrushId, type);
      } else if (!conversationId && !selectedCrushId && user?.id) {
        // Auto-load the most recent conversation to continue where user left off
        try {
          const { data: lastConversation } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (lastConversation) {
            await loadConversationMessages(lastConversation.id);
            
            // Set crush info if it's a crush conversation
            if (lastConversation.crush_id) {
              const { data: crush } = await supabase
                .from('crushes')
                .select('name')
                .eq('id', lastConversation.crush_id)
                .single();
              
              if (crush) {
                setSelectedCrushId(lastConversation.crush_id);
                setSelectedCrushName(crush.name);
              }
            }
            
            setShowWelcome(false);
            
            // Save to localStorage for faster access next time
            localStorage.setItem('lastConversationId', lastConversation.id);
          }
        } catch (error) {
          console.log('No previous conversation found or error loading:', error);
        }
      }
    };

    if (user?.id) {
      initConversation();
    }
  }, [conversationId, selectedCrushId, type, showWelcome, user?.id]);

  const handleStartChat = async (crushId?: string, crushName?: string) => {
    setSelectedCrushId(crushId);
    setSelectedCrushName(crushName);
    setShowWelcome(false);
    
    // Start conversation
    let conversation;
    if (crushId) {
      conversation = await startConversation(crushId, 'crush_chat');
    } else {
      conversation = await startConversation(undefined, 'crystal_chat');
    }
    
    // Save new conversation ID to localStorage
    if (conversation?.id) {
      localStorage.setItem('lastConversationId', conversation.id);
    }
  };

  const handleGeneralChat = async () => {
    setSelectedCrushId(undefined);
    setSelectedCrushName(undefined);
    setShowWelcome(false);
    const conversation = await startConversation(undefined, 'crystal_chat');
    
    // Save new conversation ID to localStorage
    if (conversation?.id) {
      localStorage.setItem('lastConversationId', conversation.id);
    }
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

  const [input, setInput] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedImage) || !activeConversation || isGeneratingResponse) return;

    const messageContent = input.trim();
    const hasImage = !!attachedImage;
    const imageUrl = attachedImage;
    setInput("");

    try {
      // Send user message with optional image
      let finalMessageContent = messageContent;
      if (hasImage && imageUrl) {
        finalMessageContent = messageContent 
          ? `${messageContent}\n\n[Imagem enviada: ${imageUrl}]`
          : `[Imagem enviada: ${imageUrl}]`;
      }
      
      await sendMessage(activeConversation.id, finalMessageContent, 'user');

      // Update last conversation ID in localStorage for quick access
      localStorage.setItem('lastConversationId', activeConversation.id);

      // Generate Crystal's response using OpenAI
      setIsGeneratingResponse(true);
      
      try {
        // Prepare conversation history for context - use ALL messages for complete memory
        const conversationHistory = (activeConversation.messages || []).map(msg => ({
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
          userId: user.id,
          imageUrl: attachedImage,
          imageBase64: attachedImageBase64
        }
      });

        if (error) {
          console.error('Error calling crystal-chat function:', error);
          throw new Error(error.message || 'Erro ao conectar com a Crystal');
        }

        if (data?.response) {
          await sendMessage(activeConversation.id, data.response, 'crystal');
          
          // Clear attached image after sending
          if (attachedImage) {
            setAttachedImage(undefined);
            setAttachedImageBase64(undefined);
          }
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

  // Custom message renderer with image support
  const renderMessage = (content: string, sender: 'user' | 'crystal') => {
    // Extract image URLs from message content
    const imagePattern = /\[Imagem enviada: (.*?)\]/g;
    const images: string[] = [];
    let textContent = content;
    
    let match;
    while ((match = imagePattern.exec(content)) !== null) {
      images.push(match[1]);
      textContent = textContent.replace(match[0], '').trim();
    }

    const formattedText = textContent
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br/>');

    return { text: formattedText, images };
  };

  const handleImageSelect = (imageUrl: string, imageBase64: string) => {
    setAttachedImage(imageUrl);
    setAttachedImageBase64(imageBase64);
  };

  const handleImageRemove = () => {
    setAttachedImage(undefined);
    setAttachedImageBase64(undefined);
  };

  const handleMicrophoneClick = () => {
    // TODO: Implement voice recording
  };

  return (
    <div className="h-full flex flex-col">
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
          <AvatarImage src={crystalAvatar} alt="Crystal" />
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
      <div className="flex-1 overflow-hidden">
        <ChatMessageList smooth>
          {transformedMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ChatBubble variant={message.sender === 'user' ? 'sent' : 'received'}>
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={message.sender === 'crystal' ? crystalAvatar : undefined}
                  fallback={message.sender === 'user' ? 'US' : 'C'}
                />
                <ChatBubbleMessage
                  variant={message.sender === 'user' ? 'sent' : 'received'}
                >
                  {(() => {
                    const { text, images } = renderMessage(message.content, message.sender);
                    return (
                      <div className="space-y-2">
                        {/* Render images first */}
                        {images.length > 0 && (
                          <div className="space-y-2">
                            {images.map((imageUrl, idx) => (
                              <div key={idx} className="relative max-w-xs">
                                <img
                                  src={imageUrl}
                                  alt={`Imagem ${idx + 1}`}
                                  className="w-full rounded-lg object-cover max-h-64 cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => window.open(imageUrl, '_blank')}
                                  onError={(e) => {
                                    console.error('Error loading image:', imageUrl);
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Render text content */}
                        {text && (
                          <div 
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: text }}
                          />
                        )}
                        
                        <div className="text-xs opacity-70 mt-2">
                          {format(message.timestamp, 'HH:mm', { locale: ptBR })}
                        </div>
                      </div>
                    );
                  })()}
                </ChatBubbleMessage>
              </ChatBubble>
            </motion.div>
          ))}
          
          {isGeneratingResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-8 w-8 shrink-0"
                  src={crystalAvatar}
                  fallback="C"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            </motion.div>
          )}
        </ChatMessageList>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        {/* Image Preview */}
        {attachedImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-2 border border-border rounded-lg bg-muted/20"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={attachedImage}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-md"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Imagem anexada</p>
                <p className="text-xs text-muted-foreground">Pronta para enviar</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageRemove}
                disabled={isGeneratingResponse}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        <form
          onSubmit={handleSendMessage}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring p-1"
        >
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              attachedImage 
                ? "Descreva o que você quer saber sobre essa imagem..."
                : selectedCrushName ? `Conversar sobre ${selectedCrushName}...` : "Conversar com Crystal..."
            }
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
            disabled={isGeneratingResponse}
          />
          <div className="flex items-center p-3 pt-0 justify-between">
            <div className="flex">
              <ChatAttachments
                onImageSelect={handleImageSelect}
                currentImage={attachedImage}
                onImageRemove={handleImageRemove}
                disabled={isGeneratingResponse}
              />

              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleMicrophoneClick}
                disabled={isGeneratingResponse}
              >
                <Mic className="size-4" />
              </Button>
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="ml-auto gap-1.5"
              disabled={(!input.trim() && !attachedImage) || isGeneratingResponse}
            >
              {isGeneratingResponse ? "Enviando..." : "Enviar"}
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}