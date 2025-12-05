-- Add profit column to investments table
ALTER TABLE public.investments ADD COLUMN IF NOT EXISTS profit_amount numeric NOT NULL DEFAULT 0;