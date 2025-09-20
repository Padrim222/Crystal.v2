import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  MessageCircle, 
  Heart, 
  Target,
  Calendar,
  BarChart3,
  Users,
  Zap,
  Clock,
  Star
} from "lucide-react";
import { useInsights } from "@/hooks/useInsights";
import { useAuth } from "@/hooks/useAuth";
import { format, subDays, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

const Insights = () => {
  const { user } = useAuth();
  const { data: insightsData, loading } = useInsights();

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalCrushes = insightsData?.crushes?.length || 0;
  const totalConversations = insightsData?.conversations?.length || 0;
  const totalMessages = insightsData?.conversations?.reduce((acc: number, conv) => {
    const messageCount = Array.isArray(conv.messages) ? conv.messages.length : 0;
    return acc + messageCount;
  }, 0) || 0;
  
  // Calculate recent activity (last 7 days)
  const recentDate = subDays(new Date(), 7);
  const recentConversations = insightsData?.conversations?.filter(conv => 
    conv.started_at && isAfter(new Date(conv.started_at), recentDate)
  ).length || 0;

  // Calculate success metrics
  const activeCrushes = insightsData?.crushes?.filter(crush => 
    crush.current_stage !== 'Não Interessada' && (crush.interest_level || 0) > 50
  ).length || 0;
  
  const successRate = totalCrushes > 0 ? (activeCrushes / totalCrushes) * 100 : 0;

  // Stage distribution
  const stageDistribution = insightsData?.crushes?.reduce((acc, crush) => {
    const stage = crush.current_stage || 'Primeiro Contato';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const insights = [
    {
      title: "Conquistas Ativas",
      value: activeCrushes,
      total: totalCrushes,
      icon: Heart,
      color: "text-coral",
      bgColor: "bg-coral/10"
    },
    {
      title: "Conversas Iniciadas",
      value: totalConversations,
      change: `+${recentConversations} esta semana`,
      icon: MessageCircle,
      color: "text-crimson",
      bgColor: "bg-crimson/10"
    },
    {
      title: "Mensagens Trocadas",
      value: totalMessages,
      icon: Zap,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Taxa de Sucesso",
      value: `${Math.round(successRate)}%`,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-coral" />
        <h1 className="text-3xl font-bold text-foreground">Insights</h1>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {insight.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                  <insight.icon className={`h-4 w-4 ${insight.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {insight.value}
                </div>
                {insight.change && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.change}
                  </p>
                )}
                {insight.total && (
                  <div className="mt-2">
                    <Progress 
                      value={(insight.value as number) / insight.total * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="crushes">Conquistas</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-coral" />
                  Distribuição por Estágio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stageDistribution).map(([stage, count]) => (
                  <div key={stage} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{stage}</span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <Progress 
                      value={totalCrushes > 0 ? (count / totalCrushes) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-crimson" />
                  Nível de Interesse Médio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insightsData?.crushes?.slice(0, 5).map((crush) => (
                    <div key={crush.id} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{crush.name}</span>
                        <Badge variant={(crush.interest_level || 0) > 70 ? "default" : (crush.interest_level || 0) > 40 ? "secondary" : "outline"}>
                          {crush.interest_level || 0}%
                        </Badge>
                      </div>
                      <Progress value={crush.interest_level || 0} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="crushes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-coral" />
                Suas Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsData?.crushes?.map((crush) => (
                  <div key={crush.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{crush.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {crush.current_stage} • {crush.age ? `${crush.age} anos` : 'Idade não informada'}
                      </p>
                      {crush.last_interaction && (
                        <p className="text-xs text-muted-foreground">
                          Última interação: {format(new Date(crush.last_interaction), "dd 'de' MMM, yyyy", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={(crush.interest_level || 0) > 70 ? "default" : (crush.interest_level || 0) > 40 ? "secondary" : "outline"}>
                        {crush.interest_level || 0}% interesse
                      </Badge>
                    </div>
                  </div>
                ))}
                {(!insightsData?.crushes || insightsData.crushes.length === 0) && (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma conquista cadastrada ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-crimson" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insightsData?.conversations?.slice(0, 10).map((conversation) => (
                  <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">
                        {conversation.type === 'crystal_chat' ? 'Chat com Crystal' : 'Conversa com Crush'}
                      </h4>
                      {conversation.started_at && (
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(conversation.started_at), "dd 'de' MMM, yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">
                      {Array.isArray(conversation.messages) ? conversation.messages.length : 0} mensagens
                    </Badge>
                  </div>
                ))}
                {(!insightsData?.conversations || insightsData.conversations.length === 0) && (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhuma conversa iniciada ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Insights;