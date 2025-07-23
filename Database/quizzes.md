# quizzes

**A. Columns**
| Name        | Data type                  | Constraints                        | Notes                                      |
|-------------|---------------------------|------------------------------------|--------------------------------------------|
| id          | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique quiz identifier                     |
| title       | text                      | NOT NULL                           | Quiz title                                 |
| description | text                      |                                    | Optional description                       |
| type        | USER-DEFINED (quiz_type)  | NOT NULL                           | Enum: simulation, topic, flashcard, etc.   |
| subject_id  | integer                   | FOREIGN KEY subjects(id)           | Subject this quiz belongs to (nullable)    |
| questions   | jsonb                     |                                    | Array of question IDs or direct questions  |
| time_limit  | integer                   |                                    | Time limit in seconds (nullable)           |
| is_premium  | boolean                   | DEFAULT false                      | If the quiz is premium-only                |
| created_at  | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP| Creation timestamp                         |

**B. Purpose**
The `quizzes` table stores metadata and configuration for each quiz available in the system, including its title, type, subject, questions, time limit, and premium status. It enables the management and delivery of various quiz types to users.

**C. Usage in Code**
- `shared/schema.ts` – Table definition and type exports (lines 86–114, 205–231)
- `server/storage.ts` – Methods for fetching quizzes: `getQuizzes`, `getQuiz` (lines 197–226)
- `server/routes.ts` – API endpoints for listing and retrieving quizzes (`/api/quizzes`, `/api/quizzes/:id`) (lines 171–287)
- `supabase/migrations/01_initial_schema.sql` – Table creation and foreign key reference from `user_quiz_attempts` (lines 43–108)
- `client/src/pages/admin.tsx` – Quiz form validation schema for admin quiz creation (lines 85–102)

**D. Related Objects**
- `user_quiz_attempts` – Table with a foreign key `quiz_id` referencing `quizzes(id)`; stores user attempts for each quiz.
- No views, functions, or triggers directly depend on `quizzes` in the current schema.
