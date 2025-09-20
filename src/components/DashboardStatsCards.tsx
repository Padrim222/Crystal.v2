import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Users,
  ArrowRight,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardsProps {
  stats: {
    activeCrushes: number;
    pendingMessages: number;
    totalConversations: number;
    successRate: number;
  };
  insights: {
    type: string;
    message: string;
    action: string;
  };
}

export function DashboardStatsCards({ stats, insights }: StatsCardsProps) {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Paqueras Ativas",
      value: stats.activeCrushes,
      icon: Heart,
      color: "text-coral",
      bgColor: "bg-coral/10",
      onClick: () => navigate('/crushes')
    },
    {
      title: "Mensagens Pendentes",
      value: stats.pendingMessages,
      icon: MessageCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      onClick: () => navigate('/conversations')
    },
    {
      title: "Conversas Totais",
      value: stats.totalConversations,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      onClick: () => navigate('/conversations')
    },
    {
      title: "Taxa de Sucesso",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      progress: stats.successRate,
      onClick: () => navigate('/insights')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
              onClick={card.onClick}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground mb-1">
                  {card.value}
                </div>
                {card.progress !== undefined && (
                  <Progress value={card.progress} className="h-2" />
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Ver detalhes
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Insights Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-coral/5 to-crimson/5 border-coral/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-coral" />
              Insight do Dia
              <Badge variant="secondary" className="ml-auto">
                {insights.type}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{insights.message}</p>
            <Button 
              variant="premium" 
              className="gap-2"
              onClick={() => {
                if (insights.action.includes('Crystal')) {
                  navigate('/chat');
                } else if (insights.action.includes('Pipeline')) {
                  navigate('/crushes');
                } else if (insights.action.includes('Insights')) {
                  navigate('/insights');
                } else {
                  navigate('/crushes');
                }
              }}
            >
              <ArrowRight className="h-4 w-4" />
              {insights.action}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}