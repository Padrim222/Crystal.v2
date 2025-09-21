import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useInsights } from "@/hooks/useInsights";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  TrendingUp, 
  Heart, 
  MessageCircle, 
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Insights = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    insights, 
    loading, 
    generateInsights, 
    refreshInsights 
  } = useInsights();
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const handleGenerateInsights = async () => {
    if (!user) return;
    
    setGeneratingInsights(true);
    try {
      await generateInsights();
      toast({
        title: "Insights Gerados!",
        description: "Crystal analisou suas conversas e criou novos insights.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar insights no momento.",
        variant: "destructive"
      });
    } finally {
      setGeneratingInsights(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement_tip':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'relationship_analysis':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'next_steps':
        return <Target className="h-5 w-5 text-blue-500" />;
      default:
        return <Brain className="h-5 w-5 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement_tip':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'relationship_analysis':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'next_steps':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    }
  };

  const getInsightLabel = (type: string) => {
    switch (type) {
      case 'improvement_tip':
        return 'Dica de Melhoria';
      case 'relationship_analysis':
        return 'Análise de Relacionamento';
      case 'next_steps':
        return 'Próximos Passos';
      default:
        return 'Insight';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Insights Crystal
          </h1>
          <p className="text-muted-foreground">
            Análises personalizadas das suas conversas e relacionamentos
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={refreshInsights}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            onClick={handleGenerateInsights}
            disabled={generatingInsights || loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className={`h-4 w-4 mr-2 ${generatingInsights ? 'animate-pulse' : ''}`} />
            {generatingInsights ? 'Gerando...' : 'Gerar Insights'}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Insights</p>
                <p className="text-2xl font-bold text-foreground">{insights.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dicas de Melhoria</p>
                <p className="text-2xl font-bold text-foreground">
                  {insights.filter(i => i.insight_type === 'improvement_tip').length}
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Análises</p>
                <p className="text-2xl font-bold text-foreground">
                  {insights.filter(i => i.insight_type === 'relationship_analysis').length}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Próximos Passos</p>
                <p className="text-2xl font-bold text-foreground">
                  {insights.filter(i => i.insight_type === 'next_steps').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Insights List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            <AnimatePresence>
              {insights.length === 0 && !loading ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum insight ainda</h3>
                  <p className="text-muted-foreground mb-6">
                    Clique em "Gerar Insights" para que Crystal analise suas conversas
                  </p>
                  <Button
                    onClick={handleGenerateInsights}
                    disabled={generatingInsights}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Meus Primeiros Insights
                  </Button>
                </motion.div>
              ) : (
                insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getInsightIcon(insight.insight_type)}
                            <div>
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={getInsightColor(insight.insight_type)}
                                >
                                  {getInsightLabel(insight.insight_type)}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(insight.created_at), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              Score: {insight.score}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {insight.content}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
};

export default Insights;