
SELECT schemaname, tablename, policyname, roles, cmd, qual, permissive
FROM pg_policies
WHERE tablename = 'colegios';
