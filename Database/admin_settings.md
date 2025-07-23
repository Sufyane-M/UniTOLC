### admin_settings

**A. Columns**
| Name        | Data type                  | Constraints                        | Notes                                         |
|-------------|---------------------------|-------------------------------------|-----------------------------------------------|
| id          | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique setting entry ID                       |
| key         | text                      | NOT NULL                           | Name/identifier of the setting                |
| value       | jsonb                     | NOT NULL                           | Value of the setting (flexible structure)     |
| description | text                      | NULLABLE                           | Human-readable description of the setting     |
| updated_by  | integer                   | NULLABLE, FOREIGN KEY (users.id)   | Admin user who last updated the setting       |
| updated_at  | timestamp (no timezone)   | NULLABLE, DEFAULT CURRENT_TIMESTAMP| When the setting was last updated             |
| created_at  | timestamp (no timezone)   | NULLABLE, DEFAULT CURRENT_TIMESTAMP| When the setting was created                  |

**B. Purpose**
This table stores platform-wide administrative settings as key-value pairs, allowing for flexible configuration of features, limits, and behaviors. It supports auditability (who/when updated) and can be extended with descriptions for clarity.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- **Foreign Key:**  
  - `updated_by` references `users.id` (the admin who last updated the setting)
- **No triggers, views, or functions** directly depend on this table (based on available schema and codebase scan).
