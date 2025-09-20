import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSubscription } from '@/hooks/useSubscription';
import { useWebhooks } from '@/hooks/useWebhooks';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Heart, 
  TrendingUp, 
  Shield,
  ExternalLink,
  Zap,
  Star
} from 'lucide-react';

const Subscription = () => {
  const { user } = useAuth();
  const { subscriptionInfo, hasActiveSubscription, refreshSubscription } = useSubscription();
  const { sendCustomWebhook, loading } = useWebhooks();
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [paymentData, setPaymentData] = useState({
    plan: 'premium',
    transactionId: '',
    amount: 'R$ 29,90'
  });

  // Plans configuration
  const plans = [
    {
      id: 'free',
      name: 'Gratuito',
      price: 'R$ 0',
      period: 'sempre',
      description: 'Recursos básicos para começar',
      features: [
        'Chat básico com Crystal',
        'Até 3 paqueras no pipeline',
        'Insights semanais',
        'Suporte por email'
      ],
      limitations: [
        'Funcionalidades limitadas',
        'Sem análises avançadas'
      ],
      popular: false,
      color: 'muted'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 'R$ 29,90',
      period: 'mês',
      description: 'Ideal para conquistadores sérios',
      features: [
        'Chat ilimitado com Crystal',
        'Paqueras ilimitadas no pipeline',
        'Análises avançadas e insights diários',
        'Personalização completa da Crystal',
        'Histórico completo de conversas',
        'Suporte prioritário 24/7'
      ],
      limitations: [],
      popular: true,
      color: 'primary'
    },
    {
      id: 'vip',
      name: 'VIP',
      price: 'R$ 49,90',
      period: 'mês',
      description: 'Para experts em relacionamentos',
      features: [
        'Todos os recursos Premium',
        'IA avançada com GPT-4',
        'Coaching personalizado 1:1',
        'Relatórios detalhados semanais',
        'Acesso antecipado a novidades',
        'Consultoria exclusiva por WhatsApp'
      ],
      limitations: [],
      popular: false,
      color: 'accent'
    }
  ];

  const handleSimulatePayment = async (planId: string) => {
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para fazer uma assinatura',
        variant: 'destructive'
      });
      return;
    }

    if (!webhookUrl) {
      toast({
        title: 'Configure o Webhook N8N',
        description: 'Adicione sua URL do N8N para simular o pagamento',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Simulate payment completion via N8N webhook
      await sendCustomWebhook(
        webhookUrl,
        'payment_completed',
        {
          user_id: user.id,
          user_email: user.email,
          plan_type: planId,
          payment_status: 'completed',
          transaction_id: `sim_${Date.now()}`,
          amount: plans.find(p => p.id === planId)?.price || '0',
          payment_method: 'simulation',
          processed_at: new Date().toISOString()
        }
      );

      // Wait a moment for the webhook to process
      setTimeout(() => {
        refreshSubscription();
        toast({
          title: 'Pagamento Simulado!',
          description: `Assinatura ${planId} ativada com sucesso via N8N`,
        });
      }, 1500);

    } catch (error) {
      toast({
        title: 'Erro na Simulação',
        description: 'Não foi possível simular o pagamento. Verifique sua URL N8N.',
        variant: 'destructive'
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !webhookUrl) return;

    try {
      await sendCustomWebhook(
        webhookUrl,
        'subscription_cancelled',
        {
          user_id: user.id,
          user_email: user.email,
          cancelled_at: new Date().toISOString(),
          reason: 'user_requested'
        }
      );

      setTimeout(() => {
        refreshSubscription();
        toast({
          title: 'Assinatura Cancelada',
          description: 'Sua assinatura foi cancelada com sucesso',
        });
      }, 1500);

    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar a assinatura',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
          Planos Crystal.AI
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Desbloqueie todo o potencial da Crystal e transforme sua vida amorosa com inteligência artificial
        </p>

        {/* Current Status */}
        {hasActiveSubscription && (
          <Card className="border-0 bg-gradient-to-r from-primary/10 to-secondary/10 shadow-card max-w-md mx-auto">
            <div className="p-4 text-center">
              <Badge className="mb-2 bg-gradient-to-r from-primary to-primary-glow">
                <Crown className="w-4 h-4 mr-1" />
                Assinatura Ativa
              </Badge>
              <p className="text-sm text-card-foreground">
                Plano {subscriptionInfo.plan} • 
                {subscriptionInfo.daysLeft ? ` ${subscriptionInfo.daysLeft} dias restantes` : ' Vitalício'}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* N8N Configuration for Demo/Testing */}
      <Card className="border-0 bg-gradient-card shadow-card">
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Configuração N8N (Para Demonstração)
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="webhook-url">URL do Webhook N8N para Pagamentos</Label>
              <Input
                id="webhook-url"
                placeholder="https://sua-instancia.n8n.cloud/webhook/pagamentos"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Configure um webhook no N8N que aceite eventos de pagamento e atualize as assinaturas
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative border-0 shadow-card transition-all duration-300 hover:shadow-hover ${
              plan.popular ? 'ring-2 ring-primary/20' : ''
            } ${hasActiveSubscription && subscriptionInfo.plan.toLowerCase().includes(plan.id) ? 'bg-gradient-to-br from-primary/5 to-secondary/5' : 'bg-gradient-card'}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-primary-glow">
                  <Star className="w-3 h-3 mr-1" />
                  Mais Popular
                </Badge>
              </div>
            )}

            <div className="p-6 space-y-6">
              {/* Plan Header */}
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-card-foreground">{plan.name}</h3>
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-primary">{plan.price}</span>
                    {plan.period !== 'sempre' && (
                      <span className="text-muted-foreground">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-semibold text-card-foreground text-sm">Incluso:</h4>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="pt-2">
                    <h4 className="font-semibold text-muted-foreground text-xs">Limitações:</h4>
                    <ul className="space-y-1 mt-1">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="text-xs text-muted-foreground/60">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                {plan.id === 'free' ? (
                  <Button 
                    disabled
                    variant="outline" 
                    className="w-full"
                  >
                    {!hasActiveSubscription ? 'Plano Atual' : 'Plano Gratuito'}
                  </Button>
                ) : (
                  <>
                    {hasActiveSubscription && subscriptionInfo.plan.toLowerCase().includes(plan.id) ? (
                      <div className="space-y-2">
                        <Button 
                          disabled
                          className="w-full bg-gradient-to-r from-primary to-primary-glow"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Plano Ativo
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={handleCancelSubscription}
                          disabled={loading || !webhookUrl}
                        >
                          Cancelar Assinatura
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className={`w-full ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-primary to-primary-glow hover:scale-105' 
                            : 'bg-gradient-to-r from-secondary to-accent hover:scale-105'
                        } transition-all duration-200`}
                        onClick={() => handleSimulatePayment(plan.id)}
                        disabled={loading || !webhookUrl}
                      >
                        {loading ? (
                          <>
                            <Zap className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            {plan.popular ? <Sparkles className="w-4 h-4 mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
                            Assinar {plan.name}
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* FAQ / Additional Info */}
      <Card className="border-0 bg-gradient-card shadow-card">
        <div className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-card-foreground">
            Como Funciona o Sistema de Pagamentos
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-card-foreground">Integração N8N</h4>
                  <p>Configure webhooks no N8N para processar pagamentos automaticamente via sua plataforma preferida.</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-card-foreground">Flexibilidade Total</h4>
                  <p>Conecte com qualquer gateway de pagamento através do poderoso sistema de automação N8N.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Subscription;