import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Heart, 
  Smile, 
  Brain, 
  Zap,
  MessageSquare,
  Sparkles,
  Save,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserSettings {
  personality_safada: number;
  personality_fofa: number;
  personality_conscious: number;
  personality_calma: number;
  behavior_palavrao: boolean;
  behavior_humor: boolean;
  behavior_direta: boolean;
  behavior_romantica: boolean;
  custom_prompt: string;
}

const defaultSettings: UserSettings = {
  personality_safada: 50,
  personality_fofa: 50,
  personality_conscious: 50,
  personality_calma: 50,
  behavior_palavrao: false,
  behavior_humor: true,
  behavior_direta: false,
  behavior_romantica: true,
  custom_prompt: ""
};

const Personalization = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          personality_safada: data.personality_safada || 50,
          personality_fofa: data.personality_fofa || 50,
          personality_conscious: data.personality_conscious || 50,
          personality_calma: data.personality_calma || 50,
          behavior_palavrao: data.behavior_palavrao || false,
          behavior_humor: data.behavior_humor || true,
          behavior_direta: data.behavior_direta || false,
          behavior_romantica: data.behavior_romantica || true,
          custom_prompt: data.custom_prompt || ""
        });
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar suas configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "A Crystal foi personalizada com sucesso",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    toast({
      title: "Configurações resetadas",
      description: "Valores padrão restaurados",
    });
  };

  const updatePersonality = (key: keyof UserSettings, value: number[]) => {
    setSettings(prev => ({ ...prev, [key]: value[0] }));
  };

  const updateBehavior = (key: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const getPersonalityLabel = (value: number) => {
    if (value < 30) return "Baixo";
    if (value < 70) return "Médio";
    return "Alto";
  };

  const getPersonalityColor = (value: number) => {
    if (value < 30) return "bg-gray-500";
    if (value < 70) return "bg-coral";
    return "bg-crimson";
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-coral" />
          <h1 className="text-3xl font-bold text-foreground">Personalização da Crystal</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personality" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="personality">Personalidade</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="custom">Personalização</TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-coral" />
                Traços de Personalidade
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ajuste como a Crystal se comporta em diferentes situações
              </p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Safadeza</Label>
                    <Badge className={getPersonalityColor(settings.personality_safada)}>
                      {getPersonalityLabel(settings.personality_safada)}
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.personality_safada]}
                    onValueChange={(value) => updatePersonality('personality_safada', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Define o nível de ousadia e provocação nas conversas
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Fofura</Label>
                    <Badge className={getPersonalityColor(settings.personality_fofa)}>
                      {getPersonalityLabel(settings.personality_fofa)}
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.personality_fofa]}
                    onValueChange={(value) => updatePersonality('personality_fofa', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controla o nível de carinho e delicadeza
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Consciência</Label>
                    <Badge className={getPersonalityColor(settings.personality_conscious)}>
                      {getPersonalityLabel(settings.personality_conscious)}
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.personality_conscious]}
                    onValueChange={(value) => updatePersonality('personality_conscious', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Define o nível de reflexão e profundidade
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Calma</Label>
                    <Badge className={getPersonalityColor(settings.personality_calma)}>
                      {getPersonalityLabel(settings.personality_calma)}
                    </Badge>
                  </div>
                  <Slider
                    value={[settings.personality_calma]}
                    onValueChange={(value) => updatePersonality('personality_calma', value)}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Controla a paciência e tranquilidade
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-crimson" />
                Comportamentos
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure como a Crystal se expressa e interage
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Palavrões</Label>
                    <p className="text-sm text-muted-foreground">
                      Permite o uso de linguagem mais informal
                    </p>
                  </div>
                  <Switch
                    checked={settings.behavior_palavrao}
                    onCheckedChange={(value) => updateBehavior('behavior_palavrao', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Humor</Label>
                    <p className="text-sm text-muted-foreground">
                      Inclui piadas e brincadeiras
                    </p>
                  </div>
                  <Switch
                    checked={settings.behavior_humor}
                    onCheckedChange={(value) => updateBehavior('behavior_humor', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Direta</Label>
                    <p className="text-sm text-muted-foreground">
                      Comunicação objetiva e sem rodeios
                    </p>
                  </div>
                  <Switch
                    checked={settings.behavior_direta}
                    onCheckedChange={(value) => updateBehavior('behavior_direta', value)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <Label className="text-base font-medium">Romântica</Label>
                    <p className="text-sm text-muted-foreground">
                      Abordagem romântica e sedutora
                    </p>
                  </div>
                  <Switch
                    checked={settings.behavior_romantica}
                    onCheckedChange={(value) => updateBehavior('behavior_romantica', value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-coral" />
                Personalização Avançada
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Defina instruções específicas para a Crystal
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Prompt Personalizado</Label>
                <Textarea
                  placeholder="Descreva como você quer que a Crystal se comporte... Ex: 'Seja mais carinhosa comigo', 'Use mais gírias cariocas', 'Foque em relacionamentos sérios'..."
                  value={settings.custom_prompt}
                  onChange={(e) => setSettings(prev => ({ ...prev, custom_prompt: e.target.value }))}
                  className="min-h-[120px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Este texto será usado para personalizar ainda mais as respostas da Crystal
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Prévia da Personalidade
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-coral" />
                    <span>
                      Safadeza: {settings.personality_safada}% • 
                      Fofura: {settings.personality_fofa}% • 
                      Consciência: {settings.personality_conscious}% • 
                      Calma: {settings.personality_calma}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smile className="h-3 w-3 text-crimson" />
                    <span>
                      {[
                        settings.behavior_palavrao && "Informal",
                        settings.behavior_humor && "Engraçada",
                        settings.behavior_direta && "Direta",
                        settings.behavior_romantica && "Romântica"
                      ].filter(Boolean).join(", ") || "Comportamentos não selecionados"}
                    </span>
                  </div>
                  {settings.custom_prompt && (
                    <div className="mt-2 p-2 bg-background rounded border-l-4 border-coral">
                      <p className="text-xs italic">"{settings.custom_prompt}"</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Personalization;