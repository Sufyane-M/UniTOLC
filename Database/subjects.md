# subjects

**A. Columns**
| Name        | Data type                  | Constraints                        | Notes                                 |
|-------------|---------------------------|------------------------------------|---------------------------------------|
| id          | integer                   | PRIMARY KEY, NOT NULL, auto-increment | Unique subject identifier             |
| name        | text                      | NOT NULL, UNIQUE                   | Name of the subject (e.g., "Matematica") |
| description | text                      |                                    | Optional description of the subject   |
| exam_type   | USER-DEFINED (enum)       | NOT NULL                           | Type of exam this subject belongs to  |
| created_at  | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP| When the subject was created          |

**B. Purpose**
The `subjects` table stores the list of all available subjects (e.g., Mathematics, Physics) that users can study or be tested on. It serves as a foundational reference for organizing topics, quizzes, study sessions, and analytics by subject area.

**C. Usage in Code**
- `client/src/pages/topic-study.tsx` – Fetches, displays, and allows selection of subjects for study sessions and topic filtering.
- `client/src/pages/analytics.tsx` – Used for analytics and performance breakdowns by subject.
- `client/src/components/dashboard/ProgressOverview.tsx` – Displays user progress and best-performing subjects.
- `client/src/pages/admin.tsx` – Used in admin forms for selecting/assigning subjects.
- `server/routes.ts` – API endpoints for listing, seeding, and debugging subjects; also used for topic filtering and system stats.
- `shared/schema.ts` – Table schema and TypeScript type definition.
- `supabase/migrations/01_initial_schema.sql` – Table creation in initial schema migration.
- `supabase/migrations/02_rls_policies.sql` – Row-level security (RLS) policy for public read access.

**D. Related Objects**
- **Foreign Key Relationships:**
  - Referenced by `topics.subject_id` (topics are grouped under subjects).
  - Referenced by `quizzes.subject_id` (quizzes can be associated with a subject).
  - Referenced by `study_sessions.subject_id` (study sessions can be linked to a subject).
- **Row-Level Security Policies:**
  - `"Anyone can view subjects"`: Allows all authenticated users to read subjects.
- **No views, triggers, or functions** directly depend on `subjects` in the current schema.