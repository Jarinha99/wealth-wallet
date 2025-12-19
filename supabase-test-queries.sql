-- ============================================
-- Test Queries for WealthWallet Database
-- Run these after setting up the tables to verify everything works
-- ============================================

-- 1. Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('transactions', 'budgets', 'profiles')
ORDER BY table_name;

-- 2. Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'budgets', 'profiles');

-- 3. Check all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('transactions', 'budgets', 'profiles')
ORDER BY tablename, policyname;

-- 4. Check indexes
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('transactions', 'budgets', 'profiles')
ORDER BY tablename, indexname;

-- 5. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'transactions'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'budgets'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- Sample Data Insert (for testing - requires authenticated user)
-- ============================================
-- Note: These will only work when executed by an authenticated user
-- through your application, not directly in the SQL editor
-- (due to RLS policies)

-- Example transaction insert (run from your app with authenticated user):
-- INSERT INTO transactions (user_id, type, amount, category, date, notes)
-- VALUES (
--   auth.uid(),  -- Current authenticated user
--   'expense',
--   50.00,
--   'food',
--   CURRENT_DATE,
--   'Grocery shopping'
-- );

-- Example budget insert (run from your app with authenticated user):
-- INSERT INTO budgets (user_id, category, amount, period)
-- VALUES (
--   auth.uid(),  -- Current authenticated user
--   'food',
--   500.00,
--   'monthly'
-- );

-- Example profile insert (run from your app with authenticated user):
-- INSERT INTO profiles (user_id, username, full_name)
-- VALUES (
--   auth.uid(),  -- Current authenticated user
--   'johndoe',
--   'John Doe'
-- );

