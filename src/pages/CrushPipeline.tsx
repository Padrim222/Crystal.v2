import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Eye, Heart, MessageCircle, Calendar, Users } from "lucide-react";

// Mock data for crushes
const mockCrushes = {
  "primeiro-contato": [
    {
      id: 1,
      name: "Maria Silva",
      age: 28,
      photo: "",
      status: "Aguardando resposta",
      lastInteraction: "2 horas atrás"
    },
    {
      id: 2,
      name: "Ana Santos",
      age: 25,
      photo: "",
      status: "Match recente",
      lastInteraction: "1 dia atrás"
    }
  ],
  "conversa-inicial": [
    {
      id: 3,
      name: "Paula Costa",
      age: 30,
      photo: "",
      status: "Conversando bem",
      lastInteraction: "30 min atrás"
    }
  ],
  "encontro": [
    {
      id: 4,
      name: "Sofia Lima",
      age: 27,
      photo: "",
      status: "Encontro marcado",
      lastInteraction: "Amanhã às 19h"
    }
  ],
  "relacionamento": []
};

const stages = [
  {
    id: "primeiro-contato",
    title: "Primeiro Contato",
    color: "bg-blue-500",
    icon: Heart,
    count: mockCrushes["primeiro-contato"].length
  },
  {
    id: "conversa-inicial",
    title: "Conversa Inicial",
    color: "bg-purple-500",
    icon: MessageCircle,
    count: mockCrushes["conversa-inicial"].length
  },
  {
    id: "encontro",
    title: "Encontro",
    color: "bg-green-500",
    icon: Calendar,
    count: mockCrushes["encontro"].length
  },
  {
    id: "relacionamento",
    title: "Relacionamento",
    color: "bg-red-500",
    icon: Users,
    count: mockCrushes["relacionamento"].length
  }
];

function CrushCard({ crush }: { crush: any }) {
  return (
    <Card className="mb-3 shadow-card bg-gradient-card border-0 hover:shadow-glow transition-all duration-300 cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={crush.photo} alt={crush.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {crush.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">{crush.name}</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Eye className="h-3 w-3" />
              </Button>
            </div>
            <CardDescription className="text-xs">
              {crush.age} anos
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Badge variant="secondary" className="text-xs mb-2">
          {crush.status}
        </Badge>
        <p className="text-xs text-muted-foreground">
          {crush.lastInteraction}
        </p>
      </CardContent>
    </Card>
  );
}

function StageColumn({ stage, crushes }: { stage: any; crushes: any[] }) {
  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${stage.color}`} />
          <h3 className="font-semibold text-foreground">
            {stage.title}
          </h3>
          <Badge variant="outline" className="text-xs">
            {stage.count}
          </Badge>
        </div>
        <div className="h-px bg-border" />
      </div>

      <div className="space-y-3 min-h-96">
        {crushes.map((crush) => (
          <CrushCard key={crush.id} crush={crush} />
        ))}
        
        {crushes.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg text-muted-foreground">
            <div className="text-center">
              <stage.icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma paquera neste estágio</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const CrushPipeline = () => {
  const [selectedCrush, setSelectedCrush] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline da Conquista</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie suas paqueras e acompanhe o progresso de cada conquista
          </p>
        </div>
        <Button variant="crystal" className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Paquera
        </Button>
      </div>

      {/* Pipeline Columns */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            crushes={mockCrushes[stage.id as keyof typeof mockCrushes]}
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
              {Object.values(mockCrushes).flat().length}
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
              {mockCrushes["conversa-inicial"].length}
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
              {mockCrushes["encontro"].length}
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
              85%
            </div>
            <p className="text-xs text-muted-foreground">
              Este mês
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CrushPipeline;