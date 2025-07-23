# users (auth)

---

**A. Columns**

| Name                        | Data type           | Constraints & Defaults                                 | Notes                                                                 |
|-----------------------------|---------------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| instance_id                 | uuid                | NULL                                                   | Supabase instance identifier (multi-tenancy support)                  |
| id                          | uuid                | PRIMARY KEY, NOT NULL                                  | Unique user identifier (used across all Supabase services)            |
| aud                         | character varying   | NULL                                                   | Audience claim for JWT tokens                                         |
| role                        | character varying   | NULL                                                   | User role (e.g., authenticated, service_role)                         |
| email                       | character varying   | NULL                                                   | User's email address                                                  |
| encrypted_password          | character varying   | NULL                                                   | Hashed password (if using email/password auth)                        |
| email_confirmed_at          | timestamp with tz   | NULL                                                   | When the email was confirmed                                          |
| invited_at                  | timestamp with tz   | NULL                                                   | When the user was invited                                             |
| confirmation_token          | character varying   | NULL                                                   | Token for email confirmation                                          |
| confirmation_sent_at        | timestamp with tz   | NULL                                                   | When confirmation was sent                                            |
| recovery_token              | character varying   | NULL                                                   | Token for password recovery                                           |
| recovery_sent_at            | timestamp with tz   | NULL                                                   | When recovery was sent                                                |
| email_change_token_new      | character varying   | NULL                                                   | Token for new email change                                            |
| email_change                | character varying   | NULL                                                   | New email address (pending confirmation)                              |
| email_change_sent_at        | timestamp with tz   | NULL                                                   | When email change was sent                                            |
| last_sign_in_at             | timestamp with tz   | NULL                                                   | Last sign-in timestamp                                                |
| raw_app_meta_data           | jsonb               | NULL                                                   | Application metadata (roles, permissions, etc.)                       |
| raw_user_meta_data          | jsonb               | NULL                                                   | User metadata (profile info, preferences, etc.)                       |
| is_super_admin              | boolean             | NULL                                                   | Supabase internal: super admin flag                                   |
| created_at                  | timestamp with tz   | NULL                                                   | When the user was created                                             |
| updated_at                  | timestamp with tz   | NULL                                                   | When the user was last updated                                        |
| phone                       | text                | NULL                                                   | User's phone number                                                   |
| phone_confirmed_at          | timestamp with tz   | NULL                                                   | When the phone was confirmed                                          |
| phone_change                | text                | DEFAULT ''                                             | New phone number (pending confirmation)                               |
| phone_change_token          | character varying   | DEFAULT ''                                             | Token for phone change                                                |
| phone_change_sent_at        | timestamp with tz   | NULL                                                   | When phone change was sent                                            |
| confirmed_at                | timestamp with tz   | NULL                                                   | When the user was confirmed (any method)                              |
| email_change_token_current  | character varying   | DEFAULT ''                                             | Token for current email change                                        |
| email_change_confirm_status | smallint            | DEFAULT 0                                              | Status of email change confirmation                                   |
| banned_until                | timestamp with tz   | NULL                                                   | If set, user is banned until this time                                |
| reauthentication_token      | character varying   | DEFAULT ''                                             | Token for reauthentication                                            |
| reauthentication_sent_at    | timestamp with tz   | NULL                                                   | When reauthentication was sent                                        |
| is_sso_user                 | boolean             | NOT NULL, DEFAULT false                                | True if user was created via SSO (can have duplicate emails)          |
| deleted_at                  | timestamp with tz   | NULL                                                   | When the user was soft-deleted                                        |
| is_anonymous                | boolean             | NOT NULL, DEFAULT false                                | True if user is anonymous (guest session)                             |

---

**B. Purpose**

The `users` table in the `auth` schema is managed by Supabase Auth and stores all authentication-related user data, including credentials, contact info, metadata, and security tokens. It is the canonical source for user identity, authentication, and authorization across the application. This table underpins all login, registration, password reset, SSO, and user management flows.

---

**C. Usage in Code**

- `supabase/migrations/03_triggers.sql`  
  – Triggers and mapping between `auth.users` and the application's `users` table (lines 20, 30; e.g., after insert on `auth.users` creates a record in `public.users`).

- `supabase/migrations/01_initial_schema.sql`  
  – Mapping table and foreign key references to `auth.users` (lines 25, 27; e.g., `auth_user_mapping`).

- *Most application code interacts with the public `users` table, but mapping and triggers ensure linkage to `auth.users` for authentication.*

- **Indirect usage:**  
  - All authentication, registration, and user management flows in the app depend on this table via Supabase Auth APIs and triggers.

---

**D. Related Objects**

- **Triggers**
  - Triggers on `auth.users` to create or update records in the application's `users` table (see `03_triggers.sql`).
- **Mapping Table**
  - `auth_user_mapping` links `auth.users(id)` to `public.users(id)` for application-level user data.
- **Foreign Keys**
  - Referenced by mapping tables and possibly by audit or log tables.
- **Indexes**
  - Primary key index on `id`.
  - (Likely) indexes on `email`, `phone`, and other unique fields for fast lookups (standard for auth tables).
- **No direct views or custom functions** depend on this table, but it is central to authentication and user management.

---

**E. Example Row**

| id (uuid)                             | email              | role           | is_sso_user | created_at                | ... |
|---------------------------------------|--------------------|----------------|-------------|--------------------------|-----|
| 123e4567-e89b-12d3-a456-426614174000  | user@email.com     | authenticated  | false       | 2024-06-01T12:00:00+00:00| ... |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  The `id` column is the canonical user identifier and is referenced throughout the platform.
- **Security:**  
  Sensitive fields (passwords, tokens) are encrypted/hashed and managed by Supabase Auth.
- **Extensibility:**  
  The `raw_app_meta_data` and `raw_user_meta_data` columns allow for flexible storage of roles, preferences, and custom claims.
- **Auditability:**  
  Timestamps and status fields support tracking user lifecycle events (creation, confirmation, ban, deletion).
- **Usage:**  
  All authentication, registration, and user management flows depend on this table, even if indirectly.

---

**G. Summary**

- **Status:** Central to authentication and user management; referenced by triggers and mapping tables.
- **Role:** Canonical source of user identity, authentication, and authorization.
- **No unused/legacy status.**
