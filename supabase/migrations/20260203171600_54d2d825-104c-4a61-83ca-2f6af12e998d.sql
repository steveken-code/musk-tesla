-- Create kyc_verifications table for tracking identity verification workflow
CREATE TABLE public.kyc_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  withdrawal_id UUID NOT NULL REFERENCES public.withdrawals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT,
  bank_country TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  account_number TEXT,
  tax_id TEXT,
  tax_id_type TEXT,
  document_url TEXT,
  document_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending_kyc',
  net_amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  admin_notes TEXT,
  kyc_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kyc_verifications
CREATE POLICY "Users can view own KYC verifications"
ON public.kyc_verifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all KYC verifications"
ON public.kyc_verifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert KYC verifications"
ON public.kyc_verifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all KYC verifications"
ON public.kyc_verifications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update own KYC document submission"
ON public.kyc_verifications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending_kyc');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_kyc_verifications_updated_at
BEFORE UPDATE ON public.kyc_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create private storage bucket for KYC documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents', 
  'kyc-documents', 
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
);

-- Storage policies for kyc-documents bucket
CREATE POLICY "Users can upload own KYC documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all KYC documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'kyc-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete KYC documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'kyc-documents' 
  AND has_role(auth.uid(), 'admin'::app_role)
);