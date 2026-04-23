-- ============================================
-- NUTRISEA - FINAL DATABASE SETUP
-- Integrated Functional Food & Nutrition Tracker
-- ============================================

-- 1. PROFILES (Extends Auth Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone TEXT DEFAULT '',
  date_of_birth DATE,
  gender TEXT DEFAULT '' CHECK (gender IN ('', 'Laki-laki', 'Perempuan')),
  allergy_info TEXT DEFAULT '',
  is_profile_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MEDICATIONS (Gummy Schedule)
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  instruction TEXT DEFAULT '',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  total_tablets INT DEFAULT 0,
  remaining_tablets INT DEFAULT 0,
  schedule_times TEXT[] DEFAULT '{"08:00"}',
  is_active BOOLEAN DEFAULT TRUE,
  prescribed_by UUID REFERENCES profiles(id),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COMPLIANCE_LOGS (Consumption History)
CREATE TABLE IF NOT EXISTS compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'taken' CHECK (status IN ('taken', 'missed', 'late')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SYMPTOM_LOGS / GROWTH TRACKER
CREATE TABLE IF NOT EXISTS symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  severity INT NOT NULL DEFAULT 5 CHECK (severity >= 1 AND severity <= 10),
  notes TEXT DEFAULT '',
  height DECIMAL(5,2), -- for growth tracking
  weight DECIMAL(5,2), -- for growth tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. QUIZ_QUESTIONS (Educational Content)
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_name TEXT DEFAULT 'Kuis Umum',
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct INT NOT NULL,
  explanation TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. EDUCATIONAL ARTICLES (Rich Content)
CREATE TABLE IF NOT EXISTS educational_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'umum',
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT TRUE,
  author_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_articles ENABLE ROW LEVEL SECURITY;

-- ... rest of policies ...
DROP POLICY IF EXISTS "Everyone view published articles" ON educational_articles;
CREATE POLICY "Everyone view published articles" ON educational_articles FOR SELECT USING (is_published = TRUE);
DROP POLICY IF EXISTS "Admins manage articles" ON educational_articles;
CREATE POLICY "Admins manage articles" ON educational_articles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Profiles: Own access + Admin access
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins view all profiles" ON profiles;
CREATE POLICY "Admins view all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Medications: Own access + Admin access
DROP POLICY IF EXISTS "Users view own meds" ON medications;
CREATE POLICY "Users view own meds" ON medications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage all meds" ON medications;
CREATE POLICY "Admins manage all meds" ON medications FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Logs: Own access + Admin access
DROP POLICY IF EXISTS "Users view/insert own logs" ON compliance_logs;
CREATE POLICY "Users view/insert own logs" ON compliance_logs FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own logs" ON compliance_logs;
CREATE POLICY "Users insert own logs" ON compliance_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all logs" ON compliance_logs;
CREATE POLICY "Admins view all logs" ON compliance_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Growth/Symptoms: Own access + Admin access
DROP POLICY IF EXISTS "Users manage own growth" ON symptom_logs;
CREATE POLICY "Users manage own growth" ON symptom_logs FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view growth" ON symptom_logs;
CREATE POLICY "Admins view growth" ON symptom_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Quiz: Everyone (authenticated) view active
DROP POLICY IF EXISTS "Everyone view active quiz" ON quiz_questions;
CREATE POLICY "Everyone view active quiz" ON quiz_questions FOR SELECT USING (is_active = TRUE);
DROP POLICY IF EXISTS "Admins manage quiz" ON quiz_questions;
CREATE POLICY "Admins manage quiz" ON quiz_questions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- TRIGGERS: Auto-create profile
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
