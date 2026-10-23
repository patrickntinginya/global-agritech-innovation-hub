-- First administrator bootstrap. Run ONCE in the Supabase dashboard SQL editor (which runs as a privileged role).
-- 1. Register the person normally through the website (or Authentication > Users > Add user) and confirm the email.
-- 2. Replace the address below with theirs and run this script.
-- There is deliberately no API, button or page in the application that can do this.
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'REPLACE-WITH-ADMIN-EMAIL@example.com'
on conflict do nothing;

-- Check the result (should return one row):
select u.email, r.role, r.granted_at
from public.user_roles r join auth.users u on u.id = r.user_id
where u.email = 'REPLACE-WITH-ADMIN-EMAIL@example.com';
