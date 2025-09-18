import React from "react";
import { AlertCircle } from "lucide-react";

export const MaintenanceAlert = () => {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-400" />
        <p className="text-amber-200 text-xs">
          Sistema em desenvolvimento - Acesso limitado
        </p>
      </div>
    </div>
  );
};