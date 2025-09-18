import React from "react";
import { cn } from "@/lib/utils";

interface SmokeyBackgroundProps {
  color?: string;
  backdropBlurAmount?: "none" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const SmokeyBackground: React.FC<SmokeyBackgroundProps> = ({
  color = "#F26671",
  backdropBlurAmount = "md",
  className,
}) => {
  const blurClasses = {
    none: "",
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md", 
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      {/* Animated background blobs */}
      <div 
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ backgroundColor: color }}
      />
      <div 
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ backgroundColor: color, animationDelay: '1s' }}
      />
      <div 
        className="absolute top-3/4 left-1/2 w-64 h-64 rounded-full blur-3xl opacity-25 animate-pulse"
        style={{ backgroundColor: color, animationDelay: '2s' }}
      />
      
      {/* Backdrop blur overlay */}
      <div className={cn("absolute inset-0 bg-black/40", blurClasses[backdropBlurAmount])} />
    </div>
  );
};