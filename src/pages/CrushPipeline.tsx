import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Heart, MessageCircle, Calendar, Users, GripVertical, PieChart } from "lucide-react";
import { StarBorder } from "@/components/ui/star-border";
import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Pie } from 'recharts';
import { useCrushes } from "@/hooks/useCrushes";
import { AddCrushDialog } from "@/components/AddCrushDialog";
import { CrushDetailDialog } from "@/components/CrushDetailDialog";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import {
  DndContext,
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

type Crush = Tables<'crushes'>;

const stages = [
  {
    id: "Primeiro Contato",
    title: "Primeiro Contato",
    icon: Heart,
  },
  {
    id: "Conversa Inicial", 
    title: "Conversa Inicial",
    icon: MessageCircle,
  },
  {
    id: "Encontro",
    title: "Encontro", 
    icon: Calendar,
  },
  {
    id: "Relacionamento",
    title: "Relacionamento",
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
  return (
    <StarBorder
      as="div"
      className={`
        mb-2 cursor-pointer group transition-all duration-300
        ${isDragging ? 'scale-105 opacity-90' : ''}
      `}
      color="hsl(var(--primary))"
      speed="8s"
      onClick={() => onViewDetails(crush)}
    >
      <div className="p-3">
        <div className="flex items-center gap-3">
          <div 
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <Avatar className="h-10 w-10">
            <AvatarImage src={crush.photo_url || ""} alt={crush.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {crush.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{crush.name}</div>
            <div className="flex items-center gap-2 mt-1">
              {crush.age && (
                <span className="text-xs text-muted-foreground">{crush.age}a</span>
              )}
              <Badge variant="outline" className="text-xs px-1">
                {crush.interest_level || 0}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </StarBorder>
  );
}

interface DroppableStageColumnProps {
  stage: any;
  crushes: Crush[];
  onViewDetails: (crush: Crush) => void;
}

function DroppableStageColumn({ stage, crushes, onViewDetails }: DroppableStageColumnProps) {
  return (
    <div className="flex-1 min-w-72">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <stage.icon className="h-4 w-4 text-primary" />
          <h3 className="font-medium text-sm text-foreground">
            {stage.title}
          </h3>
          <Badge variant="outline" className="text-xs h-5 px-2">
            {crushes.length}
          </Badge>
        </div>
      </div>

      <div className="min-h-80 p-2 rounded-lg border border-dashed border-border/50 bg-muted/20">
        <SortableContext items={crushes.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {crushes.map((crush) => (
            <SortableCrushCard 
              key={crush.id}
              crush={crush} 
              onViewDetails={onViewDetails}
            />
          ))}
        </SortableContext>
        
        {crushes.length === 0 && (
          <div className="flex items-center justify-center h-24 text-muted-foreground/50">
            <div className="text-center">
              <stage.icon className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs">Vazio</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CrushPipeline = () => {
  const { crushesByStage, stats, loading, updateCrushPosition, updateCrush } = useCrushes();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCrush, setSelectedCrush] = useState<Crush | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

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

    // If dragging within the same stage, just reorder
    if (targetStage === activeCrush.current_stage) {
      try {
        await updateCrushPosition(activeId, targetStage, targetIndex);
      } catch (error) {
        console.error('Error reordering crush:', error);
      }
      return;
    }

    // Moving to a different stage
    try {
      await updateCrush(activeId, { 
        current_stage: targetStage,
        updated_at: new Date().toISOString()
      });
      toast({
        title: "Paquera movida!",
        description: `${activeCrush.name} foi movida para ${targetStage}`,
      });
    } catch (error) {
      console.error('Error updating crush stage:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover a paquera",
        variant: "destructive"
      });
    }
  };

  const activeCrush = activeId ? 
    Object.values(crushesByStage).flat().find(crush => crush.id === activeId) : null;
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex-1 min-w-72">
              <div className="h-6 bg-muted rounded mb-3"></div>
              <div className="space-y-2">
                {[1, 2].map(j => (
                  <div key={j} className="h-16 bg-muted rounded animate-pulse"></div>
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
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4 p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">Paqueras</h1>
          <Button 
            onClick={() => setShowAddDialog(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Adicionar</span>
          </Button>
        </div>

        {/* Pipeline Columns - Mobile optimized */}
        <div className="flex gap-3 overflow-x-auto pb-4 md:gap-4">
          {stages.map((stage) => (
            <div key={stage.id} className="flex-1 min-w-[280px] md:min-w-72">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <stage.icon className="h-4 w-4 text-primary" />
                  <h3 className="font-medium text-sm text-foreground">
                    {stage.title}
                  </h3>
                  <Badge variant="outline" className="text-xs h-5 px-2">
                    {(crushesByStage[stage.id] || []).length}
                  </Badge>
                </div>
              </div>

              <div className="min-h-[300px] md:min-h-80 p-2 rounded-lg border border-dashed border-border/50 bg-muted/20">
                <SortableContext items={(crushesByStage[stage.id] || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
                  {(crushesByStage[stage.id] || []).map((crush) => (
                    <SortableCrushCard 
                      key={crush.id}
                      crush={crush} 
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </SortableContext>
                
                {(crushesByStage[stage.id] || []).length === 0 && (
                  <div className="flex items-center justify-center h-24 text-muted-foreground/50">
                    <div className="text-center">
                      <stage.icon className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-xs">Vazio</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Insights with Pie Charts */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Insights das Paqueras
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Stage Distribution Chart */}
            <StarBorder as="div" className="w-full" color="hsl(var(--primary))" speed="10s">
              <div className="p-4">
                <h3 className="text-sm font-medium mb-3 text-center">Distribuição por Estágio</h3>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <defs>
                        <linearGradient id="stageGradient1" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--primary-muted))" />
                        </linearGradient>
                        <linearGradient id="stageGradient2" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--accent))" />
                          <stop offset="100%" stopColor="hsl(var(--accent-muted))" />
                        </linearGradient>
                        <linearGradient id="stageGradient3" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--secondary))" />
                          <stop offset="100%" stopColor="hsl(var(--secondary-muted))" />
                        </linearGradient>
                        <linearGradient id="stageGradient4" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--success))" />
                          <stop offset="100%" stopColor="hsl(var(--success)/0.7)" />
                        </linearGradient>
                      </defs>
                      <Pie
                        data={[
                          { name: 'Primeiro Contato', value: stats.byStage['Primeiro Contato'] },
                          { name: 'Conversa Inicial', value: stats.byStage['Conversa Inicial'] },
                          { name: 'Encontro', value: stats.byStage['Encontro'] },
                          { name: 'Relacionamento', value: stats.byStage['Relacionamento'] },
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={50}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill="url(#stageGradient1)" />
                        <Cell fill="url(#stageGradient2)" />
                        <Cell fill="url(#stageGradient3)" />
                        <Cell fill="url(#stageGradient4)" />
                      </Pie>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </StarBorder>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-2">
              <StarBorder as="div" color="hsl(var(--primary))" speed="12s">
                <div className="p-3 text-center">
                  <div className="text-xl font-bold text-primary">{stats.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </StarBorder>
              
              <StarBorder as="div" color="hsl(var(--accent))" speed="14s">
                <div className="p-3 text-center">
                  <div className="text-xl font-bold">{stats.byStage['Conversa Inicial'] || 0}</div>
                  <div className="text-xs text-muted-foreground">Conversas</div>
                </div>
              </StarBorder>
              
              <StarBorder as="div" color="hsl(var(--secondary))" speed="16s">
                <div className="p-3 text-center">
                  <div className="text-xl font-bold">{stats.byStage['Encontro'] || 0}</div>
                  <div className="text-xs text-muted-foreground">Encontros</div>
                </div>
              </StarBorder>
              
              <StarBorder as="div" color="hsl(var(--success))" speed="18s">
                <div className="p-3 text-center">
                  <div className="text-xl font-bold text-success">{stats.successRate}%</div>
                  <div className="text-xs text-muted-foreground">Sucesso</div>
                </div>
              </StarBorder>
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <AddCrushDialog 
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onCrushAdded={() => setShowAddDialog(false)}
        />

        <CrushDetailDialog 
          crush={selectedCrush}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      </div>

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