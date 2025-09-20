import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations } from "@/hooks/useConversations";
import { 
  MessageCircle, 
  Plus, 
  Sparkles, 
  User,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import type { Tables } from "@/integrations/supabase/types";

type Conversation = Tables<'conversations'>;

interface ConversationsListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export function ConversationsList({ 
  onSelectConversation, 
  selectedConversationId 
}: ConversationsListProps) {
  const { conversations, startConversation, loading } = useConversations();

  const handleNewConversation = async () => {
    try {
      const newConversation = await startConversation(undefined, 'crystal_chat');
      if (newConversation) {
        onSelectConversation(newConversation);
      }
    } catch (error) {
      console.error('Error starting new conversation:', error);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversas
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-2">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant={selectedConversationId === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start h-auto p-3 text-left"
                  onClick={() => onSelectConversation(conversation)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src="" alt="Avatar" />
                      <AvatarFallback className="bg-gradient-to-r from-coral to-crimson text-white text-xs">
                        {conversation.type === 'crystal_chat' ? (
                          <Sparkles className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {conversation.type === 'crystal_chat' 
                            ? 'Crystal.ai' 
                            : conversation.crush?.name || 'Conversa'
                          }
                        </h4>
                        {conversation.started_at && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(conversation.started_at), 'HH:mm', { locale: ptBR })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {conversation.type === 'crystal_chat' ? 'Crystal' : 'Paquera'}
                        </Badge>
                        
                        {!conversation.ended_at && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Ativa
                          </Badge>
                        )}
                      </div>
                      
                      {conversation.updated_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Atualizada {format(new Date(conversation.updated_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhuma conversa ainda</p>
                <Button
                  onClick={handleNewConversation}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Iniciar primeira conversa
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}