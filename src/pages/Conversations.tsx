import React, { useState } from "react";
import { motion } from "framer-motion";
import { ConversationsList } from "@/components/ConversationsList";
import { RealTimeChat } from "@/components/RealTimeChat";
import { MessageCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Conversation = Tables<'conversations'>;

const Conversations = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 h-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <ConversationsList
            onSelectConversation={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <RealTimeChat
              conversationId={selectedConversation.id}
              crushId={selectedConversation.crush_id || undefined}
              type={selectedConversation.type}
            />
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-lg">
              <div className="text-center space-y-4">
                <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Selecione uma conversa
                  </h3>
                  <p className="text-muted-foreground">
                    Escolha uma conversa existente ou inicie uma nova para começar
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Conversations;