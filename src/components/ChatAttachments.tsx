import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, Image as ImageIcon, Paperclip, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatAttachmentsProps {
  onImageSelect: (imageUrl: string, imageBase64: string) => void;
  currentImage?: string;
  onImageRemove?: () => void;
  disabled?: boolean;
}

export const ChatAttachments = ({ 
  onImageSelect, 
  currentImage, 
  onImageRemove, 
  disabled = false 
}: ChatAttachmentsProps) => {
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
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
          title: `Crystal Chat - ${file.name}`
        }
      });

      if (error) {
        console.error('Imgur upload error:', error);
        throw new Error(error.message || 'Erro ao fazer upload da imagem');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro ao fazer upload da imagem');
      }

      // Pass both the URL and base64 to parent
      onImageSelect(data.data.url, base64);
      setShowUpload(false);
      
      toast({
        title: "Sucesso!",
        description: "Imagem enviada! A Crystal pode vê-la agora.",
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
    <div className="relative">
      {/* Attach Button */}
      <Button
        variant="ghost"
        size="icon"
        type="button"
        onClick={() => currentImage ? fileInputRef.current?.click() : setShowUpload(!showUpload)}
        disabled={disabled}
        className={currentImage ? "text-primary" : ""}
      >
        {currentImage ? <Plus className="size-4" /> : <Paperclip className="size-4" />}
      </Button>

      {/* Upload Modal/Popup */}
      <AnimatePresence>
        {showUpload && !currentImage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 z-50 max-w-[calc(100vw-2rem)] w-80"
          >
            <Card className="p-4 shadow-lg border-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Enviar imagem para Crystal</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUpload(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <div className="space-y-2">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                        <p className="text-xs text-muted-foreground">Enviando...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                        <div>
                          <p className="text-sm font-medium">Clique para enviar</p>
                          <p className="text-xs text-muted-foreground">
                            JPG, PNG até 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    A Crystal pode ver e analisar suas imagens! 👀
                  </p>
                </div>
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