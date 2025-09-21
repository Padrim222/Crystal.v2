import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  onImageUpload: (url: string, deleteHash: string) => void;
  currentImage?: string;
  onImageRemove?: () => void;
  className?: string;
}

export const ImageUpload = ({ 
  onImageUpload, 
  currentImage, 
  onImageRemove, 
  className = "" 
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 10MB.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Upload to Imgur via edge function
      const { data, error } = await supabase.functions.invoke('imgur-upload', {
        body: {
          imageBase64: base64,
          title: `Crystal Crush - ${file.name}`
        }
      });

      if (error) {
        console.error('Imgur upload error:', error);
        throw new Error(error.message || 'Erro ao fazer upload da imagem');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao fazer upload da imagem');
      }

      onImageUpload(data.data.url, data.data.deleteHash);
      
      toast({
        title: "Sucesso!",
        description: "Imagem enviada com sucesso.",
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao fazer upload da imagem.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRemoveImage = () => {
    if (onImageRemove) {
      onImageRemove();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence mode="wait">
        {currentImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <Card className="p-2 relative overflow-hidden">
              <img
                src={currentImage}
                alt="Crush"
                className="w-full h-48 object-cover rounded-md"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <X className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card
              className={`
                p-8 border-2 border-dashed transition-all duration-200 cursor-pointer
                ${dragOver 
                  ? 'border-primary bg-primary/5 scale-105' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
                }
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                {uploading ? (
                  <>
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <div>
                      <p className="text-sm font-medium">Enviando imagem...</p>
                      <p className="text-xs text-muted-foreground">
                        Aguarde enquanto fazemos upload para o Imgur
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      <Upload className="h-6 w-6 text-primary absolute -top-1 -right-1" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Clique ou arraste uma foto aqui
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Máximo 10MB • JPG, PNG, GIF
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};