-- ============================================
-- BILOVA - Pengingat Antibiotik Cerdas
-- Database Schema for Supabase (PostgreSQL)
-- ============================================

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with app-specific data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone TEXT DEFAULT '',
  date_of_birth DATE,
  gender TEXT DEFAULT '' CHECK (gender IN ('', 'Laki-laki', 'Perempuan')),
  allergy_info TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MEDICATIONS TABLE
-- Stores prescription/antibiotic data for each user
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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COMPLIANCE_LOGS TABLE
-- Records each time a user confirms taking medication
CREATE TABLE IF NOT EXISTS compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'taken' CHECK (status IN ('taken', 'missed', 'late')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SYMPTOM_LOGS TABLE
-- Records side effects / symptoms reported by users
CREATE TABLE IF NOT EXISTS symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  severity INT NOT NULL DEFAULT 5 CHECK (severity >= 1 AND severity <= 10),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EDUCATIONAL_ARTICLES TABLE
-- Stores educational content managed by admin
CREATE TABLE IF NOT EXISTS educational_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'umum',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_articles ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- MEDICATIONS policies
CREATE POLICY "Users can view own medications" ON medications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications" ON medications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all medications" ON medications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- COMPLIANCE_LOGS policies
CREATE POLICY "Users can view own compliance" ON compliance_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can log own compliance" ON compliance_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all compliance" ON compliance_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- SYMPTOM_LOGS policies
CREATE POLICY "Users can view own symptoms" ON symptom_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can log own symptoms" ON symptom_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all symptoms" ON symptom_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- EDUCATIONAL_ARTICLES policies (everyone can read published articles)
CREATE POLICY "Anyone can view published articles" ON educational_articles
  FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins can manage articles" ON educational_articles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TRIGGER: Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER articles_updated_at
  BEFORE UPDATE ON educational_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
