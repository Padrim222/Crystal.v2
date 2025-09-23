import { SparklesHero } from "@/components/SparklesHero";
import CrystalSection from "@/components/CrystalSection";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";

const Index = () => {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background relative"
    >
      <SparklesHero />
      <CrystalSection />
      
      {/* Footer */}
      <footer className="bg-card/80 backdrop-blur-sm border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Crystal.ai versão 1.0.2 - Nos ajude a melhorar a Crystal nas atualizações semanais
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="mailto:contato@leticiafelisberto.com"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                contato@leticiafelisberto.com
              </a>
              <button
                onClick={() => window.open('mailto:contato@leticiafelisberto.com?subject=%23Feedback', '_blank')}
                className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded transition-colors"
              >
                <MessageCircle className="h-3 w-3 mr-1 inline" />
                Feedback
              </button>
            </div>
          </div>
        </div>
      </footer>
    </motion.main>
  );
};

export default Index;
