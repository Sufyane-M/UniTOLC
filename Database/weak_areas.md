# weak_areas

---

**A. Columns**

| Name         | Data type   | Constraints & Defaults                                 | Notes                                                                 |
|--------------|------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id           | integer    | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each weak area record (serial/auto-incremented) |
| user_id      | integer    | NOT NULL, FK → users(id)                               | The user this weak area belongs to                                    |
| topic_id     | integer    | NOT NULL, FK → topics(id)                              | The topic this weak area refers to                                    |
| accuracy     | integer    | NOT NULL                                               | User's accuracy (e.g., percent correct) for this topic                |
| last_updated | timestamp  | NOT NULL, DEFAULT CURRENT_TIMESTAMP                    | When this record was last updated                                     |

---

**B. Purpose**

The `weak_areas` table tracks each user's weakest topics, storing their accuracy and the last time this was updated. It supports personalized study recommendations, analytics, and targeted feedback, enabling the system to help users focus on areas where they need the most improvement.

---

**C. Usage in Code**

- `supabase/migrations/02_rls_policies.sql`  
  – Row-level security enabled and policies defined for weak areas (lines 11, 126, 131).

- `supabase/migrations/01_initial_schema.sql`  
  – Table creation and foreign key references (line 118).

- `shared/schema.ts`  
  – TypeScript schema and type definitions for weak areas (lines 127–128).

- `server/storage.ts`  
  – Backend queries for weak areas (lines 281, 289, 298, 346; e.g., fetching, inserting, and updating weak area records).

*The table is referenced in backend, migrations, and shared schema code, indicating it is a functional part of the application.*

---

**D. Related Objects**

- **Foreign Keys**
  - `user_id` → `users(id)`  
    *Links each weak area record to a valid user, enforcing referential integrity.*
  - `topic_id` → `topics(id)`  
    *Links each weak area record to a valid topic, enforcing referential integrity.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) indexes on `user_id` and `topic_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Row-Level Security**
  - RLS enabled and policies defined to control access to weak areas (see `02_rls_policies.sql`).

- **Relationships**
  - Used in application logic to join with users and topics for analytics, recommendations, and personalized features

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | user_id | topic_id | accuracy | last_updated           |
|----|---------|----------|----------|------------------------|
| 1  | 42      | 7        | 55       | 2024-06-01T12:00:00    |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  Foreign key constraints ensure weak area records are always linked to valid users and topics.
- **Extensibility:**  
  The table can be extended to include additional metrics (e.g., attempts, improvement over time).
- **Auditability:**  
  The `last_updated` timestamp supports tracking when a user's weak area was last recalculated.
- **Security:**  
  Row-level security (RLS) is enabled, with policies to control who can view weak area records.
- **Usage:**  
  Central to personalized study recommendations, analytics, and user progress tracking.

---

**G. Summary**

- **Status:** Actively used in backend, migrations, and shared schema code.
- **Role:** Central to tracking and improving user performance on specific topics.
- **No unused/legacy status.**
