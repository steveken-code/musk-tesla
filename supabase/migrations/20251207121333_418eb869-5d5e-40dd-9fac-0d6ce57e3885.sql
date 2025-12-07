-- Enable realtime for investments table
ALTER TABLE public.investments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investments;