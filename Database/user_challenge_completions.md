# user_challenge_completions

---

**A. Columns**

| Name         | Data type   | Constraints & Defaults                                 | Notes                                                                 |
|--------------|------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id           | integer    | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each completion record (serial/auto-incremented)|
| user_id      | integer    | NOT NULL, FK → users(id)                               | The user who completed the challenge                                  |
| challenge_id | integer    | NOT NULL, FK → daily_challenges(id)                    | The challenge that was completed                                      |
| completed_at | timestamp  | NOT NULL, DEFAULT CURRENT_TIMESTAMP                    | Timestamp when the challenge was completed                            |

---

**B. Purpose**

The `user_challenge_completions` table records when a user completes a daily challenge, supporting progress tracking, rewards, and analytics for user engagement with challenges. It enables features such as streaks, badges, and personalized feedback based on challenge participation.

---

**C. Usage in Code**

- `supabase/migrations/02_rls_policies.sql`  
  – Row-level security enabled and policies defined for user challenge completions (lines 14, 146, 151, 155, 160).

- `supabase/migrations/01_initial_schema.sql`  
  – Table creation and foreign key references (line 147).

- `shared/schema.ts`  
  – TypeScript schema and type definitions for user challenge completions (lines 159–160).

- `server/storage.ts`  
  – Backend queries for user challenge completions (lines 378, 419; e.g., fetching and inserting completion records).

*The table is referenced in backend, migrations, and shared schema code, indicating it is a functional part of the application.*

---

**D. Related Objects**

- **Foreign Keys**
  - `user_id` → `users(id)`  
    *Links each completion to a valid user, enforcing referential integrity.*
  - `challenge_id` → `daily_challenges(id)`  
    *Links each completion to a valid daily challenge, enforcing referential integrity.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) indexes on `user_id` and `challenge_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Row-Level Security**
  - RLS enabled and policies defined to control access to user challenge completions (see `02_rls_policies.sql`).

- **Relationships**
  - Used in application logic to join with users and daily challenges for analytics, progress tracking, and rewards

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | user_id | challenge_id | completed_at           |
|----|---------|-------------|------------------------|
| 1  | 42      | 7           | 2024-06-01T12:00:00    |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  Foreign key constraints ensure completions are always linked to valid users and challenges.
- **Extensibility:**  
  New types of challenges or user engagement features can be supported by extending this table or its relationships.
- **Auditability:**  
  The `completed_at` timestamp supports tracking user activity and engagement over time.
- **Security:**  
  Row-level security (RLS) is enabled, with policies to control who can view or modify completion records.
- **Usage:**  
  Central to gamification, analytics, and user engagement features.

---

**G. Summary**

- **Status:** Actively used in backend, migrations, and shared schema code.
- **Role:** Central to tracking user engagement and completion of daily challenges.
- **No unused/legacy status.**
