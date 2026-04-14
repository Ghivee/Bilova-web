-- ============================================
-- BILOVA - Quiz Questions Table Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 6. QUIZ_QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options TEXT[] NOT NULL DEFAULT '{}',
  correct INT NOT NULL DEFAULT 0,
  explanation TEXT DEFAULT '',
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS for quiz_questions
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Everyone can read active questions
CREATE POLICY "Anyone can view active quiz questions" ON quiz_questions
  FOR SELECT USING (is_active = TRUE);

-- Admins can manage quiz questions
CREATE POLICY "Admins can manage quiz questions" ON quiz_questions
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Auto-update timestamp trigger
CREATE TRIGGER quiz_questions_updated_at
  BEFORE UPDATE ON quiz_questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FIX: Replace recursive admin profile policy
-- Run this to fix login hang issues
-- ============================================

-- Drop the recursive policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- New non-recursive policy using JWT metadata
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'superadmin'
  );

-- Insert policy for new profiles (needed for self-service creation)
CREATE POLICY IF NOT EXISTS "Allow profile self-insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
