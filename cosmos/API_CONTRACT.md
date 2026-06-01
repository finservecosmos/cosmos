# Backend Contract — Cosmos Finery

Backend is powered by **Supabase** (PostgreSQL + Auth + Storage).

---

## Auth (handled by Supabase SDK — no custom endpoint needed)

| Action        | SDK call                                          |
|---------------|---------------------------------------------------|
| Login         | `supabase.auth.signInWithPassword({ email, password })` |
| Logout        | `supabase.auth.signOut()`                         |
| Get session   | `supabase.auth.getSession()`                      |
| Get user      | `supabase.auth.getUser()`                         |

---

## Database Tables (your teammate sets these up in Supabase)

> Add tables here as they are created.

### `profiles`
Linked to `auth.users` via `id`.

| Column     | Type      | Notes                  |
|------------|-----------|------------------------|
| id         | uuid      | FK → auth.users.id     |
| full_name  | text      |                        |
| role       | text      | e.g. advisor, admin    |
| created_at | timestamp |                        |

---

## Environment Variables (frontend `.env`)

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: **Supabase Dashboard → Project → Settings → API**

---

## Notes
- Row Level Security (RLS) must be enabled on all tables
- Never expose the `service_role` key on the frontend — anon key only
- All financial data tables should have RLS policies tied to `auth.uid()`
