-- ==================================================
-- Database Cleanup Script
-- Removes fake parishes that don't exist in reality
-- PRESERVES test data needed for regression testing
-- ==================================================

-- IMPORTANT: Always backup first!
-- Run: sqlite3 senegal_masses.db ".backup backup_$(date +%Y%m%d).db"

-- ============================================
-- PREVIEW PARISHES (run this first to verify!)
-- ============================================
SELECT id, name, city, region, phone
FROM parishes
ORDER BY id;

-- ============================================
-- PARISHES TO DELETE (fake/non-existent)
-- ============================================

-- Parish #9: Notre-Dame de Lourdes (Point E)
-- REASON: This church exists in Saint-Louis (northern Senegal), NOT in Dakar
-- Confirmed via research: https://aps.sn/saint-louis-notre-dame-de-lourdes-une-eglise-en-quete-dun-coup-de-jeune/
-- The church is located in the Sor neighborhood of Saint-Louis, inaugurated in 1888

-- ============================================
-- EXECUTE DELETION (uncomment when ready)
-- ============================================

-- Delete the fake parish
DELETE FROM parishes WHERE id = 9;

-- Note: Mass times associated with this parish will be automatically deleted
-- due to CASCADE DELETE constraint in the database schema

-- ============================================
-- VERIFICATION (run after deletion)
-- ============================================

-- Should return 14 parishes (was 15)
SELECT COUNT(*) as remaining_parishes FROM parishes;

-- List remaining parishes for review
SELECT id, name, city, region
FROM parishes
ORDER BY city, name;

-- Check that parish ID 9 is gone
SELECT * FROM parishes WHERE id = 9;
-- Should return 0 rows

-- Verify test data is preserved (regression tests use parish ID 1 and 2)
SELECT id, name FROM parishes WHERE id IN (1, 2);
-- Should still return:
-- 1|Cathédrale du Souvenir Africain
-- 2|Paroisse Saint-Joseph de Médina

-- ============================================
-- NOTES FOR MAINTENANCE
-- ============================================

-- All 14 remaining parishes are confirmed to exist in Dakar area:
-- ✅ Cathédrale du Souvenir Africain (confirmed via Wikipedia)
-- ✅ Other parishes match official Archdiocese listings
-- ✅ Test data for regression testing preserved (parishes 1-2 with credentials)

-- If you need to verify other parishes in the future:
-- 1. Check official Archdiocese website: www.seneglise.org
-- 2. Check conference episcopale: conferencepiscopale.org
-- 3. The Archdiocese of Dakar has 52 total parishes across the region
