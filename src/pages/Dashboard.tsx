import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Plus, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { profile, stats, recentActivity, insights, loading } = useDashboard();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Olá, {profile?.name || 'Usuário'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Você tem {stats.activeCrushes} paqueras ativas. Que tal verificar os novos insights?
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paqueras Ativas</CardTitle>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activeCrushes}</div>
            <p className="text-xs text-muted-foreground">
              Total no pipeline
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto mt-2 text-sm"
              onClick={() => navigate('/crushes')}
            >
              Ver Todas <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Insight</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-foreground mb-2">
              {insights.message}
            </div>
            <Badge variant="secondary" className="mb-2">
              <Sparkles className="mr-1 h-3 w-3" />
              {insights.type === 'achievement' ? 'Conquista' : 'Dica'}
            </Badge>
            <Button variant="link" className="p-0 h-auto text-sm">
              {insights.action} <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Pendentes</CardTitle>
            <MessageCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.pendingMessages}</div>
            <p className="text-xs text-muted-foreground">
              Conversas ativas
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto mt-2 text-sm"
              onClick={() => navigate('/chat')}
            >
              Responder <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button 
            variant="crystal" 
            size="lg" 
            className="h-16 text-left justify-start"
            onClick={() => navigate('/chat')}
          >
            <MessageCircle className="mr-3 h-5 w-5" />
            <div>
              <div className="font-semibold">Conversar com Crystal</div>
              <div className="text-xs opacity-90">Peça conselhos personalizados</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="h-16 text-left justify-start hover:bg-primary-muted"
            onClick={() => navigate('/crushes')}
          >
            <Plus className="mr-3 h-5 w-5" />
            <div>
              <div className="font-semibold">Adicionar Nova Paquera</div>
              <div className="text-xs text-muted-foreground">Comece uma nova conquista</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="h-16 text-left justify-start hover:bg-accent-muted"
            onClick={() => navigate('/crushes')}
          >
            <TrendingUp className="mr-3 h-5 w-5" />
            <div>
              <div className="font-semibold">Ver Pipeline Completo</div>
              <div className="text-xs text-muted-foreground">Gerencie todas as paqueras</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>
            Suas últimas interações com a Crystal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.type === 'crush_added' ? 'bg-primary' :
                  activity.type === 'conversation_started' ? 'bg-secondary' :
                  activity.type === 'stage_changed' ? 'bg-accent' : 'bg-muted'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.description} • {new Date(activity.timestamp).toLocaleString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p className="text-sm">Nenhuma atividade recente</p>
              <p className="text-xs mt-1">Suas ações aparecerão aqui</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;