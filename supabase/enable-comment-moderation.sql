-- Run once in Supabase Dashboard > SQL Editor.
-- Only users listed in public.admins can delete comments.
drop policy if exists "Admins can delete comments" on public.comments;

create policy "Admins can delete comments"
on public.comments for delete
to authenticated
using (public.is_admin());

grant delete on public.comments to authenticated;
