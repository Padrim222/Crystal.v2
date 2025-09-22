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

  return (
    <div className="min-h-[500px] flex flex-col">
      {/* Header */}
      <div className="text-center p-6">
        <Avatar className="h-16 w-16 mx-auto mb-4">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
        
        <h1 className="text-xl font-semibold mb-2">Crystal</h1>
        <p className="text-muted-foreground text-sm">
          Sua consultora de relacionamentos
        </p>
      </div>

      {/* General Chat */}
      <div className="px-6 mb-6">
        <Button
          onClick={onGeneralChat}
          variant="outline"
          className="w-full justify-start p-4 h-auto"
        >
          <MessageCircle className="h-4 w-4 mr-3" />
          <div className="text-left">
            <div className="font-medium text-sm">Conversa Geral</div>
            <div className="text-xs text-muted-foreground">Dicas e conselhos</div>
          </div>
        </Button>
      </div>

      {/* Crushes Section */}
      <div className="flex-1 px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Suas Crushes</h3>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : crushes.length === 0 ? (
          <div className="text-center p-6 border-2 border-dashed border-border rounded">
            <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              Nenhuma crush cadastrada
            </p>
            <Button
              onClick={() => setShowAddDialog(true)}
              variant="outline"
              size="sm"
            >
              Adicionar Primeira
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {crushes.slice(0, 5).map((crush) => (
              <Card 
                key={crush.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onStartChat(crush.id, crush.name)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={crush.photo_url || ""} />
                      <AvatarFallback className="text-xs">
                        {crush.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{crush.name}</h4>
                      <p className="text-xs text-muted-foreground">{crush.current_stage}</p>
                    </div>
                    
                    <Badge variant="outline" className="text-xs">
                      {crush.interest_level || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* WhatsApp Button */}
      <div className="px-6 pb-4">
        <Button
          onClick={() => window.open('https://wa.me/5548996870906', '_blank')}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Falar no WhatsApp
        </Button>
      </div>

      <AddCrushDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
        onCrushAdded={() => setShowAddDialog(false)}
      />
    </div>
  );
};