-- Create conversation_insights table to store AI-generated insights
CREATE TABLE public.conversation_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  conversation_id UUID,
  crush_id UUID,
  insight_type TEXT NOT NULL, -- 'improvement_tip', 'relationship_analysis', 'next_steps'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  score INTEGER DEFAULT 0, -- Relevance score from 0-100
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_insights ENABLE ROW LEVEL SECURITY;

-- Create policies for conversation_insights
CREATE POLICY "Users can view their own insights" 
ON public.conversation_insights 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own insights" 
ON public.conversation_insights 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own insights" 
ON public.conversation_insights 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own insights" 
ON public.conversation_insights 
FOR DELETE 
USING (user_id = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conversation_insights_updated_at
BEFORE UPDATE ON public.conversation_insights
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_conversation_insights_user_id ON public.conversation_insights(user_id);
CREATE INDEX idx_conversation_insights_conversation_id ON public.conversation_insights(conversation_id);
CREATE INDEX idx_conversation_insights_crush_id ON public.conversation_insights(crush_id);