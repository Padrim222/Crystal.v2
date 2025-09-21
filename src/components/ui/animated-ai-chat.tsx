import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  Heart,
  Star
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'crystal';
  timestamp: Date;
}

interface AnimatedAIChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isGeneratingResponse: boolean;
  className?: string;
}

export const AnimatedAIChat: React.FC<AnimatedAIChatProps> = ({
  messages,
  onSendMessage,
  isGeneratingResponse,
  className = ""
}) => {
  const [input, setInput] = useState("");
  const [showSparkles, setShowSparkles] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Show sparkles effect when Crystal responds
  useEffect(() => {
    if (isGeneratingResponse) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isGeneratingResponse]);

  const handleSendMessage = () => {
    if (!input.trim() || isGeneratingResponse) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 border-b border-border/40 backdrop-blur-sm bg-background/80"
      >
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src="" alt="Crystal" />
            <AvatarFallback className="bg-gradient-to-r from-coral to-crimson text-white">
              <Sparkles className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          {showSparkles && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-2 -right-2"
            >
              <Star className="h-4 w-4 text-yellow-400" />
            </motion.div>
          )}
        </div>
        
        <div className="flex-1">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-semibold bg-gradient-to-r from-coral to-crimson bg-clip-text text-transparent"
          >
            Crystal.ai
          </motion.h3>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground"
          >
            Sua consultora de relacionamentos
          </motion.p>
        </div>
        
        <motion.div
          animate={isGeneratingResponse ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 1, repeat: isGeneratingResponse ? Infinity : 0 }}
        >
          <Heart className="h-5 w-5 text-coral" />
        </motion.div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20"
        >
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`max-w-[75%] rounded-2xl p-4 relative ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-gradient-to-br from-muted to-muted/60 text-foreground border border-border/40 shadow-lg'
                  }`}
                >
                  {message.sender === 'crystal' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="absolute -top-2 -left-2 bg-gradient-to-r from-coral to-crimson rounded-full p-1"
                    >
                      <Sparkles className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-sm leading-relaxed"
                  >
                    {message.content}
                  </motion.p>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`text-xs mt-2 ${
                      message.sender === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-muted-foreground/70'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isGeneratingResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <Card className="bg-gradient-to-r from-muted/80 to-muted/40 border-coral/20 shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="h-4 w-4 text-coral" />
                      </motion.div>
                      
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            animate={{ y: [-2, 2, -2] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-2 h-2 bg-coral rounded-full"
                          />
                        ))}
                      </div>
                      
                      <span className="text-xs text-muted-foreground font-medium">
                        Crystal está pensando...
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 border-t border-border/40 bg-background/80 backdrop-blur-sm"
      >
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem para Crystal..."
            className="flex-1 border-primary/20 focus:border-primary/40 bg-background/50"
            disabled={isGeneratingResponse}
          />
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isGeneratingResponse}
              size="icon"
              className="bg-gradient-to-r from-coral to-crimson hover:from-coral/80 hover:to-crimson/80 shadow-lg"
            >
              {isGeneratingResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};