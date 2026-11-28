# Publishing card edits live (optional)

Until both variables below are set, the site behaves exactly as before: card edits save in this browser only
(`dojo_content_overrides_v1`) and there is no Admin Sign-In.

## 1. Create the database
1. Create a Supabase project (free tier is enough).
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, and press **Run**.

## 2. Make yourself the only admin
1. **Authentication → Users → Add user → Create new user**: your email, with **Auto Confirm User** on.
2. Copy that user's **UID**.
3. In the SQL Editor run, with your UID:
   ```sql
   insert into public.admins (user_id) values ('PASTE-YOUR-UID-HERE');
   ```
4. **Authentication → Sign In / Providers → Email**: turn **Allow new users to sign up** off, so nobody else
   can create an account. (The site also asks for sign-in codes with `create_user: false`.)
5. **Authentication → Emails → Magic Link** template: make sure the body includes `{{ .Token }}`, so the email
   carries the 6-digit code the site asks for.

## 3. Connect the site
1. **Project Settings → API**: copy the **Project URL** and the **anon public** key. The anon key is meant to be
   public; the database policies are what protect it. Never use the `service_role` key here.
2. In Vercel, project **ellipsis-manual-v2-shell** (or live v2 later) → **Settings → Environment Variables**, add
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Redeploy. Both are read at build time, so a redeploy is needed after any change.

## 4. Use it
- ⋯ menu → **Admin Sign-In** (at the bottom) → your email → the code from the email.
- With edit mode on, **Save** on a card publishes it for everyone; **Reset** removes the published edit.
- Readers without the admin row can still edit cards, but their edits stay in their own browser.
- To remove admin rights: `delete from public.admins where user_id = '…';`
