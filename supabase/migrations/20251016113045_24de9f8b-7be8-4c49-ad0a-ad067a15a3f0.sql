-- Fix role bootstrap problem: Allow trigger to insert initial viewer role
-- Drop existing restrictive insert policy
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;

-- Create permissive policy for the trigger function (security definer)
CREATE POLICY "System can assign initial roles"
ON public.user_roles
FOR INSERT
WITH CHECK (
  -- Allow inserts from the trigger (runs as security definer)
  auth.uid() IS NULL OR
  -- Or allow admins to insert roles
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Ensure the handle_new_user_role function has proper security settings
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'viewer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN new;
END;
$$;

-- Add comment to explain the security model
COMMENT ON POLICY "System can assign initial roles" ON public.user_roles IS 
  'Allows the trigger function to assign initial viewer role to new users. The trigger runs with SECURITY DEFINER privileges to bypass RLS for initial setup.';