-- PASO 1: Crear tabla user_roles con RBAC
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sales_rep', 'viewer')) DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS en user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para user_roles
CREATE POLICY "Users can view own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Crear función helper para verificar roles (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- PASO 2: Agregar columna assigned_to a leads
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- PASO 3: Actualizar políticas RLS de leads (reemplazar con RBAC)
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can update leads" ON public.leads;

-- Nuevas políticas basadas en roles
CREATE POLICY "Admins can view all leads" 
ON public.leads 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sales reps can view own leads" 
ON public.leads 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'sales_rep') AND 
  (assigned_to = auth.uid() OR assigned_to IS NULL)
);

CREATE POLICY "Viewers can view unassigned leads" 
ON public.leads 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'viewer') AND 
  assigned_to IS NULL
);

CREATE POLICY "Admins and sales reps can insert leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'sales_rep')
);

CREATE POLICY "Admins can update all leads" 
ON public.leads 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sales reps can update own leads" 
ON public.leads 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'sales_rep') AND 
  assigned_to = auth.uid()
);

-- PASO 4: Agregar política DELETE
CREATE POLICY "Admins can delete leads" 
ON public.leads 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para asignar rol 'viewer' automáticamente a nuevos usuarios
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

CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();