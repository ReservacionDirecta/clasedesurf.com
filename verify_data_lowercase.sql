SELECT 'users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'schools', COUNT(*) FROM schools
UNION ALL
SELECT 'instructors', COUNT(*) FROM instructors
UNION ALL
SELECT 'classes', COUNT(*) FROM classes
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
