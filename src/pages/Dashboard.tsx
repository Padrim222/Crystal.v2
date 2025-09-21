import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCrushes } from "@/hooks/useCrushes";
import { useConversations } from "@/hooks/useConversations";
import { Heart, MessageCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { stats: crushStats, loading: crushLoading } = useCrushes();
  const { stats: conversationStats, loading: conversationLoading } = useConversations();

  if (crushLoading || conversationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Seu progresso com a Crystal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <Heart className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Paqueras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-1">
                {crushStats?.total || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {crushStats?.byStage?.['Relacionamento'] || 0} relacionamentos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Conversas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-500 mb-1">
                {conversationStats?.total || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {conversationStats?.active || 0} ativas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <CardTitle className="text-lg">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500 mb-1">
                {crushStats?.successRate || 0}%
              </div>
              <p className="text-sm text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">Próximos Passos</h3>
            <div className="space-y-2">
              {crushStats?.total === 0 && (
                <p className="text-sm text-muted-foreground">
                  Adicione sua primeira paquera no Kanban
                </p>
              )}
              {conversationStats?.total === 0 && (
                <p className="text-sm text-muted-foreground">
                  Converse com Crystal para dicas personalizadas
                </p>
              )}
              {(crushStats?.total || 0) > 0 && (conversationStats?.total || 0) > 0 && (
                <p className="text-sm text-muted-foreground">
                  Gere insights para melhorar seus resultados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;