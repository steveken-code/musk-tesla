-- Create translations table for SEO-optimized pre-translated content
CREATE TABLE public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  language TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, language)
);

-- Create index for faster lookups by language
CREATE INDEX idx_translations_language ON public.translations(language);
CREATE INDEX idx_translations_key ON public.translations(key);

-- Enable RLS
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Allow public read access (translations are public content)
CREATE POLICY "Translations are publicly readable" 
ON public.translations 
FOR SELECT 
USING (true);

-- Only admins can manage translations
CREATE POLICY "Admins can insert translations" 
ON public.translations 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update translations" 
ON public.translations 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete translations" 
ON public.translations 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updating updated_at
CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON public.translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();