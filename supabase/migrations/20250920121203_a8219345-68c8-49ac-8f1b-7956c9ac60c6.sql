-- Criar usuário de teste na tabela profiles (simulando cadastro)
INSERT INTO public.profiles (id, email, name, phone)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'teste@crystal.ai',
  'Usuário Teste',
  '+55 47 99999-0000'
) 
ON CONFLICT (id) DO NOTHING;

-- Inserir configurações de teste para o usuário
INSERT INTO public.user_settings (
  user_id,
  personality_safada,
  personality_fofa,
  personality_conscious,
  personality_calma,
  behavior_palavrao,
  behavior_humor,
  behavior_direta,
  behavior_romantica,
  custom_prompt
)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  75,
  60,
  70,
  50,
  false,
  true,
  true,
  true,
  'Seja uma consultora especialista em relacionamentos, carinhosa mas direta.'
)
ON CONFLICT (user_id) DO NOTHING;

-- Inserir algumas paqueras de exemplo
INSERT INTO public.crushes (id, name, age, current_stage, interest_level, user_id, last_interaction)
VALUES 
  (
    gen_random_uuid(),
    'Amanda Silva',
    24,
    'Conversando',
    85,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW() - INTERVAL '2 hours'
  ),
  (
    gen_random_uuid(),
    'Julia Santos',
    22,
    'Encontro Marcado',
    92,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW() - INTERVAL '1 day'
  ),
  (
    gen_random_uuid(),
    'Carla Mendes',
    26,
    'Primeiro Contato',
    65,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW() - INTERVAL '3 days'
  ),
  (
    gen_random_uuid(),
    'Fernanda Costa',
    23,
    'Relacionando',
    95,
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    NOW() - INTERVAL '1 hour'
  )
ON CONFLICT DO NOTHING;