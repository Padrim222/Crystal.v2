-- Corrigir search_path das funções para segurança
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'phone'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o perfil já existe, apenas retorna NEW
    RETURN NEW;
END;
$$;

-- Corrigir search_path da segunda função
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_settings (
    user_id,
    personality_safada,
    personality_fofa,
    personality_conscious,
    personality_calma,
    behavior_palavrao,
    behavior_humor,
    behavior_direta,
    behavior_romantica
  )
  VALUES (
    NEW.id,
    50, -- valores padrão de personalidade
    50,
    50,
    50,
    false, -- comportamentos padrão
    true,
    false,
    true
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existem configurações, apenas retorna NEW
    RETURN NEW;
END;
$$;