import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  started_at?: string;
  expires_at?: string;
  external_id?: string;
  payment_data?: any;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSubscription = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching subscription:', fetchError);
        setError('Erro ao carregar assinatura');
        return;
      }

      setSubscription(data);
    } catch (err) {
      console.error('Subscription fetch error:', err);
      setError('Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Check if user has active subscription
  const hasActiveSubscription = (): boolean => {
    if (!subscription) return false;
    
    const isActive = subscription.status === 'active';
    const notExpired = !subscription.expires_at || 
      new Date(subscription.expires_at) > new Date();
    
    return isActive && notExpired;
  };

  // Check if user has premium features
  const hasPremiumAccess = (): boolean => {
    return hasActiveSubscription() && 
           ['premium', 'vip'].includes(subscription?.plan_type || '');
  };

  // Get subscription status info
  const getSubscriptionInfo = () => {
    if (!subscription) {
      return {
        status: 'free',
        plan: 'Gratuito',
        canUpgrade: true,
        daysLeft: null
      };
    }

    const daysLeft = subscription.expires_at 
      ? Math.ceil((new Date(subscription.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      status: subscription.status,
      plan: subscription.plan_type === 'premium' ? 'Premium' : 
            subscription.plan_type === 'vip' ? 'VIP' : 'Gratuito',
      canUpgrade: !hasActiveSubscription(),
      daysLeft: daysLeft && daysLeft > 0 ? daysLeft : null,
      expiresAt: subscription.expires_at
    };
  };

  // Refresh subscription data
  const refreshSubscription = () => {
    fetchSubscription();
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Set up real-time subscription to changes
  useEffect(() => {
    if (!user) return;

    const subscription_channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh data when subscription changes
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      subscription_channel.unsubscribe();
    };
  }, [user]);

  return {
    subscription,
    loading,
    error,
    hasActiveSubscription: hasActiveSubscription(),
    hasPremiumAccess: hasPremiumAccess(),
    subscriptionInfo: getSubscriptionInfo(),
    refreshSubscription
  };
};