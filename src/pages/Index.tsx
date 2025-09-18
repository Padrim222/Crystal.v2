import { SparklesHero } from "@/components/SparklesDemo";
import CrystalSection from "@/components/CrystalSection";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <motion.main 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      <SparklesHero />
      <CrystalSection />
    </motion.main>
  );
};

export default Index;
