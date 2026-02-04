-- Add restrictive policy to block anonymous access to profiles table
-- This prevents unauthenticated users from querying any profile data
CREATE POLICY "Block anonymous access to profiles" 
ON profiles 
AS RESTRICTIVE 
FOR ALL
USING (auth.uid() IS NOT NULL);