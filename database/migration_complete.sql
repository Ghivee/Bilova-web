-- ============================================
-- BILOVA COMPLETE MIGRATION v2
-- Jalankan sekali di Supabase SQL Editor
-- ============================================

-- ===== BAGIAN 1: TAMBAH KOLOM BARU =====
ALTER TABLE medications ADD COLUMN IF NOT EXISTS schedule_times TEXT[] DEFAULT ARRAY['08:00'];
ALTER TABLE medications ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE medications ADD COLUMN IF NOT EXISTS prescribed_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';

-- ===== BAGIAN 2: TABEL QUIZ_QUESTIONS =====
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

-- ===== BAGIAN 3: TABEL DAILY_TIPS =====
CREATE TABLE IF NOT EXISTS daily_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  icon TEXT DEFAULT 'lightbulb',
  is_active BOOLEAN DEFAULT TRUE,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed tips (hanya jika kosong)
INSERT INTO daily_tips (content, is_active)
SELECT * FROM (VALUES
  ('Pastikan Anda menyelesaikan seluruh siklus antibiotik meskipun gejala sudah mereda untuk mencegah resistensi bakteri.', TRUE),
  ('Minum antibiotik pada jam yang sama setiap hari untuk menjaga kadar obat yang efektif dalam tubuh Anda.', TRUE),
  ('Hindari mengonsumsi alkohol saat minum antibiotik karena dapat mengurangi efektivitas obat dan meningkatkan efek samping.', TRUE)
) AS seed(content, is_active)
WHERE NOT EXISTS (SELECT 1 FROM daily_tips LIMIT 1);

-- Seed kuis (hanya jika kosong)
INSERT INTO quiz_questions (question, options, correct, explanation)
SELECT * FROM (VALUES
  (
    'Mengapa antibiotik harus dihabiskan meskipun sudah merasa sembuh?',
    '["Agar tidak boros", "Mencegah resistansi bakteri", "Menambah nafsu makan", "Mempercepat pemulihan"]'::jsonb,
    1,
    'Menghentikan antibiotik lebih awal dapat membuat bakteri sisa menjadi kebal (resisten) terhadap antibiotik.'
  ),
  (
    'Apa kepanjangan AMR?',
    '["Antibiotic Medicine Resistance", "Antimicrobial Resistance", "Advanced Medical Research", "Antibiotic Medical Review"]'::jsonb,
    1,
    'AMR = Antimicrobial Resistance, yaitu resistansi terhadap obat antimikroba termasuk antibiotik.'
  ),
  (
    'Gejala apa yang paling berbahaya saat mengonsumsi antibiotik?',
    '["Sedikit mual", "Mengantuk ringan", "Sesak napas dan bengkak wajah", "Nafsu makan berkurang"]'::jsonb,
    2,
    'Sesak napas dan bengkak wajah/tenggorokan menandakan reaksi alergi serius yang membutuhkan penanganan darurat.'
  )
) AS seed(question, options, correct, explanation)
WHERE NOT EXISTS (SELECT 1 FROM quiz_questions LIMIT 1);

-- ===== BAGIAN 4: AKTIFKAN RLS =====
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tips ENABLE ROW LEVEL SECURITY;

-- ===== BAGIAN 5: POLICIES QUIZ =====
DROP POLICY IF EXISTS "Anyone can view active quiz questions" ON quiz_questions;
CREATE POLICY "Anyone can view active quiz questions" ON quiz_questions
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;
CREATE POLICY "Admins can manage quiz questions" ON quiz_questions
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- ===== BAGIAN 6: POLICIES DAILY_TIPS =====
DROP POLICY IF EXISTS "Anyone can view active tips" ON daily_tips;
CREATE POLICY "Anyone can view active tips" ON daily_tips
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can manage tips" ON daily_tips;
CREATE POLICY "Admins can manage tips" ON daily_tips
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'superadmin'))
  );

-- ===== BAGIAN 7: FIX PROFILES POLICY (mencegah hang rekursif) =====
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow profile self-insert" ON profiles;
CREATE POLICY "Allow profile self-insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===== BAGIAN 8: MEDICATIONS — ADMIN BISA KELOLA UNTUK USER LAIN =====
DROP POLICY IF EXISTS "Admins can manage all medications" ON medications;
CREATE POLICY "Admins can manage all medications" ON medications
  FOR ALL USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ===== BAGIAN 9: COMPLIANCE & SYMPTOM LOGS — ADMIN BISA LIHAT =====
DROP POLICY IF EXISTS "Admins can view all compliance logs" ON compliance_logs;
CREATE POLICY "Admins can view all compliance logs" ON compliance_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

DROP POLICY IF EXISTS "Admins can view all symptom logs" ON symptom_logs;
CREATE POLICY "Admins can view all symptom logs" ON symptom_logs
  FOR SELECT USING (
    user_id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
  );

-- ===== BAGIAN 10: TRIGGER UPDATED_AT =====
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
