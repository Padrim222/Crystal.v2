import { HomeBanner } from "@/components/home/HomeBanner";
import AboutCrystal from "@/components/home/AboutCrystal";
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
      <HomeBanner />
      <AboutCrystal />
    </motion.main>
  );
};

export default Index;
