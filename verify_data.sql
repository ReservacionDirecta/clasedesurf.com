SELECT 'Users' as tabla, COUNT(*) as registros FROM "User"
UNION ALL
SELECT 'Schools', COUNT(*) FROM "School"
UNION ALL
SELECT 'Instructors', COUNT(*) FROM "Instructor"
UNION ALL
SELECT 'Classes', COUNT(*) FROM "Class"
UNION ALL
SELECT 'Payments', COUNT(*) FROM "Payment";
