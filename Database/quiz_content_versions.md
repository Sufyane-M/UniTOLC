# quiz_content_versions

**A. Columns**
| Name           | Data type                    | Constraints                        | Notes                                      |
|----------------|-----------------------------|------------------------------------|--------------------------------------------|
| id             | integer                     | PRIMARY KEY, NOT NULL, auto-incr.  | Unique version identifier                  |
| content_id     | integer                     | NOT NULL                           | ID of the quiz/question being versioned    |
| content_type   | USER-DEFINED (enum)         | NOT NULL                           | Type of content (e.g., quiz, question)     |
| version_number | integer                     | NOT NULL                           | Version number for this content            |
| content        | jsonb                       | NOT NULL                           | JSON snapshot of the content               |
| commit_message | text                        |                                    | Optional commit message for the version    |
| created_by     | integer                     | NOT NULL, FOREIGN KEY users(id)    | User who created this version              |
| created_at     | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP| Creation timestamp                         |

**B. Purpose**
The `quiz_content_versions` table stores versioned snapshots of quiz or question content. Each row represents a specific version of a quiz or question, including the content, version number, and metadata about who made the change and when. This enables audit trails, rollback, and collaborative editing of quiz content.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- The `created_by` column is a foreign key referencing `users(id)`.
- No views, functions, or triggers in the current schema or codebase are found to depend on `quiz_content_versions`.
Notes:
The table exists in the schema but is not used in any backend, frontend, or shared code.
No migrations, API endpoints, or business logic reference this table.