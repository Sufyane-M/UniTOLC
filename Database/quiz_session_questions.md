# quiz_session_questions

**A. Columns**
| Name               | Data type                  | Constraints                        | Notes                                      |
|--------------------|---------------------------|------------------------------------|--------------------------------------------|
| id                 | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique question-in-session identifier      |
| session_id         | integer                   | NOT NULL, FOREIGN KEY quiz_sessions(id) | The quiz session this question belongs to |
| question_id        | integer                   | NOT NULL, FOREIGN KEY questions(id)| The question being asked                   |
| sequence_order     | integer                   | NOT NULL                           | Order of the question in the session       |
| user_answer        | text                      |                                    | User's answer (nullable)                   |
| is_correct         | boolean                   |                                    | Whether the answer was correct             |
| time_spent_seconds | integer                   |                                    | Time spent on this question (seconds)      |
| is_flagged         | boolean                   | DEFAULT false                      | If the user flagged this question          |
| is_skipped         | boolean                   | DEFAULT false                      | If the user skipped this question          |
| created_at         | timestamp with time zone  | DEFAULT CURRENT_TIMESTAMP          | When the record was created                |
| updated_at         | timestamp with time zone  | DEFAULT CURRENT_TIMESTAMP          | When the record was last updated           |

**B. Purpose**
The `quiz_session_questions` table stores the mapping and state of each question presented in a quiz session. It tracks the order, user answers, correctness, time spent, and user actions (flagged/skipped) for each question, enabling detailed session analytics, review, and adaptive learning features.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- The `session_id` column is a foreign key referencing `quiz_sessions(id)`.
- The `question_id` column is a foreign key referencing `questions(id)`.
- No views, functions, or triggers in the current schema or codebase are found to depend on `quiz_session_questions`.
Notes:
The table exists in the schema but is not used in any backend, frontend, or shared code.
No migrations, API endpoints, or business logic reference this table.