-- Criar trigger para atualizar profiles automaticamente quando usuário se cadastrar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger que executa quando um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Inserir configurações padrão de personalidade para novos usuários
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para configurações padrão
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_settings();