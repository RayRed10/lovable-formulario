-- Fix RLS policies to allow viewers to see all leads (not just unassigned)
DROP POLICY IF EXISTS "Viewers can view unassigned leads" ON public.leads;

-- Allow viewers to see all leads
CREATE POLICY "Viewers can view all leads"
ON public.leads
FOR SELECT
USING (
  has_role(auth.uid(), 'viewer'::text)
);

-- Update sales rep policy to also see all leads (not just assigned ones)
DROP POLICY IF EXISTS "Sales reps can view own leads" ON public.leads;

CREATE POLICY "Sales reps can view all leads"
ON public.leads
FOR SELECT
USING (
  has_role(auth.uid(), 'sales_rep'::text)
);