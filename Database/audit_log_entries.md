### audit_log_entries

**A. Columns**
| Name        | Data type                | Constraints                        | Notes                                         |
|-------------|-------------------------|-------------------------------------|-----------------------------------------------|
| instance_id | uuid                    | NULLABLE                           | Instance identifier (multi-tenant support)    |
| id          | uuid                    | NOT NULL                           | Unique log entry ID (not primary key)         |
| payload     | json                    | NULLABLE                           | Log details (action, user, metadata, etc.)    |
| created_at  | timestamp with time zone| NULLABLE                           | When the log entry was created                |
| ip_address  | character varying       | NOT NULL, DEFAULT ''               | IP address associated with the action         |

**B. Purpose**
This table stores audit log entries for the Supabase Auth system, recording security-relevant events (such as sign-ins, sign-outs, password changes, etc.) for compliance, traceability, and security monitoring. The payload is flexible and can store structured event data.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- **No views, functions, or triggers** in the application codebase directly depend on this table (based on available schema and codebase scan).
- This table is managed and populated by the Supabase Auth system for internal auditing.
