-- Criar usuário específico para o cliente
INSERT INTO public.profiles (id, email, name, phone)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'usuario@crystalai.dev',
  'Cliente Crystal',
  '+55 11 99999-1234'
) 
ON CONFLICT (id) DO NOTHING;

-- Configurações personalizadas
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
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  80,  -- Mais ousada
  70,  -- Bem carinhosa  
  85,  -- Muito consciente
  60,  -- Equilibrada
  true,  -- Permite palavrões
  true,  -- Usa humor
  true,  -- Comunicação direta
  true,  -- Romântica
  'Sou a Crystal, sua consultora pessoal especialista em relacionamentos. Vou te ajudar a conquistar com estratégias inteligentes e conselhos práticos!'
)
ON CONFLICT (user_id) DO NOTHING;

-- Algumas paqueras exemplo para o pipeline
INSERT INTO public.crushes (id, name, age, current_stage, interest_level, user_id, last_interaction)
VALUES 
  (
    gen_random_uuid(),
    'Sophia Martinez',
    25,
    'Conversando',
    88,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    NOW() - INTERVAL '3 hours'
  ),
  (
    gen_random_uuid(), 
    'Isabella Rodriguez',
    23,
    'Encontro Marcado',
    94,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    NOW() - INTERVAL '6 hours'
  ),
  (
    gen_random_uuid(),
    'Valentina Santos',
    27,
    'Primeiro Contato', 
    72,
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    NOW() - INTERVAL '2 days'
  )
ON CONFLICT DO NOTHING;