# subscriptions

**A. Columns**
| Name           | Data type                  | Constraints                        | Notes                                      |
|----------------|---------------------------|-------------------------------------|--------------------------------------------|
| id             | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique subscription identifier             |
| user_id        | integer                   | NOT NULL, FK → users(id)           | The user who owns the subscription         |
| status         | subscription_status (enum)| NOT NULL, DEFAULT 'trial'          | Enum: 'active', 'canceled', 'expired', 'trial' |
| start_date     | timestamp                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP| When the subscription started              |
| end_date       | timestamp                 | NULL                               | When the subscription ends (if set)        |
| payment_method | text                      | NULL                               | Payment method used (if any)               |
| amount         | integer                   | NULL                               | Amount paid (in cents, if any)             |
| created_at     | timestamp                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP| Record creation timestamp                  |

**B. Purpose**
The `subscriptions` table tracks premium subscription plans for users. It records the status, duration, payment details, and ownership of each subscription, enabling the application to manage access to premium features and billing.

**C. Usage in Code**
- `shared/schema.ts` – Table and TypeScript type definition for subscriptions (lines 43–55, 225)
- `supabase/migrations/01_initial_schema.sql` – Table creation and enum definition (lines 1–108)
- `supabase/migrations/02_rls_policies.sql` – Row-level security (RLS) enabled and policies for user access (lines 1–66)
- `server/storage.ts` – Imported in storage interface for backend logic (line 1)
- *(No direct usage found in frontend pages or business logic in the provided search results, but likely used via backend abstractions.)*

**D. Related Objects**
- **Row-Level Security (RLS) Policies**:  
  - `"Users can view their subscriptions"` – Allows users to select (view) their own subscriptions.
- **Foreign Key**:  
  - `user_id` references `users(id)` with `ON DELETE CASCADE` (removes subscriptions if user is deleted).
- **Enum**:  
  - `status` uses the `subscription_status` enum (`active`, `canceled`, `expired`, `trial`).

*No triggers, views, or custom functions directly depend on this table in the user codebase.*
