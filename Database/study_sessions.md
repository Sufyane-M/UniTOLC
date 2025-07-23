# study_sessions

**A. Columns**
| Name          | Data type                  | Constraints                                   | Notes                                         |
|---------------|---------------------------|-----------------------------------------------|-----------------------------------------------|
| id            | integer                   | PRIMARY KEY, NOT NULL, auto-increment         | Unique session identifier                     |
| user_id       | integer                   | NOT NULL, FOREIGN KEY → users(id)             | User who performed the study session          |
| subject_id    | integer                   | FOREIGN KEY → subjects(id), nullable          | Subject of the session                        |
| topic_id      | integer                   | FOREIGN KEY → topics(id), nullable            | Topic of the session                          |
| duration      | integer                   | NOT NULL                                      | Duration in seconds                           |
| date          | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP           | Date/time of the session                      |
| notes         | text                      |                                               | Optional notes about the session              |
| created_at    | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP           | When the session record was created           |
| difficulty    | text                      | DEFAULT 'media', nullable                     | Difficulty level (if tracked)                 |
| quiz_state    | jsonb                     | nullable                                      | Serialized quiz state for resuming sessions   |
| question_count| integer                   | DEFAULT 10, nullable                          | Number of questions in the session            |
| timer_enabled | boolean                   | DEFAULT false, nullable                       | Whether a timer was enabled                   |

**B. Purpose**
The `study_sessions` table records individual study or quiz sessions for users, including metadata such as subject, topic, duration, difficulty, and quiz state. It enables tracking of user study activity, session resumption, and analytics on learning progress.

**C. Usage in Code**
- `client/src/pages/topic-study.tsx` – Handles creation, update, and resumption of study sessions (e.g., `checkExistingSession`, `saveProgress`, `handleStartQuiz`).
- `shared/schema.ts` – Table schema and TypeScript type definition.
- `server/storage.ts` – Table imported for backend storage interface.
- `supabase/migrations/01_initial_schema.sql` – Table creation in initial schema migration.
- `supabase/migrations/02_rls_policies.sql` – Row-level security (RLS) policies for user access.

**D. Related Objects**
- **Foreign Key Relationships:**
  - `user_id` → `users(id)`: Associates the session with a user.
  - `subject_id` → `subjects(id)`: Associates the session with a subject.
  - `topic_id` → `topics(id)`: Associates the session with a topic.
- **Row-Level Security Policies:**
  - `"Users can view their study sessions"`: Users can only view their own sessions.
  - `"Users can create their study sessions"`: Users can only create sessions for themselves.

_No views, functions, or triggers directly depend on `study_sessions` in the current schema._