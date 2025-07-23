# user_exams

---

**A. Columns**

| Name         | Data type     | Constraints & Defaults                                 | Notes                                                                 |
|--------------|--------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id           | integer      | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each exam record (serial/auto-incremented)      |
| user_id      | integer      | NOT NULL, FK → users(id)                               | The user who owns this exam record                                    |
| exam_type    | USER-DEFINED | NOT NULL                                               | Enum or custom type for exam type (e.g., "TOLC-I", "TOLC-E")          |
| university   | text         | NULL (optional)                                        | University associated with the exam                                   |
| exam_date    | date         | NULL (optional)                                        | Date of the exam                                                      |
| target_score | integer      | NULL (optional)                                        | User's target score for the exam                                      |
| created_at   | timestamp    | NOT NULL, DEFAULT CURRENT_TIMESTAMP                    | Timestamp when the exam record was created                            |

---

**B. Purpose**

The `user_exams` table stores information about each user's planned or completed exams, including type, university, date, and target score. It supports user goal tracking, planning, analytics, and personalized study recommendations based on upcoming or past exams.

---

**C. Usage in Code**

- `supabase/migrations/02_rls_policies.sql`  
  – Row-level security enabled and policies defined for user exams (lines 3, 41, 46, 50, 55, 59, 64).

- `supabase/migrations/01_initial_schema.sql`  
  – Table creation and foreign key references (line 32).

- `shared/schema.ts`  
  – TypeScript schema and type definitions for user exams (lines 33–34).

- `server/storage.ts`  
  – Backend queries for user exams (lines 161, 174, 188; e.g., fetching, inserting, and updating exam records).

*The table is referenced in backend, migrations, and shared schema code, indicating it is a functional part of the application.*

---

**D. Related Objects**

- **Foreign Keys**
  - `user_id` → `users(id)`  
    *Links each exam record to a valid user, enforcing referential integrity.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) index on `user_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Row-Level Security**
  - RLS enabled and policies defined to control access to user exams (see `02_rls_policies.sql`).

- **Relationships**
  - Used in application logic to join with users for analytics, planning, and personalized features

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | user_id | exam_type | university      | exam_date   | target_score | created_at           |
|----|---------|-----------|----------------|-------------|--------------|----------------------|
| 1  | 42      | TOLC-I    | "Polimi"       | 2024-07-15  | 35           | 2024-06-01T12:00:00  |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  Foreign key constraints ensure exam records are always linked to valid users.
- **Extensibility:**  
  The use of a user-defined type for `exam_type` allows for flexible support of multiple exam formats.
- **Auditability:**  
  The `created_at` timestamp supports tracking when exam records are added or modified.
- **Security:**  
  Row-level security (RLS) is enabled, with policies to control who can view, create, or update exam records.
- **Usage:**  
  Central to user goal tracking, analytics, and personalized study planning.

---

**G. Summary**

- **Status:** Actively used in backend, migrations, and shared schema code.
- **Role:** Central to tracking user exam plans and results.
- **No unused/legacy status.**
