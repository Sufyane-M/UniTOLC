# quiz_sessions

**A. Columns**
| Name              | Data type                  | Constraints                        | Notes                                      |
|-------------------|---------------------------|------------------------------------|--------------------------------------------|
| id                | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique session identifier                  |
| user_id           | integer                   | NOT NULL, FOREIGN KEY users(id)    | User who owns the session                  |
| mode              | text                      | NOT NULL                           | Practice mode (e.g., targeted, adaptive)   |
| topic_id          | integer                   | FOREIGN KEY topics(id)             | Topic for the session (nullable)           |
| difficulty        | text                      |                                    | Difficulty level (nullable)                |
| started_at        | timestamp with time zone  | DEFAULT CURRENT_TIMESTAMP          | When the session started                   |
| completed_at      | timestamp with time zone  |                                    | When the session was completed             |
| total_time_seconds| integer                   |                                    | Total time spent in the session (seconds)  |
| score             | numeric                   |                                    | Final score for the session                |
| max_section_score | numeric                   |                                    | Maximum score in any section               |
| xp_earned         | integer                   |                                    | XP earned in this session                  |
| metadata          | jsonb                     | DEFAULT '{}'                       | Additional session metadata                |
| created_at        | timestamp with time zone  | DEFAULT CURRENT_TIMESTAMP          | Creation timestamp                         |

**B. Purpose**
The `quiz_sessions` table stores the lifecycle and results of a user's quiz or practice session. It tracks the session's mode, topic, difficulty, timing, scores, XP, and other metadata, enabling analytics, progress tracking, and review of past practice.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- The `user_id` column is a foreign key referencing `users(id)`.
- The `topic_id` column is a foreign key referencing `topics(id)`.
- No views, functions, or triggers in the current schema or codebase are found to depend on `quiz_sessions`.
Notes:
The table exists in the schema but is not used in any backend, frontend, or shared code.
No migrations, API endpoints, or business logic reference this table.