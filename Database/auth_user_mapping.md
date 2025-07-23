### auth_user_mapping

**A. Columns**
| Name         | Data type                  | Constraints                        | Notes                                         |
|--------------|---------------------------|-------------------------------------|-----------------------------------------------|
| auth_user_id | uuid                      | PRIMARY KEY, NOT NULL, FK (auth.users.id) ON DELETE CASCADE | Supabase Auth user ID (UUID)                  |
| user_id      | integer                   | NOT NULL, FK (users.id) ON DELETE CASCADE | Internal user table ID                        |
| created_at   | timestamp (no timezone)   | NULLABLE, DEFAULT CURRENT_TIMESTAMP| When the mapping was created                  |

**B. Purpose**
This table maps Supabase Auth users (from the `auth.users` table, managed by Supabase) to internal user records in the application's `users` table. It enables linking authentication identities to application profiles, supporting custom user data, roles, and business logic.

**C. Usage in Code**
- `supabase/migrations/03_triggers.sql` –  
  - Trigger function `handle_new_user` inserts a mapping when a new auth user is created.
- `supabase/migrations/01_initial_schema.sql` –  
  - Table definition and foreign key constraints.
- `supabase/migrations/02_rls_policies.sql` –  
  - Row Level Security (RLS) policies reference this table for access control on users and related tables.
- `server/middleware/auth.ts` –  
  - Used to look up the internal user and role for a given Supabase Auth user during authentication.
- `server/storage.ts` –  
  - Used to look up the internal user ID for a given auth user during login.
- `client/src/context/AuthContext.tsx` –  
  - Used to create, check, and fetch user mappings during registration, login, and session management.

**D. Related Objects**
- **Foreign Keys:**  
  - `auth_user_id` references `auth.users(id)` (Supabase Auth user, ON DELETE CASCADE)
  - `user_id` references `users(id)` (internal user, ON DELETE CASCADE)
- **Trigger:**  
  - `on_auth_user_created` (in `supabase/migrations/03_triggers.sql`): Automatically creates a mapping when a new auth user is registered.
- **RLS Policies:**  
  - Multiple RLS policies reference this table to restrict access to user-specific data across the schema.
