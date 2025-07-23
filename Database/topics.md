# topics

---

**A. Columns**

| Name        | Data type           | Constraints & Defaults                                 | Notes                                                                 |
|-------------|--------------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id          | integer            | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each topic (serial/auto-incremented)            |
| subject_id  | integer            | NOT NULL, FK → subjects(id)                            | The subject this topic belongs to                                     |
| name        | text               | NOT NULL                                               | Name of the topic                                                     |
| description | text               | NULL (optional)                                        | Optional description of the topic                                     |
| created_at  | timestamp          | NOT NULL, DEFAULT CURRENT_TIMESTAMP                    | Timestamp when the topic was created                                  |

---

**B. Purpose**

The `topics` table stores the list of topics (sub-areas) for each subject, enabling the organization of questions, study materials, and analytics by topic. It supports curriculum structure, filtering, and content management, and is central to mapping questions and study resources to specific knowledge areas.

---

**C. Usage in Code**

- `supabase/migrations/02_rls_policies.sql`  
  – Row-level security enabled and policy defined for topics (lines 6, 168).

- `supabase/migrations/01_initial_schema.sql`  
  – Table creation and multiple foreign key references to topics (lines 61, 71, 111, 121, 129, 161).

- `shared/schema.ts`  
  – TypeScript schema and type definitions for topics and related foreign keys (lines 65–228).

- `server/storage.ts`  
  – Topics included in storage layer for backend operations (line 1).

- `server/routes.ts`  
  – CRUD, seeding, and API endpoints for topics; includes seeding, fetching, and associating topics with questions (lines 766–1322, and many more).

- `client/src/pages/topic-study.tsx`  
  – Fetching and displaying topics for study and filtering (lines 115–189).

*The table is referenced throughout backend, frontend, migrations, and shared schema code, indicating it is a core part of the application.*

---

**D. Related Objects**

- **Foreign Keys**
  - `subject_id` → `subjects(id)`  
    *Links each topic to a valid subject, enforcing referential integrity.*
  - Referenced by other tables via `topic_id` (see migrations and schema for details; e.g., questions, quizzes, etc.)

- **Indexes**
  - Primary key index on `id`
  - (Likely) index on `subject_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Row-Level Security**
  - RLS enabled and policy defined to control access to topics (see `02_rls_policies.sql`).

- **Relationships**
  - Parent table for questions, quizzes, and other content mapped by topic
  - Used in application logic to join with subjects, questions, and analytics

- **Triggers, Views, Functions**
  - No triggers or views directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | subject_id | name         | description         | created_at                |
|----|------------|--------------|---------------------|---------------------------|
| 1  | 2          | Algebra      | Algebraic concepts  | 2024-06-01T12:00:00       |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  The foreign key constraint on `subject_id` ensures topics are always linked to valid subjects.
- **Extensibility:**  
  New topics can be added for new or existing subjects without code changes, supporting curriculum growth.
- **Auditability:**  
  The `created_at` timestamp supports tracking when topics are added or modified.
- **Security:**  
  Row-level security (RLS) is enabled, with policies to control who can view or modify topics.
- **Usage:**  
  Central to curriculum structure, filtering, analytics, and content management.

---

**G. Summary**

- **Status:** Actively used throughout backend, frontend, migrations, and shared schema code.
- **Role:** Central to curriculum structure, enabling dynamic, organized, and secure topic management.
- **No unused/legacy status.**
