-- ==========================================
-- SCRIPT DE VÉRIFICATION SUPABASE COMPLÈTE
-- À EXÉCUTER DANS SQL EDITOR SUPABASE
-- ==========================================

-- 1️⃣ VÉRIFIER QUE LA TABLE user_push_tokens EXISTE ET A LA BONNE STRUCTURE
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_push_tokens'
ORDER BY ordinal_position;

-- Résultat attendu:
-- device_id     | text      | NO
-- push_token    | text      | YES
-- user_id       | uuid      | YES
-- platform      | text      | YES (DEFAULT 'ios')
-- created_at    | timestamp | YES
-- updated_at    | timestamp | YES

-- ==========================================

-- 2️⃣ VÉRIFIER QUE LA TABLE push_debug_logs EXISTE ET A LA BONNE STRUCTURE
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'push_debug_logs'
ORDER BY ordinal_position;

-- Résultat attendu:
-- id             | uuid      | NO
-- device_id      | text      | YES
-- ts             | timestamp | YES
-- stage          | text      | YES
-- is_device      | boolean   | YES
-- project_id     | text      | YES
-- token          | text      | YES
-- error          | jsonb     | YES
-- platform       | text      | YES
-- attempt_number | integer   | YES

-- ==========================================

-- 3️⃣ VÉRIFIER LES POLICIES RLS SUR user_push_tokens
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
WHERE tablename = 'user_push_tokens';

-- Résultat attendu: Au moins une policy permettant INSERT/UPDATE public

-- ==========================================

-- 4️⃣ VÉRIFIER LES POLICIES RLS SUR push_debug_logs
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
WHERE tablename = 'push_debug_logs';

-- Résultat attendu: Policies "Allow public insert" et "Allow public select"

-- ==========================================

-- 5️⃣ VÉRIFIER QUE RLS EST ACTIVÉ
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename IN ('user_push_tokens', 'push_debug_logs');

-- Résultat attendu: rowsecurity = true pour les deux tables

-- ==========================================

-- 6️⃣ TESTER UN INSERT DANS push_debug_logs
INSERT INTO push_debug_logs (
  device_id,
  stage,
  platform,
  project_id
) VALUES (
  'test-device-verification',
  'verification-test',
  'android',
  '72f67e44-ecbe-4df7-95c9-f00dd7204d90'
);

-- Si ça échoue: les policies RLS bloquent les inserts anonymes

-- ==========================================

-- 7️⃣ VÉRIFIER QU'ON PEUT LIRE push_debug_logs
SELECT * FROM push_debug_logs 
WHERE device_id = 'test-device-verification'
LIMIT 1;

-- Si ça échoue: les policies RLS bloquent les selects anonymes

-- ==========================================

-- 8️⃣ NETTOYER LE TEST
DELETE FROM push_debug_logs 
WHERE device_id = 'test-device-verification';

-- ==========================================

-- 9️⃣ VÉRIFIER LA FONCTION send_push_notification (SI ELLE EXISTE)
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'send_push_notification';

-- Résultat attendu: 1 ligne si la fonction existe

-- ==========================================

-- 🔟 VÉRIFIER LES TOKENS EXISTANTS
SELECT 
  platform,
  COUNT(*) as count,
  MAX(updated_at) as derniere_maj
FROM user_push_tokens
GROUP BY platform;

-- Résultat attendu:
-- ios     | 73  | 2026-03-XX
-- android | 0   | NULL  (pour l'instant)

-- ==========================================
-- FIN DU SCRIPT DE VÉRIFICATION
-- ==========================================
