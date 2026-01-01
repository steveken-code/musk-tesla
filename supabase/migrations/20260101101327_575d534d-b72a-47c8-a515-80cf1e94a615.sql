-- Add CHECK constraints for numeric validation

-- Investments table constraints
ALTER TABLE public.investments 
  ADD CONSTRAINT check_investment_amount_min CHECK (amount >= 100),
  ADD CONSTRAINT check_investment_amount_max CHECK (amount <= 10000000),
  ADD CONSTRAINT check_profit_non_negative CHECK (profit_amount >= 0),
  ADD CONSTRAINT check_profit_reasonable CHECK (profit_amount <= amount * 100);

-- Withdrawals table constraints  
ALTER TABLE public.withdrawals
  ADD CONSTRAINT check_withdrawal_positive CHECK (amount > 0),
  ADD CONSTRAINT check_withdrawal_max CHECK (amount <= 10000000);

-- Create admin_settings table for storing configuration
CREATE TABLE public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view all settings" 
ON public.admin_settings 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert settings" 
ON public.admin_settings 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update settings
CREATE POLICY "Admins can update settings" 
ON public.admin_settings 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create admin_settings_history table for audit trail
CREATE TABLE public.admin_settings_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL,
  old_value jsonb,
  new_value jsonb NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on admin_settings_history
ALTER TABLE public.admin_settings_history ENABLE ROW LEVEL SECURITY;

-- Only admins can view history
CREATE POLICY "Admins can view settings history" 
ON public.admin_settings_history 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert history (done via trigger)
CREATE POLICY "Admins can insert history" 
ON public.admin_settings_history 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger function to log setting changes
CREATE OR REPLACE FUNCTION public.log_admin_setting_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.admin_settings_history (setting_key, old_value, new_value, changed_by)
    VALUES (NEW.setting_key, OLD.setting_value, NEW.setting_value, auth.uid());
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_settings_history (setting_key, old_value, new_value, changed_by)
    VALUES (NEW.setting_key, NULL, NEW.setting_value, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for admin_settings changes
CREATE TRIGGER admin_settings_audit_trigger
AFTER INSERT OR UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_setting_change();

-- Insert default payment settings
INSERT INTO public.admin_settings (setting_key, setting_value, updated_by)
VALUES 
  ('payment_settings', '{"cardNumber": "2200500174446743", "bankName": "СОВКОМБАНК (ДОМАШНИЙ БАНК)", "accountHolder": "ЕЛЬЧАНИНОВ ИГОРЬ СЕРГЕЕВИЧ"}'::jsonb, NULL),
  ('withdrawal_settings', '{"defaultHoldMessage": "Your withdrawal is currently being processed. Please contact support for more information."}'::jsonb, NULL);