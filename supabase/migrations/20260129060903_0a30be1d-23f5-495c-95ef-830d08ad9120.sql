-- Remove the profit cap constraint to allow unlimited profit amounts
ALTER TABLE public.investments DROP CONSTRAINT check_profit_reasonable;