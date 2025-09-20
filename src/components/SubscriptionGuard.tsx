import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Sparkles } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  requiredPlan?: 'premium' | 'vip';
  feature?: string;
  showUpgrade?: boolean;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  requiredPlan = 'premium',
  feature = 'este recurso',
  showUpgrade = true
}) => {
  const { hasActiveSubscription, hasPremiumAccess, subscriptionInfo } = useSubscription();
  const navigate = useNavigate();

  // Check if user has required access
  const hasRequiredAccess = () => {
    if (requiredPlan === 'premium') {
      return hasPremiumAccess;
    }
    if (requiredPlan === 'vip') {
      return hasActiveSubscription && subscriptionInfo.plan === 'VIP';
    }
    return false;
  };

  // If user has access, render children
  if (hasRequiredAccess()) {
    return <>{children}</>;
  }

  // If not showing upgrade prompt, return null
  if (!showUpgrade) {
    return null;
  }

  // Show upgrade prompt
  return (
    <Card className="border-0 bg-gradient-card shadow-card">
      <div className="p-8 text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-card-foreground">
            {feature.charAt(0).toUpperCase() + feature.slice(1)} Premium
          </h3>
          <p className="text-muted-foreground">
            Desbloqueie {feature} com uma assinatura {requiredPlan === 'vip' ? 'VIP' : 'Premium'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Badge variant="outline" className="px-3 py-1">
            <Crown className="w-4 h-4 mr-1" />
            Plano {requiredPlan === 'vip' ? 'VIP' : 'Premium'} Necessário
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">Com o plano {requiredPlan === 'vip' ? 'VIP' : 'Premium'}, você terá:</p>
            <ul className="space-y-1 text-left max-w-sm mx-auto">
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Recursos avançados da Crystal
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Analytics detalhados
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Suporte prioritário
              </li>
              {requiredPlan === 'vip' && (
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Funcionalidades exclusivas VIP
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/subscription')}
              className="bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-all duration-200"
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade Agora
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-primary/20 hover:bg-primary/10"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};