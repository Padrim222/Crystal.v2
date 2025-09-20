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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCrushes } from "@/hooks/useCrushes";
import { useConversations } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Calendar,
  Trash2,
  Edit3,
  Save,
  X,
  User,
  MapPin,
  Cake,
  Phone,
  Mail
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Crush = Tables<'crushes'>;

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  age: z.string().optional(),
  current_stage: z.string(),
  interest_level: z.number().min(0).max(100),
  notes: z.string().optional(),
});

interface CrushDetailDialogProps {
  crush: Crush | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CrushDetailDialog({ 
  crush, 
  open, 
  onOpenChange 
}: CrushDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateCrush, deleteCrush } = useCrushes();
  const { startConversation } = useConversations();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: crush?.name || "",
      age: crush?.age?.toString() || "",
      current_stage: crush?.current_stage || "Primeiro Contato",
      interest_level: crush?.interest_level || 0,
      notes: "",
    },
  });

  // Update form when crush changes
  useState(() => {
    if (crush) {
      form.reset({
        name: crush.name,
        age: crush.age?.toString() || "",
        current_stage: crush.current_stage || "Primeiro Contato",
        interest_level: crush.interest_level || 0,
        notes: "",
      });
    }
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!crush) return;
    
    try {
      setIsLoading(true);
      
      await updateCrush(crush.id, {
        name: values.name,
        age: values.age ? parseInt(values.age) : null,
        current_stage: values.current_stage,
        interest_level: values.interest_level,
        updated_at: new Date().toISOString(),
      });
      
      setIsEditing(false);
      toast({
        title: "Sucesso!",
        description: "Informações atualizadas com sucesso",
      });
    } catch (error) {
      console.error("Error updating crush:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!crush) return;
    
    if (confirm("Tem certeza que deseja remover esta paquera?")) {
      try {
        await deleteCrush(crush.id);
        onOpenChange(false);
        toast({
          title: "Paquera removida",
          description: "A paquera foi removida do seu pipeline",
        });
      } catch (error) {
        console.error("Error deleting crush:", error);
      }
    }
  };

  const handleStartChat = async () => {
    if (!crush) return;
    
    try {
      await startConversation(crush.id, 'crush_conversation');
      toast({
        title: "Conversa iniciada!",
        description: `Conversa com ${crush.name} iniciada`,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Primeiro Contato": return "bg-blue-500";
      case "Conversa Inicial": return "bg-purple-500"; 
      case "Encontro": return "bg-green-500";
      case "Relacionamento": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getInterestColor = (level: number) => {
    if (level >= 80) return "text-green-500";
    if (level >= 60) return "text-yellow-500";
    if (level >= 40) return "text-orange-500";
    return "text-red-500";
  };

  if (!crush) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={crush.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {crush.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">{crush.name}</DialogTitle>
                <DialogDescription>
                  {crush.age && `${crush.age} anos`}
                </DialogDescription>
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getStageColor(crush.current_stage || '')}`} />
                <span className="font-medium">Estágio Atual</span>
              </div>
              <Badge variant="secondary" className="w-fit">
                {crush.current_stage}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${getInterestColor(crush.interest_level || 0)}`} />
                <span className="font-medium">Nível de Interesse</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{crush.interest_level || 0}%</span>
                </div>
                <Progress value={crush.interest_level || 0} className="h-2" />
              </div>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Criado em</p>
                <p>{format(new Date(crush.created_at || ''), "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
              </div>
              {crush.last_interaction && (
                <div>
                  <p className="text-muted-foreground">Última interação</p>
                  <p>{format(new Date(crush.last_interaction), "dd 'de' MMM, yyyy", { locale: ptBR })}</p>
                </div>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {isEditing && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-input border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idade</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
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
                        <FormLabel>Estágio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-input border-border">
                              <SelectValue />
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
                </div>

                <FormField
                  control={form.control}
                  name="interest_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nível de Interesse: {field.value}%</FormLabel>
                      <FormControl>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex gap-3">
              <Button 
                onClick={handleStartChat}
                className="flex-1 gap-2"
                variant="premium"
              >
                <MessageCircle className="h-4 w-4" />
                Iniciar Conversa
              </Button>
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => {
                  // Navigate to insights focused on this crush
                  toast({
                    title: "Em breve!",
                    description: "Funcionalidade de insights detalhados em desenvolvimento",
                  });
                }}
              >
                <User className="h-4 w-4" />
                Ver Insights
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}