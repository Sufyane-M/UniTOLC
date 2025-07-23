### admin_audit_logs

**A. Columns**
| Name         | Data type                  | Constraints                        | Notes                                      |
|--------------|---------------------------|-------------------------------------|--------------------------------------------|
| id           | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique log entry ID                        |
| admin_id     | integer                   | NOT NULL, FOREIGN KEY (users.id)   | Admin user who performed the action        |
| action_type  | USER-DEFINED (enum)       | NOT NULL                           | Type of admin action (e.g., update, login) |
| entity_type  | text                      | NOT NULL                           | Type of entity affected (e.g., user, ticket)|
| entity_id    | text                      | NOT NULL                           | ID of the affected entity                  |
| ip_address   | text                      | NULLABLE                           | IP address of the admin                    |
| user_agent   | text                      | NULLABLE                           | User agent string of the admin's browser   |
| details      | jsonb                     | NULLABLE                           | Additional details about the action        |
| before_state | jsonb                     | NULLABLE                           | State of the entity before the action      |
| after_state  | jsonb                     | NULLABLE                           | State of the entity after the action       |
| created_at   | timestamp (no timezone)   | NOT NULL, DEFAULT CURRENT_TIMESTAMP| When the action was performed              |

**B. Purpose**
A log table that records all significant administrative actions performed in the system. It is used for auditing, security, and traceability, capturing who did what, to which entity, when, and from where (IP/user agent), including before/after states for sensitive changes.

**C. Usage in Code**
- `server/routes.ts` –  
  - Lines 439–474: Insert log entry when an admin updates a support ticket.
  - Lines 491–520: Insert log entry when an admin impersonates a user.
  - Lines 475–500: Query and filter audit logs for the `/api/admin/audit-logs` endpoint.
- `client/src/pages/admin.tsx` –  
  - Lines 102–1055: Fetches and displays audit logs in the admin dashboard, with filtering and tabular display in the "Audit Log" tab.

**D. Related Objects**
- **Foreign Key:** `admin_id` references `users.id` (links log entry to the admin user).
- **No triggers, views, or functions** directly depend on this table (based on available schema and codebase scan).