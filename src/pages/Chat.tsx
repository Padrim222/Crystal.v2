import { useState } from "react";
import { RealTimeChat } from "@/components/RealTimeChat";
import { ConversationsList } from "@/components/ConversationsList";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users, Brain, Settings } from "lucide-react";
import { motion } from "framer-motion";

const Chat = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'conversations' | 'insights' | 'settings'>('chat');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>();

  const tabs = [
    { id: 'chat', label: 'Chat Crystal', icon: MessageCircle },
    { id: 'conversations', label: 'Conversas', icon: Users },
    { id: 'insights', label: 'Insights', icon: Brain },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Como posso te ajudar hoje?
          </h1>
          <p className="text-gray-300 text-lg">
            Sua consultora pessoal em relacionamentos está aqui para você
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex bg-black/20 backdrop-blur-sm rounded-xl p-1 border border-white/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`
                    relative px-4 py-2 text-sm font-medium transition-all duration-200
                    ${activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        >
          {activeTab === 'chat' && (
            <div className="p-6">
              <RealTimeChat 
                type="crystal_chat" 
                conversationId={selectedConversationId}
              />
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className="p-6">
              <ConversationsList 
                onSelectConversation={(conversation) => {
                  setSelectedConversationId(conversation.id);
                  setActiveTab('chat');
                }}
                selectedConversationId={selectedConversationId}
              />
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="p-6 text-center text-white">
              <div className="max-w-md mx-auto">
                <Brain className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Insights em Desenvolvimento</h3>
                <p className="text-gray-300">
                  Em breve, Crystal analisará suas conversas e fornecerá insights personalizados
                  para melhorar seus relacionamentos.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-6 text-center text-white">
              <div className="max-w-md mx-auto">
                <Settings className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Configurações</h3>
                <p className="text-gray-300">
                  Personalize sua experiência com Crystal.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-8 space-x-4"
        >
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            💡 Dica Rápida
          </Button>
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            ❤️ Nova Paquera
          </Button>
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            📊 Meu Progresso
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;