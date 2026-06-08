import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
  Supabase SQL — Run this in Supabase SQL Editor to create tables:

  -- Users table (extends Supabase Auth)
  CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Companies table
  CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Made optional for prototype
    name TEXT NOT NULL,
    industry TEXT,
    employee_count TEXT,
    monthly_revenue_range TEXT,
    tax_regime TEXT,
    main_expenses JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Transactions table
  CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Documents table
  CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT,
    file_type TEXT,
    document_type TEXT CHECK (document_type IN ('NAV levél', 'Számla', 'Szerződés', 'Egyéb')),
    analysis_result JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Tax profiles table
  CREATE TABLE IF NOT EXISTS public.tax_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    current_regime TEXT NOT NULL CHECK (current_regime IN ('KATA', 'Átalányadó', 'TAO', 'Nem tudom')),
    monthly_expense_range TEXT,
    vat_registered BOOLEAN DEFAULT FALSE,
    kata_eligible BOOLEAN DEFAULT TRUE,
    ai_recommendation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Enable RLS
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tax_profiles ENABLE ROW LEVEL SECURITY;

  -- RLS Policies
  CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

  CREATE POLICY "Users can manage own companies" ON public.companies FOR ALL USING (auth.uid() = user_id);

  CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

  CREATE POLICY "Users can manage own documents" ON public.documents FOR ALL
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

  CREATE POLICY "Users can manage own tax profiles" ON public.tax_profiles FOR ALL
    USING (company_id IN (SELECT id FROM public.companies WHERE user_id = auth.uid()));

  -- Indexes
  CREATE INDEX idx_companies_user_id ON public.companies(user_id);
  CREATE INDEX idx_transactions_company_id ON public.transactions(company_id);
  CREATE INDEX idx_transactions_date ON public.transactions(date);
  CREATE INDEX idx_documents_company_id ON public.documents(company_id);
  CREATE INDEX idx_tax_profiles_company_id ON public.tax_profiles(company_id);
*/
