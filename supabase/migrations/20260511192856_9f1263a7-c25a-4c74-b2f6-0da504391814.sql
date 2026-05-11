-- Role enum
CREATE TYPE public.user_role AS ENUM ('personal', 'advisor');

-- Add role + advisor fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN role public.user_role NOT NULL DEFAULT 'personal',
  ADD COLUMN business_name text,
  ADD COLUMN role_title text,
  ADD COLUMN phone text,
  ADD COLUMN expected_clients integer,
  ADD COLUMN monthly_budget numeric;

-- Update handle_new_user to read role from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, business_name, role_title, phone, expected_clients, monthly_budget)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'personal'),
    NEW.raw_user_meta_data->>'business_name',
    NEW.raw_user_meta_data->>'role_title',
    NEW.raw_user_meta_data->>'phone',
    NULLIF(NEW.raw_user_meta_data->>'expected_clients','')::int,
    NULLIF(NEW.raw_user_meta_data->>'monthly_budget','')::numeric
  );
  RETURN NEW;
END;
$function$;

-- Make sure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- advisor_clients
CREATE TABLE public.advisor_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  client_id uuid NOT NULL,
  permission_level text NOT NULL DEFAULT 'view_recommendations',
  status text NOT NULL DEFAULT 'active',
  connected_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (advisor_id, client_id)
);
ALTER TABLE public.advisor_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisor sees own connections" ON public.advisor_clients
  FOR SELECT USING (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "Advisor inserts connections" ON public.advisor_clients
  FOR INSERT WITH CHECK (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "Either side updates connection" ON public.advisor_clients
  FOR UPDATE USING (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "Either side deletes connection" ON public.advisor_clients
  FOR DELETE USING (auth.uid() = advisor_id OR auth.uid() = client_id);

-- helper function to check advisor-client connection
CREATE OR REPLACE FUNCTION public.is_advisor_of(_advisor uuid, _client uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.advisor_clients
    WHERE advisor_id = _advisor AND client_id = _client AND status = 'active'
  );
$$;

-- Allow advisors to read clients' financial data
CREATE POLICY "Advisor views client expenses" ON public.expenses
  FOR SELECT USING (public.is_advisor_of(auth.uid(), user_id));
CREATE POLICY "Advisor views client budgets" ON public.budgets
  FOR SELECT USING (public.is_advisor_of(auth.uid(), user_id));
CREATE POLICY "Advisor views client profile" ON public.profiles
  FOR SELECT USING (public.is_advisor_of(auth.uid(), id));

-- recommendations
CREATE TABLE public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  client_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  category text,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Advisor and client view recs" ON public.recommendations
  FOR SELECT USING (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "Advisor inserts recs" ON public.recommendations
  FOR INSERT WITH CHECK (auth.uid() = advisor_id);
CREATE POLICY "Advisor updates recs" ON public.recommendations
  FOR UPDATE USING (auth.uid() = advisor_id OR auth.uid() = client_id);
CREATE POLICY "Advisor deletes recs" ON public.recommendations
  FOR DELETE USING (auth.uid() = advisor_id);

-- advisor_notes (private to advisor)
CREATE TABLE public.advisor_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  client_id uuid NOT NULL,
  note_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisor manages own notes" ON public.advisor_notes
  FOR ALL USING (auth.uid() = advisor_id) WITH CHECK (auth.uid() = advisor_id);

-- client_invitations
CREATE TABLE public.client_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  client_email text NOT NULL,
  client_name text,
  message text,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Advisor manages own invitations" ON public.client_invitations
  FOR ALL USING (auth.uid() = advisor_id) WITH CHECK (auth.uid() = advisor_id);

CREATE TRIGGER recommendations_updated_at
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();