import React from "react";
import { motion } from "framer-motion";

const CrystalSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-black to-primary/10 py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Como Funciona o <span className="text-gradient">Crystal.ai</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Nossa IA analisa milhares de pontos de compatibilidade para encontrar matches perfeitos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Análise Profunda",
              description: "IA analisa seus gostos, personalidade e preferências",
              icon: "🧠"
            },
            {
              step: "02", 
              title: "Match Inteligente",
              description: "Algoritmo encontra pessoas com alta compatibilidade",
              icon: "💖"
            },
            {
              step: "03",
              title: "Conexão Real",
              description: "Facilita conversas naturais e relacionamentos duradouros",
              icon: "✨"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="glass-card p-8 text-center hover-lift"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-primary text-sm font-bold mb-2">{item.step}</div>
              <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CrystalSection;