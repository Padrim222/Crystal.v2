import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Heart, TrendingUp, Calendar, Sparkles, Users, Crown, Shield } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { profile, stats, recentActivity } = useDashboard();
  const { subscriptionInfo, hasActiveSubscription, hasPremiumAccess } = useSubscription();
  const navigate = useNavigate();

  if (!profile || !stats) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Loading state with improved skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>
    );
  }

  const getDisplayName = () => profile?.name || profile?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Welcome Header with Subscription Status */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
              Olá, {getDisplayName()}! ✨
            </h1>
            <p className="text-muted-foreground text-lg">
              Bem-vinda(o) ao seu painel da Crystal. Vamos conquistar juntos!
            </p>
          </div>
          
          {/* Subscription Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant={hasActiveSubscription ? "default" : "secondary"}
              className={`px-3 py-1 text-sm font-medium ${
                hasActiveSubscription 
                  ? 'bg-gradient-to-r from-primary to-primary-glow' 
                  : 'bg-muted'
              }`}
            >
              {hasActiveSubscription ? (
                <>
                  <Crown className="w-4 h-4 mr-1" />
                  {subscriptionInfo.plan}
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-1" />
                  {subscriptionInfo.plan}
                </>
              )}
            </Badge>
            
            {subscriptionInfo.daysLeft && (
              <span className="text-xs text-muted-foreground">
                {subscriptionInfo.daysLeft} dias restantes
              </span>
            )}
          </div>
        </div>

        {/* Upgrade prompt for free users */}
        {!hasActiveSubscription && (
          <Card className="border-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 shadow-card">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Crown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground">Desbloqueie o poder completo da Crystal</h3>
                  <p className="text-sm text-muted-foreground">
                    Acesso a recursos premium, análises avançadas e suporte prioritário
                  </p>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-all duration-200"
                onClick={() => navigate('/subscription')}
              >
                Upgrade Agora
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Stats Cards - Redesigned with better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="relative overflow-hidden border-0 bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <span className="text-2xl font-bold text-primary">{stats.activeCrushes}</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Paqueras Ativas</h3>
            <p className="text-sm text-muted-foreground">Conexões em andamento</p>
            {hasPremiumAccess && (
              <Badge variant="outline" className="mt-2 text-xs">
                Análise Premium Disponível
              </Badge>
            )}
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/10 rounded-2xl">
                <MessageCircle className="h-6 w-6 text-secondary" />
              </div>
              <span className="text-2xl font-bold text-secondary">{stats.pendingMessages}</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Mensagens Pendentes</h3>
            <p className="text-sm text-muted-foreground">Aguardando resposta</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent/10 rounded-2xl">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <span className="text-2xl font-bold text-accent">{Math.round(stats.successRate)}%</span>
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">Taxa de Sucesso</h3>
            <p className="text-sm text-muted-foreground">Eficiência atual</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions - Simplified */}
      <Card className="border-0 bg-gradient-card shadow-card">
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-6 text-card-foreground">Ações Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/chat')}
              className="h-14 bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-all duration-200 shadow-primary"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Conversar com Crystal
            </Button>
            <Button 
              onClick={() => navigate('/crushes')}
              variant="outline" 
              className="h-14 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
            >
              <Users className="mr-2 h-5 w-5" />
              Gerenciar Paqueras
            </Button>
            <Button 
              onClick={() => navigate('/personalization')}
              variant="outline"
              className="h-14 border-secondary/20 hover:bg-secondary/10 hover:border-secondary/40 transition-all duration-200"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Personalizar Crystal
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Activity - Cleaner design */}
      {recentActivity && recentActivity.length > 0 && (
        <Card className="border-0 bg-gradient-card shadow-card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg text-card-foreground">Atividade Recente</h3>
              {hasPremiumAccess && (
                <Badge variant="outline" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Analytics Premium
                </Badge>
              )}
            </div>
            <div className="space-y-4">
              {recentActivity.slice(0, hasPremiumAccess ? 10 : 5).map((activity, index) => (
                <div key={index} className="flex items-center p-4 bg-muted/30 rounded-2xl hover:bg-muted/50 transition-colors">
                  <div className="p-2 bg-primary/10 rounded-xl mr-4">
                    {activity.type === 'conversation_started' ? (
                      <MessageCircle className="h-4 w-4 text-primary" />
                    ) : activity.type === 'crush_added' ? (
                      <Heart className="h-4 w-4 text-secondary" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">
                      {activity.type === 'conversation_started' && 'Nova conversa iniciada'}
                      {activity.type === 'crush_added' && 'Nova paquera adicionada'}
                      {activity.type === 'dashboard_viewed' && 'Dashboard visualizado'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;