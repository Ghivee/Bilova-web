-- ============================================
-- BILOVA COMPLETE MIGRATION
-- Jalankan satu per satu di Supabase SQL Editor
-- ============================================

-- ===== BAGIAN 1: TAMBAH KOLOM BARU =====
-- Tambah kolom schedule_times ke medications (kapan diminum)
ALTER TABLE medications ADD COLUMN IF NOT EXISTS schedule_times TEXT[] DEFAULT ARRAY['08:00'];
ALTER TABLE medications ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE medications ADD COLUMN IF NOT EXISTS prescribed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Tambah kolom is_profile_complete ke profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';

-- ===== BAGIAN 2: BUAT TABEL QUIZ_QUESTIONS =====
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct INTEGER NOT NULL DEFAULT 0,
  explanation TEXT DEFAULT '',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===== BAGIAN 3: BUAT TABEL DAILY_TIPS =====
CREATE TABLE IF NOT EXISTS daily_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  icon TEXT DEFAULT 'lightbulb',
  is_active BOOLEAN DEFAULT TRUE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Masukkan tip awal
INSERT INTO daily_tips (content, is_active) VALUES
  ('Pastikan Anda menyelesaikan seluruh siklus antibiotik meskipun gejala sudah mereda untuk mencegah resistensi bakteri.', TRUE),
  ('Minum antibiotik pada jam yang sama setiap hari untuk menjaga kadar obat yang efektif dalam tubuh Anda.', TRUE),
  ('Hindari mengonsumsi alkohol saat minum antibiotik karena dapat mengurangi efektivitas obat dan meningkatkan efek samping.', TRUE);

-- ===== BAGIAN 4: AKTIFKAN RLS =====
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

-- ===== BAGIAN 5: POLICIES QUIZ =====
DROP POLICY IF EXISTS "Anyone can view active quiz questions" ON quiz_questions;
CREATE POLICY "Anyone can view active quiz questions" ON quiz_questions
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;
CREATE POLICY "Admins can manage quiz questions" ON quiz_questions
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ===== BAGIAN 6: POLICIES DAILY_TIPS =====
DROP POLICY IF EXISTS "Anyone can view active tips" ON daily_tips;
CREATE POLICY "Anyone can view active tips" ON daily_tips
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage tips" ON daily_tips;
CREATE POLICY "Admins can manage tips" ON daily_tips
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ===== BAGIAN 7: PERBAIKI POLICY ADMIN PROFILES (Fix recursive hang) =====
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Self-insert untuk profil baru (jika trigger gagal)
DROP POLICY IF EXISTS "Allow profile self-insert" ON profiles;
CREATE POLICY "Allow profile self-insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===== BAGIAN 8: POLICY ADMIN MEDICATIONS (admin bisa insert untuk user) =====
DROP POLICY IF EXISTS "Admins can manage all medications" ON medications;
CREATE POLICY "Admins can manage all medications" ON medications
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ===== BAGIAN 9: TRIGGER UPDATE_AT UNTUK MEDICATION =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS medications_updated_at ON medications;
CREATE TRIGGER medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS quiz_questions_updated_at ON quiz_questions;
CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
