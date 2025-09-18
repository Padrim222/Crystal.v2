"use client";
import React from "react";
import { SparklesCore } from "./ui/sparkles-core";

export function SparklesHero() {
  return (
    <div className="h-screen relative w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
      <div className="w-full absolute inset-0 h-screen">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#F26671"
        />
      </div>
      <div className="relative z-20">
        <h1 className="md:text-7xl text-3xl lg:text-6xl font-bold text-center text-white relative">
          Crystal.ai
        </h1>
        <p className="text-white text-center text-lg mt-4 max-w-lg mx-auto">
          A inteligência artificial que encontra sua alma gêmea perfeita
        </p>
        <div className="flex justify-center mt-8">
          <button className="bg-gradient-to-r from-primary to-primary-hover text-white px-8 py-3 rounded-full font-semibold hover:scale-105 transition-transform duration-200">
            Começar Agora
          </button>
        </div>
      </div>
    </div>
  );
}