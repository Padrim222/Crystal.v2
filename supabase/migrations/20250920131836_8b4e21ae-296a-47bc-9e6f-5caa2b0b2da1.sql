-- Criar tabela para assinaturas/pagamentos
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'premium', 'vip'
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled', 'expired'
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  external_id TEXT, -- ID do sistema de pagamento externo
  payment_data JSONB, -- Dados do pagamento/webhook
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Trigger para updated_at
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para verificar se usuário tem assinatura ativa
CREATE OR REPLACE FUNCTION public.user_has_active_subscription(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.subscriptions 
    WHERE user_id = check_user_id 
    AND status = 'active' 
    AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

-- Inserir assinatura ativa para o usuário teste
INSERT INTO public.subscriptions (user_id, plan_type, status, started_at, expires_at)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'premium',
  'active', 
  NOW(),
  NOW() + INTERVAL '1 year'
)
ON CONFLICT DO NOTHING;