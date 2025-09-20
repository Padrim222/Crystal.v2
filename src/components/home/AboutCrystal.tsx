"use client";
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { Heart, MessageCircle, Sparkles, Zap, Target, TrendingUp } from "lucide-react";
import crystal1 from "@/assets/crystal-1.png";
import crystal2 from "@/assets/crystal-2.png";

export default function AboutCrystal() {
  // Proper ES6 imports for the Imgur images
  const testimonials = [
    {
      quote: "Sou uma IA especializada em relacionamentos e conquista. Tenho anos de experiência analisando padrões de comportamento e comunicação que realmente funcionam.",
      name: "Crystal",
      designation: "Sua Consultora de Relacionamentos",
      src: crystal1
    },
    {
      quote: "Minha missão é te ajudar a conquistar quem você deseja de forma autêntica e respeitosa. Juntos, vamos construir conexões verdadeiras e duradouras.",
      name: "Crystal", 
      designation: "Especialista em Conquista",
      src: crystal2
    }
  ];

  const features = [
    {
      icon: MessageCircle,
      title: "Conversas Inteligentes",
      description: "Analiso suas conversas e sugiro as melhores respostas para manter o interesse"
    },
    {
      icon: Heart,
      title: "Perfil Otimizado", 
      description: "Ajudo você a criar um perfil irresistível que atrai exatamente quem você quer"
    },
    {
      icon: Target,
      title: "Estratégias Personalizadas",
      description: "Crio planos únicos baseados na personalidade de cada pessoa que você quer conquistar"
    },
    {
      icon: Sparkles,
      title: "Timing Perfeito",
      description: "Te aviso sobre os melhores momentos para mandar mensagem e dar os próximos passos"
    },
    {
      icon: TrendingUp,
      title: "Análise de Resultados",
      description: "Monitoro seu progresso e ajusto as estratégias para maximizar suas conquistas"
    },
    {
      icon: Zap,
      title: "Respostas Instantâneas",
      description: "Estou disponível 24/7 para te ajudar em tempo real quando precisar"
    }
  ];

  return (
    <div className="w-full bg-background py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Conheça a{" "}
            <span className="bg-gradient-to-r from-coral to-crimson bg-clip-text text-transparent">
              Crystal
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Sua parceira inteligente na arte da conquista. Descubra como a Crystal pode transformar sua vida amorosa.
          </p>
        </motion.div>

        {/* Crystal Testimonials/Presentation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mb-16 sm:mb-20 flex justify-center"
        >
          <CircularTestimonials 
            testimonials={testimonials}
            autoplay={true}
            colors={{
              name: "hsl(var(--foreground))",
              designation: "hsl(var(--coral))",
              testimony: "hsl(var(--muted-foreground))",
              arrowBackground: "hsl(var(--coral))",
              arrowForeground: "hsl(var(--coral-foreground))",
              arrowHoverBackground: "hsl(var(--crimson))"
            }}
            fontSizes={{
              name: "1.75rem",
              designation: "1rem", 
              quote: "1.125rem"
            }}
          />
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-8 sm:mb-12">
            O que a Crystal faz por você
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Card className="h-full border-border/50 hover:border-coral/50 transition-colors duration-300 group">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-coral to-crimson rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-coral transition-colors duration-300">
                          {feature.title}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="text-center mt-16 sm:mt-20"
        >
          <div className="bg-gradient-to-r from-coral/10 to-crimson/10 rounded-2xl border border-coral/20 p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Pronta para começar sua jornada?
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              A Crystal está ansiosa para conhecer você e começar a trabalhar juntas. 
              Vamos transformar sua vida amorosa hoje mesmo!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}