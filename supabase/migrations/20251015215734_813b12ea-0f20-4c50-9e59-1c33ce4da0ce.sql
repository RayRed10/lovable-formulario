-- Create leads table for roofing leads
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  email text NOT NULL UNIQUE,
  telephone text NOT NULL,
  type_travaux text NOT NULL CHECK (type_travaux IN ('Réparation', 'Installation', 'Maintenance')),
  surface integer NOT NULL CHECK (surface >= 10),
  localisation text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'nouveau' CHECK (status IN ('nouveau', 'répondu', 'chaud')),
  ouvert text NOT NULL DEFAULT 'non' CHECK (ouvert IN ('oui', 'non')),
  clique text NOT NULL DEFAULT 'non' CHECK (clique IN ('oui', 'non')),
  devis_estimatif text,
  lead_chaud text NOT NULL DEFAULT 'non' CHECK (lead_chaud IN ('oui', 'non'))
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to select all leads
CREATE POLICY "Authenticated users can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);

-- RLS Policy: Allow authenticated users to insert leads
CREATE POLICY "Authenticated users can insert leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);

-- RLS Policy: Allow authenticated users to update leads
CREATE POLICY "Authenticated users can update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (true);

-- Create indexes for fast queries
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_timestamp ON public.leads(timestamp DESC);