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

const Dashboard = () => {
  // Mock data - will be replaced with real data from backend
  const mockData = {
    userName: "João",
    activeCrushes: 3,
    pendingMessages: 2,
    lastInsight: "Sua taxa de resposta melhorou em 15% esta semana."
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Olá, {mockData.userName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Você tem {mockData.activeCrushes} paqueras ativas. Que tal verificar os novos insights?
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
            <div className="text-2xl font-bold text-primary">{mockData.activeCrushes}</div>
            <p className="text-xs text-muted-foreground">
              +1 nova esta semana
            </p>
            <Button variant="link" className="p-0 h-auto mt-2 text-sm">
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
              {mockData.lastInsight}
            </div>
            <Badge variant="secondary" className="mb-2">
              <Sparkles className="mr-1 h-3 w-3" />
              Novo
            </Badge>
            <Button variant="link" className="p-0 h-auto text-sm">
              Ler Mais <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Pendentes</CardTitle>
            <MessageCircle className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{mockData.pendingMessages}</div>
            <p className="text-xs text-muted-foreground">
              Crystal tem sugestões
            </p>
            <Button variant="link" className="p-0 h-auto mt-2 text-sm">
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
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Crystal sugeriu uma nova abordagem</p>
              <p className="text-xs text-muted-foreground">Para Maria, há 2 horas</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Paquera movida para "Encontro"</p>
              <p className="text-xs text-muted-foreground">Ana, ontem</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium">Nova conversa iniciada</p>
              <p className="text-xs text-muted-foreground">Com Crystal, há 3 dias</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;