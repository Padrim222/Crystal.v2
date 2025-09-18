import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Heart } from "lucide-react";
import heroImage from "@/assets/hero-login.jpg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Integrate with Supabase Auth
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen flex">
      {/* Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-90 z-10" />
        <img 
          src={heroImage} 
          alt="Crystal.ai - Your Dating AI Assistant" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center items-center text-white p-12">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-12 w-12 text-white" />
            <h1 className="text-4xl font-bold">Crystal.ai</h1>
          </div>
          <h2 className="text-2xl font-light mb-4 text-center">
            Sua assistente de relacionamentos com IA
          </h2>
          <p className="text-lg opacity-90 text-center max-w-md">
            Conquiste com confiança. A Crystal está aqui para te ajudar em cada etapa da sua jornada amorosa.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-subtle">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Crystal.ai</h1>
          </div>

          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                {isLogin ? "Bem-vindo de volta!" : "Crie sua conta"}
              </CardTitle>
              <CardDescription className="text-center">
                {isLogin 
                  ? "Entre para continuar sua jornada amorosa" 
                  : "Comece sua jornada com a Crystal.ai"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome completo"
                      className="h-12"
                      required
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha"
                      className="h-12 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua senha"
                      className="h-12"
                      required
                    />
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground hover:text-primary">
                      Esqueceu a senha?
                    </Button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="premium"
                  className="w-full h-12"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isLogin ? "Entrando..." : "Criando conta..."}
                    </div>
                  ) : (
                    isLogin ? "Entrar" : "Criar Conta"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                  <Button
                    variant="link"
                    className="p-0 ml-1 h-auto text-sm"
                    onClick={() => setIsLogin(!isLogin)}
                  >
                    {isLogin ? "Cadastre-se" : "Entre aqui"}
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;