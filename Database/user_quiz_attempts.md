# user_quiz_attempts

---

**A. Columns**

| Name            | Data type   | Constraints & Defaults                                 | Notes                                                                 |
|-----------------|------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id              | integer    | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each quiz attempt (serial/auto-incremented)     |
| user_id         | integer    | NOT NULL, FK → users(id)                               | The user who made the attempt                                         |
| quiz_id         | integer    | NOT NULL, FK → quizzes(id)                             | The quiz that was attempted                                           |
| score           | integer    | NULL (optional)                                        | The score achieved                                                    |
| total_questions | integer    | NOT NULL                                               | Number of questions in the quiz                                       |
| correct_answers | integer    | NULL (optional)                                        | Number of correct answers                                             |
| time_spent      | integer    | NULL (optional)                                        | Time spent on the quiz (in seconds or minutes)                        |
| answers         | jsonb      | NULL (optional)                                        | JSON object with user's answers (e.g., {"1": "A", "2": "C"})          |
| completed       | boolean    | NULL, DEFAULT false                                    | Whether the attempt was completed                                     |
| started_at      | timestamp  | NOT NULL, DEFAULT CURRENT_TIMESTAMP                    | When the attempt started                                              |
| completed_at    | timestamp  | NULL (optional)                                        | When the attempt was completed                                        |

---

**B. Purpose**

The `user_quiz_attempts` table records each user's attempt at a quiz, including timing, answers, score, and completion status. It supports analytics, progress tracking, personalized feedback, and enables features such as quiz history, performance analytics, and adaptive learning.

---

**C. Usage in Code**

- `supabase/migrations/02_rls_policies.sql`  
  – Row-level security enabled and policies defined for quiz attempts (lines 9, 79, 84, 88, 93, 97, 102).

- `supabase/migrations/01_initial_schema.sql`  
  – Table creation and foreign key references (line 93).

- `shared/schema.ts`  
  – TypeScript schema and type definitions for quiz attempts (lines 100–101).

- `server/storage.ts`  
  – Backend queries for quiz attempts (lines 250, 334; e.g., fetching, inserting, and updating attempt records).

*The table is referenced in backend, migrations, and shared schema code, indicating it is a functional part of the application.*

---

**D. Related Objects**

- **Foreign Keys**
  - `user_id` → `users(id)`  
    *Links each quiz attempt to a valid user, enforcing referential integrity.*
  - `quiz_id` → `quizzes(id)`  
    *Links each quiz attempt to a valid quiz, enforcing referential integrity.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) indexes on `user_id` and `quiz_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Row-Level Security**
  - RLS enabled and policies defined to control access to quiz attempts (see `02_rls_policies.sql`).

- **Relationships**
  - Used in application logic to join with users and quizzes for analytics, progress tracking, and personalized features

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | user_id | quiz_id | score | total_questions | correct_answers | time_spent | answers                | completed | started_at           | completed_at           |
|----|---------|---------|-------|-----------------|-----------------|------------|------------------------|-----------|----------------------|-----------------------|
| 1  | 42      | 7       | 8     | 10              | 8               | 600        | {"1": "A", "2": "C"}   | true      | 2024-06-01T12:00:00  | 2024-06-01T12:10:00   |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  Foreign key constraints ensure quiz attempts are always linked to valid users and quizzes.
- **Extensibility:**  
  The use of JSONB for `answers` allows flexible storage of complex answer data.
- **Auditability:**  
  The `started_at` and `completed_at` timestamps support tracking user activity and quiz duration.
- **Security:**  
  Row-level security (RLS) is enabled, with policies to control who can view, create, or update quiz attempts.
- **Usage:**  
  Central to quiz history, analytics, and personalized learning features.

---

**G. Summary**

- **Status:** Actively used in backend, migrations, and shared schema code.
- **Role:** Central to tracking user quiz attempts, results, and analytics.
- **No unused/legacy status.**
