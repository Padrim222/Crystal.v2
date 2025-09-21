import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Heart, 
  MessageCircle, 
  Target,
  User,
  Plus,
  ArrowRight
} from "lucide-react";
import { useCrushes } from "@/hooks/useCrushes";
import { AddCrushDialog } from "./AddCrushDialog";

interface CrystalWelcomeProps {
  onStartChat: (crushId?: string, crushName?: string) => void;
  onGeneralChat: () => void;
}

export const CrystalWelcome: React.FC<CrystalWelcomeProps> = ({
  onStartChat,
  onGeneralChat
}) => {
  const { crushes, loading } = useCrushes();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCrush, setSelectedCrush] = useState<string | null>(null);

  const handleSelectCrush = (crushId: string, crushName: string) => {
    setSelectedCrush(crushId);
    setTimeout(() => {
      onStartChat(crushId, crushName);
    }, 300);
  };

  return (
    <div className="min-h-[600px] flex flex-col">
      {/* Crystal Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-6 border-b border-border/20"
      >
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt="Crystal" />
              <AvatarFallback className="bg-gradient-to-r from-coral to-crimson text-white text-2xl">
                <Sparkles className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"
            >
              <Sparkles className="h-4 w-4 text-white" />
            </motion.div>
          </div>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold bg-gradient-to-r from-coral to-crimson bg-clip-text text-transparent mb-2"
        >
          Olá! Eu sou a Crystal 💎
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground max-w-md mx-auto"
        >
          Sua consultora pessoal de relacionamentos. Vamos conquistar juntos? 
          Escolha sobre qual garota você quer conversar ou vamos bater um papo geral!
        </motion.p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold mb-4">Como posso te ajudar hoje?</h3>
        
        <div className="grid gap-3">
          <Button
            onClick={onGeneralChat}
            variant="outline"
            className="justify-start h-auto p-4 bg-gradient-to-r from-background to-muted/50 hover:from-muted/50 hover:to-muted border-primary/20"
          >
            <MessageCircle className="h-5 w-5 mr-3 text-coral" />
            <div className="text-left">
              <div className="font-medium">Conversa Geral</div>
              <div className="text-sm text-muted-foreground">Dicas, estratégias e conselhos gerais</div>
            </div>
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </motion.div>

      {/* Crushes Section */}
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-coral" />
            Suas Crushes
          </h3>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            className="bg-gradient-to-r from-coral to-crimson hover:from-coral/80 hover:to-crimson/80"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar
          </Button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : crushes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 border-2 border-dashed border-border/40 rounded-lg"
          >
            <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              Ainda não há crushes cadastradas. Que tal adicionar a primeira?
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Crush
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            <AnimatePresence>
              {crushes.map((crush, index) => (
                <motion.div
                  key={crush.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                      selectedCrush === crush.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-transparent hover:border-primary/30'
                    }`}
                    onClick={() => handleSelectCrush(crush.id, crush.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                            {crush.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h4 className="font-semibold">{crush.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {crush.current_stage}
                            </Badge>
                            {crush.age && (
                              <span className="text-xs text-muted-foreground">
                                {crush.age} anos
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Target className="h-3 w-3 text-coral" />
                            <span className="text-xs font-medium">
                              {crush.interest_level}/10
                            </span>
                          </div>
                          {crush.last_interaction && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(crush.last_interaction).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AddCrushDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onCrushAdded={() => {
          // Refresh crushes after adding
          window.location.reload();
        }}
      />
    </div>
  );
};