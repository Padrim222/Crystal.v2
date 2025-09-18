import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles, ArrowRight, Users, MessageCircle, TrendingUp } from "lucide-react";

const Index = () => {
  const stats = [
    { icon: Users, label: "Matches Premium", value: "2.5M+" },
    { icon: MessageCircle, label: "Conversas Ativas", value: "850K+" },
    { icon: TrendingUp, label: "Taxa de Sucesso", value: "94%" },
  ];

  const features = [
    {
      icon: Heart,
      title: "AI Matching Avançado",
      description: "Algoritmo inteligente que encontra sua alma gêmea com 94% de precisão",
      color: "text-accent-pink",
    },
    {
      icon: Sparkles,
      title: "Perfil Premium",
      description: "Destaque-se com perfis otimizados por IA e fotos profissionais",
      color: "text-accent-amber",
    },
    {
      icon: MessageCircle,
      title: "Chat Inteligente",
      description: "Sugestões de conversa personalizadas para quebrar o gelo",
      color: "text-accent-blue",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-pink/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent-amber/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-20">
          <Badge variant="outline" className="mb-6 px-6 py-2 text-sm font-medium border-white/20 bg-white/5 text-white">
            ✨ Plataforma #1 de Dating Premium
          </Badge>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Encontre seu
            <span className="block text-gradient">Match Perfeito</span>
          </h1>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto mb-12 leading-relaxed">
            A Crystal.ai utiliza inteligência artificial avançada para conectar pessoas compatíveis. 
            Mais de 2.5 milhões de usuários já encontraram o amor.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button variant="premium" size="xl" className="group">
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button variant="glass" size="xl">
              Ver Como Funciona
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-8">
                <stat.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <Card key={index} className="group cursor-pointer">
              <CardHeader>
                <feature.icon className={`h-12 w-12 mb-4 ${feature.color} transition-transform group-hover:scale-110`} />
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="text-center max-w-4xl mx-auto bg-gradient-card border-primary/20">
          <CardHeader className="pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Heart className="h-16 w-16 text-accent-pink pulse-glow" />
                <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-accent-amber" />
              </div>
            </div>
            
            <CardTitle className="text-4xl mb-4">
              Pronto para Encontrar o Amor?
            </CardTitle>
            
            <CardDescription className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhões de pessoas que já encontraram relacionamentos duradouros 
              através da nossa plataforma premium.
            </CardDescription>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="premium" size="xl" className="group">
                Criar Perfil Gratuito
                <Heart className="ml-2 h-5 w-5 transition-transform group-hover:scale-110" />
              </Button>
              
              <Button variant="outline" size="xl">
                Fazer Login
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Index;
