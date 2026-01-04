-- Add CHECK constraints to withdrawals table for data validation

-- Ensure amount is positive and within reasonable limits
ALTER TABLE public.withdrawals
ADD CONSTRAINT withdrawals_amount_positive 
  CHECK (amount > 0 AND amount <= 1000000);

-- Ensure country is a valid 2-letter country code
ALTER TABLE public.withdrawals
ADD CONSTRAINT withdrawals_country_valid
  CHECK (country ~ '^[A-Z]{2}$');

-- Ensure payment_details has a reasonable length
ALTER TABLE public.withdrawals
ADD CONSTRAINT withdrawals_payment_details_length
  CHECK (length(payment_details) > 0 AND length(payment_details) <= 500);