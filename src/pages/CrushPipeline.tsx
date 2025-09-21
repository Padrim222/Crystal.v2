import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Eye, Heart, MessageCircle, Calendar, Users, MoreHorizontal, GripVertical } from "lucide-react";
import { useCrushes } from "@/hooks/useCrushes";
import { AddCrushDialog } from "@/components/AddCrushDialog";
import { CrushDetailDialog } from "@/components/CrushDetailDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  rectIntersection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import { motion, AnimatePresence } from "framer-motion";

type Crush = Tables<'crushes'>;

const stages = [
  {
    id: "Primeiro Contato",
    title: "Primeiro Contato",
    color: "bg-blue-500",
    icon: Heart,
  },
  {
    id: "Conversa Inicial", 
    title: "Conversa Inicial",
    color: "bg-purple-500",
    icon: MessageCircle,
  },
  {
    id: "Encontro",
    title: "Encontro", 
    color: "bg-green-500",
    icon: Calendar,
  },
  {
    id: "Relacionamento",
    title: "Relacionamento",
    color: "bg-red-500",
    icon: Users,
  }
];

interface SortableCrushCardProps {
  crush: Crush;
  onViewDetails: (crush: Crush) => void;
  isDragging?: boolean;
}

function SortableCrushCard({ crush, onViewDetails, isDragging }: SortableCrushCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: crush.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CrushCard 
        crush={crush} 
        onViewDetails={onViewDetails}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging || isSortableDragging}
      />
    </div>
  );
}

function CrushCard({ 
  crush, 
  onViewDetails, 
  dragHandleProps,
  isDragging 
}: { 
  crush: Crush; 
  onViewDetails: (crush: Crush) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}) {
  const { moveCrushStage } = useCrushes();
  const { toast } = useToast();

  const formatLastInteraction = (dateString: string | null) => {
    if (!dateString) return 'Sem interação';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dias atrás`;
  };

  const handleStageChange = async (newStage: string) => {
    try {
      await moveCrushStage(crush.id, newStage);
      toast({
        title: "Estágio atualizado!",
        description: `${crush.name} foi movida para ${newStage}`,
      });
    } catch (error) {
      console.error('Error moving crush stage:', error);
    }
  };

  return (
    <Card className={`
      mb-3 shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300 cursor-pointer group
      ${isDragging ? 'shadow-2xl ring-2 ring-primary/50 scale-105' : ''}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-2">
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/50 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <Avatar className="h-12 w-12">
              <AvatarImage src={crush.photo_url || ""} alt={crush.name} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {crush.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">{crush.name}</CardTitle>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(crush);
                  }}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover border-border">
                    <DropdownMenuItem onClick={() => handleStageChange("Primeiro Contato")}>
                      Mover para Primeiro Contato
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStageChange("Conversa Inicial")}>
                      Mover para Conversa Inicial
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStageChange("Encontro")}>
                      Mover para Encontro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStageChange("Relacionamento")}>
                      Mover para Relacionamento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <CardDescription className="text-xs">
              {crush.age ? `${crush.age} anos` : 'Idade não informada'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Badge variant="secondary" className="text-xs mb-2">
          Nível {crush.interest_level || 0}
        </Badge>
        <p className="text-xs text-muted-foreground">
          {formatLastInteraction(crush.last_interaction)}
        </p>
      </CardContent>
    </Card>
  );
}

interface DroppableStageColumnProps {
  stage: any;
  crushes: Crush[];
  onViewDetails: (crush: Crush) => void;
}

function DroppableStageColumn({ stage, crushes, onViewDetails }: DroppableStageColumnProps) {
  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
          <h3 className="font-semibold text-foreground">
            {stage.title}
          </h3>
          <Badge variant="outline" className="text-xs">
            {crushes.length}
          </Badge>
        </div>
        <div className="h-px bg-border" />
      </div>

      <div className="min-h-96 p-2 rounded-lg border-2 border-dashed border-transparent transition-colors data-[accepting=true]:border-primary/50 data-[accepting=true]:bg-primary/5">
        <SortableContext items={crushes.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {crushes.map((crush) => (
              <motion.div
                key={crush.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <SortableCrushCard 
                  crush={crush} 
                  onViewDetails={onViewDetails}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>
        
        {crushes.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg text-muted-foreground">
            <div className="text-center">
              <stage.icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma paquera neste estágio</p>
              <p className="text-xs opacity-70">Arraste uma paquera aqui</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CrushPipeline = () => {
  const { crushesByStage, stats, loading, updateCrushPosition } = useCrushes();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCrush, setSelectedCrush] = useState<Crush | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleViewDetails = (crush: Crush) => {
    setSelectedCrush(crush);
    setShowDetailDialog(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the crush being dragged
    const activeCrush = Object.values(crushesByStage)
      .flat()
      .find(crush => crush.id === activeId);

    if (!activeCrush) return;

    // Find which stage the over element belongs to
    let targetStage = '';
    let targetIndex = 0;

    // Check if we're dropping on a stage (empty area)
    const stageMatch = stages.find(stage => stage.id === overId);
    if (stageMatch) {
      targetStage = stageMatch.id;
      targetIndex = crushesByStage[targetStage]?.length || 0;
    } else {
      // We're dropping on another crush
      for (const [stageName, crushes] of Object.entries(crushesByStage)) {
        const crushIndex = crushes.findIndex(crush => crush.id === overId);
        if (crushIndex !== -1) {
          targetStage = stageName;
          targetIndex = crushIndex;
          break;
        }
      }
    }

    if (!targetStage) return;

    // If it's the same stage and position, do nothing
    if (activeCrush.current_stage === targetStage) {
      const currentIndex = crushesByStage[targetStage]?.findIndex(c => c.id === activeId) || 0;
      if (currentIndex === targetIndex) return;
    }

    try {
      await updateCrushPosition(activeId, targetStage, targetIndex);
    } catch (error) {
      console.error('Error updating crush position:', error);
    }
  };

  const activeCrush = activeId ? 
    Object.values(crushesByStage).flat().find(crush => crush.id === activeId) : null;
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 min-w-80">
              <div className="h-6 bg-muted rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2].map(j => (
                  <div key={j} className="h-32 bg-muted rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pipeline da Conquista</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas paqueras e acompanhe o progresso - arraste e solte para mover entre estágios
            </p>
          </div>
          <Button 
            variant="premium" 
            className="gap-2"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Adicionar Paquera
          </Button>
        </div>

        {/* Pipeline Columns */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <DroppableStageColumn
              key={stage.id}
              stage={stage}
              crushes={crushesByStage[stage.id] || []}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Paqueras</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats.total}
              </div>
              <p className="text-xs text-muted-foreground">
                Ativas no pipeline
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Conversa</CardTitle>
              <MessageCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {stats.byStage['Conversa Inicial']}
              </div>
              <p className="text-xs text-muted-foreground">
                Conversas ativas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Encontros Marcados</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {stats.byStage['Encontro']}
              </div>
              <p className="text-xs text-muted-foreground">
                Próximos encontros
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-gradient-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.successRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Crush Dialog */}
        <AddCrushDialog 
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onCrushAdded={(crush) => {
            setShowAddDialog(false);
          }}
        />

        {/* Crush Detail Dialog */}
        <CrushDetailDialog
          crush={selectedCrush}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeCrush ? (
          <CrushCard
            crush={activeCrush}
            onViewDetails={() => {}}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default CrushPipeline;