-- =============================================
-- CRM IMOBILIÁRIO - ESTRUTURA COMPLETA DO BANCO
-- =============================================

-- 1. ENUM TYPES
-- =============================================

-- Roles do sistema
CREATE TYPE public.app_role AS ENUM ('master', 'gerente', 'corretor', 'call_center', 'estagiario');

-- Departamentos
CREATE TYPE public.department AS ENUM ('vendas', 'locacao', 'ambos');

-- Status de imóveis
CREATE TYPE public.property_status AS ENUM ('disponivel', 'vendido', 'locado', 'reservado', 'inativo');

-- Finalidade do imóvel
CREATE TYPE public.property_purpose AS ENUM ('venda', 'locacao', 'ambos');

-- Tipo de garantia locatícia
CREATE TYPE public.guarantee_type AS ENUM ('caucao', 'fiador', 'seguro_fianca', 'titulo_capitalizacao');

-- Status de contrato
CREATE TYPE public.rental_status AS ENUM ('ativo', 'encerrado', 'rescindido', 'renovado');

-- Status de lead
CREATE TYPE public.lead_status AS ENUM ('novo', 'em_atendimento', 'qualificado', 'proposta', 'fechado', 'perdido');

-- Status de parcela
CREATE TYPE public.installment_status AS ENUM ('pendente', 'pago', 'atrasado', 'cancelado');

-- Tipo de parte no contrato
CREATE TYPE public.party_type AS ENUM ('locador', 'locatario', 'fiador');

-- 2. TABELAS CORE
-- =============================================

-- Imobiliárias
CREATE TABLE public.real_estates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Filiais/Unidades
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id UUID REFERENCES public.real_estates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  phone TEXT,
  email TEXT,
  is_main BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  real_estate_id UUID REFERENCES public.real_estates(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cpf TEXT,
  department public.department DEFAULT 'ambos',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roles de usuários (TABELA SEPARADA - SEGURANÇA!)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. TABELAS DE IMÓVEIS
-- =============================================

-- Tipos de imóveis
CREATE TABLE public.property_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir tipos padrão
INSERT INTO public.property_types (name, description) VALUES
  ('Apartamento', 'Unidade habitacional em edifício'),
  ('Casa', 'Imóvel residencial individual'),
  ('Comercial', 'Imóvel para fins comerciais'),
  ('Terreno', 'Lote ou terreno');

-- Imóveis
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id UUID REFERENCES public.real_estates(id) ON DELETE CASCADE NOT NULL,
  property_type_id UUID REFERENCES public.property_types(id) ON DELETE SET NULL,
  code TEXT,
  title TEXT NOT NULL,
  description TEXT,
  purpose public.property_purpose NOT NULL DEFAULT 'ambos',
  status public.property_status NOT NULL DEFAULT 'disponivel',
  -- Endereço
  address TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  -- Características
  area_total DECIMAL(10, 2),
  area_util DECIMAL(10, 2),
  bedrooms INTEGER DEFAULT 0,
  suites INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  parking_spaces INTEGER DEFAULT 0,
  -- Valores
  sale_price DECIMAL(15, 2),
  rent_price DECIMAL(15, 2),
  condominium_fee DECIMAL(10, 2),
  iptu DECIMAL(10, 2),
  -- Relacionamentos
  condominium_id UUID,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  -- Controle
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fotos de imóveis
CREATE TABLE public.property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  is_cover BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documentos de imóveis
CREATE TABLE public.property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABELAS DE LOCAÇÃO
-- =============================================

-- Contratos de locação
CREATE TABLE public.rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id UUID REFERENCES public.real_estates(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  code TEXT,
  -- Datas
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  -- Valores
  rent_value DECIMAL(15, 2) NOT NULL,
  condominium_fee DECIMAL(10, 2) DEFAULT 0,
  iptu DECIMAL(10, 2) DEFAULT 0,
  -- Garantia
  guarantee_type public.guarantee_type,
  guarantee_value DECIMAL(15, 2),
  guarantee_description TEXT,
  -- Reajuste
  adjustment_index TEXT DEFAULT 'IGPM',
  adjustment_month INTEGER DEFAULT 1,
  -- Status
  status public.rental_status NOT NULL DEFAULT 'ativo',
  notes TEXT,
  -- Controle
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Partes do contrato (locador, locatário, fiador)
CREATE TABLE public.rental_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID REFERENCES public.rentals(id) ON DELETE CASCADE NOT NULL,
  party_type public.party_type NOT NULL,
  name TEXT NOT NULL,
  cpf_cnpj TEXT,
  rg TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mensalidades/Parcelas
CREATE TABLE public.rental_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID REFERENCES public.rentals(id) ON DELETE CASCADE NOT NULL,
  reference_month DATE NOT NULL,
  due_date DATE NOT NULL,
  -- Valores
  rent_value DECIMAL(15, 2) NOT NULL,
  condominium_fee DECIMAL(10, 2) DEFAULT 0,
  iptu DECIMAL(10, 2) DEFAULT 0,
  other_charges DECIMAL(10, 2) DEFAULT 0,
  discount DECIMAL(10, 2) DEFAULT 0,
  late_fee DECIMAL(10, 2) DEFAULT 0,
  total_value DECIMAL(15, 2) NOT NULL,
  -- Pagamento
  payment_date DATE,
  paid_value DECIMAL(15, 2),
  status public.installment_status NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABELAS DE CRM
-- =============================================

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id UUID REFERENCES public.real_estates(id) ON DELETE CASCADE NOT NULL,
  -- Dados do lead
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT,
  -- Interesse
  interest_type public.property_purpose,
  property_type_id UUID REFERENCES public.property_types(id) ON DELETE SET NULL,
  budget_min DECIMAL(15, 2),
  budget_max DECIMAL(15, 2),
  preferred_neighborhoods TEXT,
  notes TEXT,
  -- Status
  status public.lead_status NOT NULL DEFAULT 'novo',
  -- Atribuição
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Controle
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Propostas
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id UUID REFERENCES public.real_estates(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  -- Valores
  proposed_value DECIMAL(15, 2) NOT NULL,
  counter_value DECIMAL(15, 2),
  -- Status
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  -- Controle
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atendimentos ao cliente (FAC)
CREATE TABLE public.customer_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id UUID REFERENCES public.real_estates(id) ON DELETE CASCADE NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  rental_id UUID REFERENCES public.rentals(id) ON DELETE SET NULL,
  -- Dados
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'aberto',
  priority TEXT DEFAULT 'normal',
  -- Atribuição
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Controle
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TABELAS DE APOIO
-- =============================================

-- Condomínios
CREATE TABLE public.condominiums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  real_estate_id UUID REFERENCES public.real_estates(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  total_units INTEGER,
  total_floors INTEGER,
  year_built INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar FK em properties
ALTER TABLE public.properties 
ADD CONSTRAINT fk_property_condominium 
FOREIGN KEY (condominium_id) REFERENCES public.condominiums(id) ON DELETE SET NULL;

-- Amenidades de condomínios
CREATE TABLE public.condominium_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominium_id UUID REFERENCES public.condominiums(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. FUNÇÕES AUXILIARES
-- =============================================

-- Função para verificar role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
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

-- Função para obter real_estate_id do usuário
CREATE OR REPLACE FUNCTION public.get_user_real_estate_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT real_estate_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Função para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. TRIGGERS
-- =============================================

-- Trigger para criar profile automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers de updated_at
CREATE TRIGGER update_real_estates_updated_at BEFORE UPDATE ON public.real_estates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rentals_updated_at BEFORE UPDATE ON public.rentals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rental_installments_updated_at BEFORE UPDATE ON public.rental_installments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_services_updated_at BEFORE UPDATE ON public.customer_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_condominiums_updated_at BEFORE UPDATE ON public.condominiums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. ROW LEVEL SECURITY
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.real_estates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.condominium_amenities ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE RLS

-- Property Types (público para leitura)
CREATE POLICY "Property types are viewable by authenticated users"
ON public.property_types FOR SELECT TO authenticated USING (true);

-- Profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Masters and managers can view all profiles in their real_estate"
ON public.profiles FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'master') 
  OR (public.has_role(auth.uid(), 'gerente') AND real_estate_id = public.get_user_real_estate_id(auth.uid()))
);

-- User Roles (somente leitura para usuários normais)
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Masters can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'));

-- Real Estates
CREATE POLICY "Users can view their real_estate"
ON public.real_estates FOR SELECT TO authenticated
USING (id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Masters can manage real_estates"
ON public.real_estates FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'master'));

-- Units
CREATE POLICY "Users can view units of their real_estate"
ON public.units FOR SELECT TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Masters and managers can manage units"
ON public.units FOR ALL TO authenticated
USING (
  public.has_role(auth.uid(), 'master') 
  OR (public.has_role(auth.uid(), 'gerente') AND real_estate_id = public.get_user_real_estate_id(auth.uid()))
);

-- Properties
CREATE POLICY "Users can view properties of their real_estate"
ON public.properties FOR SELECT TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can insert properties"
ON public.properties FOR INSERT TO authenticated
WITH CHECK (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can update properties of their real_estate"
ON public.properties FOR UPDATE TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Masters and managers can delete properties"
ON public.properties FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'master') 
  OR (public.has_role(auth.uid(), 'gerente') AND real_estate_id = public.get_user_real_estate_id(auth.uid()))
);

-- Property Photos
CREATE POLICY "Users can view property photos"
ON public.property_photos FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_id 
    AND p.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

CREATE POLICY "Users can manage property photos"
ON public.property_photos FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_id 
    AND p.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

-- Property Documents
CREATE POLICY "Users can view property documents"
ON public.property_documents FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_id 
    AND p.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

CREATE POLICY "Users can manage property documents"
ON public.property_documents FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.properties p 
    WHERE p.id = property_id 
    AND p.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

-- Rentals
CREATE POLICY "Users can view rentals of their real_estate"
ON public.rentals FOR SELECT TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can insert rentals"
ON public.rentals FOR INSERT TO authenticated
WITH CHECK (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can update rentals of their real_estate"
ON public.rentals FOR UPDATE TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Masters and managers can delete rentals"
ON public.rentals FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'master') 
  OR (public.has_role(auth.uid(), 'gerente') AND real_estate_id = public.get_user_real_estate_id(auth.uid()))
);

-- Rental Parties
CREATE POLICY "Users can view rental parties"
ON public.rental_parties FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rentals r 
    WHERE r.id = rental_id 
    AND r.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

CREATE POLICY "Users can manage rental parties"
ON public.rental_parties FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rentals r 
    WHERE r.id = rental_id 
    AND r.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

-- Rental Installments
CREATE POLICY "Users can view rental installments"
ON public.rental_installments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rentals r 
    WHERE r.id = rental_id 
    AND r.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

CREATE POLICY "Users can manage rental installments"
ON public.rental_installments FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rentals r 
    WHERE r.id = rental_id 
    AND r.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

-- Leads
CREATE POLICY "Users can view leads of their real_estate"
ON public.leads FOR SELECT TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can insert leads"
ON public.leads FOR INSERT TO authenticated
WITH CHECK (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can update leads of their real_estate"
ON public.leads FOR UPDATE TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Masters and managers can delete leads"
ON public.leads FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'master') 
  OR (public.has_role(auth.uid(), 'gerente') AND real_estate_id = public.get_user_real_estate_id(auth.uid()))
);

-- Proposals
CREATE POLICY "Users can view proposals of their real_estate"
ON public.proposals FOR SELECT TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can insert proposals"
ON public.proposals FOR INSERT TO authenticated
WITH CHECK (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can update proposals of their real_estate"
ON public.proposals FOR UPDATE TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Masters and managers can delete proposals"
ON public.proposals FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'master') 
  OR (public.has_role(auth.uid(), 'gerente') AND real_estate_id = public.get_user_real_estate_id(auth.uid()))
);

-- Customer Services
CREATE POLICY "Users can view customer_services of their real_estate"
ON public.customer_services FOR SELECT TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can insert customer_services"
ON public.customer_services FOR INSERT TO authenticated
WITH CHECK (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can update customer_services of their real_estate"
ON public.customer_services FOR UPDATE TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Masters and managers can delete customer_services"
ON public.customer_services FOR DELETE TO authenticated
USING (
  public.has_role(auth.uid(), 'master') 
  OR (public.has_role(auth.uid(), 'gerente') AND real_estate_id = public.get_user_real_estate_id(auth.uid()))
);

-- Condominiums
CREATE POLICY "Users can view condominiums of their real_estate"
ON public.condominiums FOR SELECT TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

CREATE POLICY "Users can manage condominiums"
ON public.condominiums FOR ALL TO authenticated
USING (real_estate_id = public.get_user_real_estate_id(auth.uid()));

-- Condominium Amenities
CREATE POLICY "Users can view condominium amenities"
ON public.condominium_amenities FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.condominiums c 
    WHERE c.id = condominium_id 
    AND c.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);

CREATE POLICY "Users can manage condominium amenities"
ON public.condominium_amenities FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.condominiums c 
    WHERE c.id = condominium_id 
    AND c.real_estate_id = public.get_user_real_estate_id(auth.uid())
  )
);