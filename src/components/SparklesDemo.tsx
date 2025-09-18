"use client";
import React from "react";
import { SparklesCore } from "@/components/ui/sparkles";
import { GradientButton } from "@/components/ui/gradient-button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export function SparklesHero() {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full bg-background flex flex-col items-center justify-center overflow-hidden relative p-4 sm:p-6 lg:p-8"
    >
      {/* Hero Content */}
      <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 relative z-20 text-center w-full max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-tight">
          Crystal.ai
        </h1>
        
        {/* Neon effect section with sparkles */}
        <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-32 sm:h-40 relative">
          {/* Gradients */}
          <div className="absolute inset-x-4 sm:inset-x-8 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-coral to-transparent h-[2px] w-3/4 blur-sm" />
          <div className="absolute inset-x-4 sm:inset-x-8 md:inset-x-20 top-0 bg-gradient-to-r from-transparent via-coral to-transparent h-px w-3/4" />
          <div className="absolute inset-x-8 sm:inset-x-16 md:inset-x-32 lg:inset-x-60 top-0 bg-gradient-to-r from-transparent via-crimson to-transparent h-[5px] w-1/4 blur-sm" />
          <div className="absolute inset-x-8 sm:inset-x-16 md:inset-x-32 lg:inset-x-60 top-0 bg-gradient-to-r from-transparent via-crimson to-transparent h-px w-1/4" />

          {/* Core component */}
          <SparklesCore
            background="transparent"
            minSize={0.4}
            maxSize={1}
            particleDensity={800}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />

          {/* Radial Gradient to prevent sharp edges */}
          <div className="absolute inset-0 w-full h-full bg-background [mask-image:radial-gradient(250px_150px_at_top,transparent_20%,white)] sm:[mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
        </div>
        
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-2xl px-2">
          A melhor amiga dos homens na arte de conquistar. 
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md sm:max-w-none px-2">
          <GradientButton 
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base"
          >
            Fazer Login
          </GradientButton>
          <GradientButton 
            variant="variant"
            className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base"
          >
            Conheça a Crystal
          </GradientButton>
        </div>
      </div>
    </motion.div>
  );
}