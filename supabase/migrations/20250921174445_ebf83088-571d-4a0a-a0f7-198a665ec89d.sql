-- Add fields for Kanban functionality to crushes table
ALTER TABLE public.crushes 
ADD COLUMN photo_url TEXT,
ADD COLUMN position INTEGER DEFAULT 0,
ADD COLUMN imgur_hash TEXT;

-- Create index for better performance on position queries
CREATE INDEX idx_crushes_stage_position ON public.crushes(current_stage, position);

-- Update existing crushes to have sequential positions within their stages
WITH ranked_crushes AS (
  SELECT 
    id,
    current_stage,
    ROW_NUMBER() OVER (PARTITION BY current_stage ORDER BY created_at) as new_position
  FROM public.crushes
)
UPDATE public.crushes 
SET position = ranked_crushes.new_position - 1
FROM ranked_crushes 
WHERE crushes.id = ranked_crushes.id;