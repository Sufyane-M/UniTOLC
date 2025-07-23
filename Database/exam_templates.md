# exam_templates

**A. Columns**
| Name        | Data type                    | Constraints                        | Notes                                      |
|-------------|-----------------------------|------------------------------------|--------------------------------------------|
| id          | integer                     | PRIMARY KEY, NOT NULL, auto-incr.  | Unique template identifier                 |
| name        | text                        | NOT NULL                           | Template name                              |
| description | text                        |                                    | Optional description                       |
| created_by  | integer                     | NOT NULL, FOREIGN KEY users(id)    | User who created the template              |
| is_public   | boolean                     | NOT NULL, DEFAULT false            | If the template is public                  |
| is_premium  | boolean                     | NOT NULL, DEFAULT false            | If the template is for premium users       |
| sections    | jsonb                       | NOT NULL                           | JSON structure describing exam sections    |
| settings    | jsonb                       |                                    | Optional JSON settings for the template    |
| created_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP| Creation timestamp                         |
| updated_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP| Last update timestamp                      |

**B. Purpose**
The `exam_templates` table stores reusable templates for exam structures. Each template defines the sections, settings, and metadata for a specific exam format, allowing users (or admins) to create, share, and reuse exam blueprints for simulations or practice. Templates can be public, private, or premium, and are associated with the user who created them.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- The `created_by` column is a foreign key referencing `users(id)`.
- No views, functions, or triggers in the current schema or codebase are found to depend on `exam_templates`.
Notes:
The table exists in the schema but is not used in any backend, frontend, or shared code.
No migrations, API endpoints, or business logic reference this table.