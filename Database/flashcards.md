# flashcards

**A. Columns**
| Name          | Data type                  | Constraints                        | Notes                                      |
|---------------|---------------------------|------------------------------------|--------------------------------------------|
| id            | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique flashcard identifier                |
| user_id       | integer                   | NOT NULL, FOREIGN KEY users(id)    | Owner of the flashcard                     |
| front         | text                      | NOT NULL                           | Front side (question/prompt)               |
| back          | text                      | NOT NULL                           | Back side (answer/explanation)             |
| topic         | text                      | NOT NULL                           | Topic/category of the flashcard            |
| box_number    | integer                   | DEFAULT 1                          | Leitner box number for SRS                 |
| last_reviewed | timestamp with time zone  |                                    | Last time the card was reviewed            |
| next_review   | timestamp with time zone  |                                    | Next scheduled review time                 |
| created_at    | timestamp with time zone  | DEFAULT now()                      | Creation timestamp                         |
| updated_at    | timestamp with time zone  | DEFAULT now()                      | Last update timestamp                      |

**B. Purpose**
The `flashcards` table stores user-generated flashcards for spaced repetition learning. Each card contains a prompt (front), an answer (back), and metadata for tracking review schedules using the Leitner system. This enables users to efficiently memorize and review key concepts over time.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- The `user_id` column is a foreign key referencing `users(id)`.
- No views, functions, or triggers in the current schema or codebase are found to depend on `flashcards`.
Notes:
The table exists in the schema but is not used in any backend, frontend, or shared code.
No migrations, API endpoints, or business logic reference this table.

NOTE: THIS WAS A OLD FUNCTIONALITIE THAT I DECIDED TO DELETE, SO THIS TABLE IS USELESS