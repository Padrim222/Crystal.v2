-- Add missing RLS policies for purchases table to prevent unauthorized access

-- Add INSERT policy - only allow users to create purchases for themselves
-- This is important for payment security
CREATE POLICY "Users can insert their own purchases" 
ON public.purchases 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Add UPDATE policy - prevent users from modifying purchase records
-- Purchase records should be immutable for audit purposes
CREATE POLICY "Prevent purchase modifications" 
ON public.purchases 
FOR UPDATE 
USING (false);

-- Add DELETE policy - prevent users from deleting purchase records  
-- Purchase records must be preserved for financial compliance
CREATE POLICY "Prevent purchase deletions" 
ON public.purchases 
FOR DELETE 
USING (false);