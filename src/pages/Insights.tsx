import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { useInsights } from "@/hooks/useInsights";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Heart, 
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

  const getInsightLabel = (type: string) => {
    switch (type) {
      case 'improvement_tip':
        return 'Dica';
      case 'relationship_analysis':
        return 'Análise';
      case 'next_steps':
        return 'Próximo Passo';
      default:
        return 'Insight';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Insights</h1>
        <p className="text-muted-foreground">
          Análises personalizadas das suas conversas
        </p>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={handleGenerateInsights}
          disabled={generatingInsights || loading}
          size="lg"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Sparkles className={`h-4 w-4 mr-2 ${generatingInsights ? 'animate-pulse' : ''}`} />
          {generatingInsights ? 'Gerando...' : 'Gerar Insights'}
        </Button>
      </div>

      {/* Insights List */}
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
                Converse com Crystal primeiro, depois gere seus insights
              </p>
            </motion.div>
          ) : (
            insights.slice(0, 6).map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getInsightIcon(insight.insight_type)}
                        <div>
                          <CardTitle className="text-lg">{insight.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {getInsightLabel(insight.insight_type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(insight.created_at), "dd/MM", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
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
    </div>
  );
};

export default Insights;