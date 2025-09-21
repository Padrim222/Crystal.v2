import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCrushes } from "@/hooks/useCrushes";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  age: z.string().optional(),
  current_stage: z.string().optional(),
  interest_level: z.string().optional(),
});

interface AddCrushDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCrushAdded: (crush: any) => void;
}

export function AddCrushDialog({ 
  open, 
  onOpenChange, 
  onCrushAdded 
}: AddCrushDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [imgurHash, setImgurHash] = useState<string>("");
  const { addCrush } = useCrushes();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      age: "",
      current_stage: "Primeiro Contato",
      interest_level: "5",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      
      const crushData = {
        name: values.name,
        age: values.age ? parseInt(values.age) : null,
        current_stage: values.current_stage || "Primeiro Contato",
        interest_level: values.interest_level ? parseInt(values.interest_level) : 5,
        last_interaction: new Date().toISOString(),
        photo_url: photoUrl || null,
        imgur_hash: imgurHash || null,
        position: 0, // New crushes go to the top
      };

      const newCrush = await addCrush(crushData);
      onCrushAdded(newCrush);
      form.reset();
      setPhotoUrl("");
      setImgurHash("");
      
      toast({
        title: "Sucesso!",
        description: `${values.name} foi adicionada ao pipeline`,
      });
    } catch (error) {
      console.error("Error adding crush:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (url: string, deleteHash: string) => {
    setPhotoUrl(url);
    setImgurHash(deleteHash);
  };

  const handleImageRemove = () => {
    setPhotoUrl("");
    setImgurHash("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nova Paquera</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Adicione uma nova pessoa ao seu pipeline de conquista
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Foto (opcional)</label>
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImage={photoUrl}
                onImageRemove={handleImageRemove}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Maria Silva" 
                      {...field} 
                      className="bg-input border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ex: 25" 
                      {...field}
                      className="bg-input border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="current_stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estágio Inicial</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Selecione o estágio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="Primeiro Contato">Primeiro Contato</SelectItem>
                      <SelectItem value="Conversa Inicial">Conversa Inicial</SelectItem>
                      <SelectItem value="Encontro">Encontro</SelectItem>
                      <SelectItem value="Relacionamento">Relacionamento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interest_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Interesse (1-10)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-input border-border">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-popover border-border">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          {level} - {
                            level <= 3 ? "Baixo" :
                            level <= 6 ? "Médio" :
                            level <= 8 ? "Alto" : "Muito Alto"
                          }
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="premium" 
                disabled={isLoading}
              >
                {isLoading ? "Adicionando..." : "Adicionar Paquera"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}