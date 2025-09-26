"use client";
import React, { useState, useEffect } from "react";
import { GradientButton } from "@/components/ui/gradient-button";
import { SmokeyBackground } from "@/components/ui/smokey-background";
import { MaintenanceAlert } from "@/components/ui/maintenance-alert";
import { User, Lock, ArrowRight, Mail, UserPlus } from 'lucide-react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/chat", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleDevMode = () => {
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp && formData.password.length < 8) {
      toast({
        title: "Senha muito fraca",
        description: "A senha deve ter pelo menos 8 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (isSignUp) {
      const result = await signUp(formData.email, formData.password, formData.name);
      if (!result.error) {
        // Se tem sessão, redireciona. Se não, fica no login aguardando confirmação
        if (result.data?.session) {
          navigate("/chat", { replace: true });
        } else {
          setIsSignUp(false);
          setFormData({ email: "", password: "", name: "" });
        }
      }
    } else {
      const result = await signIn(formData.email, formData.password);
      if (!result.error) {
        navigate("/chat", { replace: true });
      }
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`
        }
      });
      
      if (error) {
        toast({
          title: "Erro no login",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast({
        title: "Erro no login",
        description: "Erro ao conectar com Google",
        variant: "destructive",
      });
    }
  };

  // Removed hardcoded test credentials for security

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4 sm:p-6"
    >
      <SmokeyBackground 
        color="#F27983" 
        backdropBlurAmount="md"
        className="opacity-80"
      />

      <div className="relative z-20 w-full max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              <span 
                onClick={handleDevMode}
                className="cursor-default select-none hover:text-primary transition-colors duration-300"
              >
                B
              </span>
              em vindo à Crystal.ai
            </h1>
            <p className="text-gray-300 text-sm sm:text-base">
              {isSignUp ? 'Crie sua conta para continuar' : 'Faça login para continuar'}
            </p>
          </div>

          

          <form className="space-y-6 sm:space-y-8" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="relative z-0">
                <input
                  type="text"
                  id="floating_name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                  placeholder=" " 
                />
                <label
                  htmlFor="floating_name"
                  className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  <User className="inline-block mr-2 -mt-1" size={16} />
                  Nome (opcional)
                </label>
              </div>
            )}

            <div className="relative z-0">
              <input
                type="email"
                id="floating_email"
                value={formData.email}
                onChange={handleInputChange('email')}
                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                placeholder=" " 
                required
              />
              <label
                htmlFor="floating_email"
                className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                <Mail className="inline-block mr-2 -mt-1" size={16} />
                Email
              </label>
            </div>

            <div className="relative z-0">
              <input
                type="password"
                id="floating_password"
                value={formData.password}
                onChange={handleInputChange('password')}
                className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer"
                placeholder=" "
                required
              />
              <label
                htmlFor="floating_password"
                className="absolute text-sm text-gray-300 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
              >
                <Lock className="inline-block mr-2 -mt-1" size={16} />
                Senha {isSignUp && '(mín. 8 caracteres)'}
              </label>
            </div>

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <a href="#" className="text-xs text-gray-300 hover:text-white transition">
                  Esqueci minha senha
                </a>
              </div>
            )}
            
            <GradientButton
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center"
            >
              {loading ? (
                "Carregando..."
              ) : (
                <>
                  {isSignUp ? (
                    <>
                      Criar Conta
                      <UserPlus className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </>
              )}
            </GradientButton>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-400/30"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">OU CONTINUE COM</span>
                <div className="flex-grow border-t border-gray-400/30"></div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 bg-white/90 hover:bg-white rounded-lg text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary transition-all duration-300 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z"></path><path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z"></path>
              </svg>
              Entrar com Google
            </button>

            <GradientButton 
              variant="variant" 
              className="w-full text-sm sm:text-base py-2.5 sm:py-3" 
              type="button"
              onClick={() => window.open("https://wa.me/554896870906", "_blank")}
            >
              💬 Fale com a Crystal no WhatsApp
            </GradientButton>
          </form>

          <p className="text-center text-xs sm:text-sm text-gray-400 mt-4 sm:mt-6">
            {isSignUp ? (
              <>
                Já tem uma conta?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="font-semibold text-primary hover:text-primary/80 transition underline"
                >
                  Fazer Login
                </button>
              </>
            ) : (
              <>
                Não tem uma conta?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="font-semibold text-primary hover:text-primary/80 transition underline"
                >
                  Criar Conta
                </button>
              </>
            )}
          </p>
          
          <div className="text-center text-xs text-gray-400 mt-4">
            Faça Login no app completo ou fale com a crystal no whatsapp
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 left-0 right-0">
          <div className="max-w-md mx-auto px-4">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-300">
                    Crystal.ai versão 1.0.2 - Nos ajude a melhorar a Crystal nas atualizações semanais
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="mailto:contato@leticiafelisberto.com"
                    className="text-xs text-gray-300 hover:text-primary transition-colors"
                  >
                    contato@leticiafelisberto.com
                  </a>
                  <button
                    onClick={() => window.open('mailto:contato@leticiafelisberto.com?subject=%23Feedback', '_blank')}
                    className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded transition-colors"
                  >
                    Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;