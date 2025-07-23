### admin_impersonation_sessions

**A. Columns**
| Name        | Data type                  | Constraints                        | Notes                                         |
|-------------|---------------------------|-------------------------------------|-----------------------------------------------|
| id          | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique session ID                             |
| admin_id    | integer                   | NOT NULL, FOREIGN KEY (users.id)   | Admin user who is impersonating               |
| user_id     | integer                   | NOT NULL, FOREIGN KEY (users.id)   | User being impersonated                       |
| start_time  | timestamp (no timezone)   | NOT NULL, DEFAULT CURRENT_TIMESTAMP| When impersonation started                    |
| end_time    | timestamp (no timezone)   | NULLABLE                           | When impersonation ended                      |
| reason      | text                      | NOT NULL                           | Reason for impersonation                      |
| is_read_only| boolean                   | NOT NULL, DEFAULT true             | If session is read-only                       |
| ip_address  | text                      | NULLABLE                           | IP address of the admin                       |
| user_agent  | text                      | NULLABLE                           | User agent string of the admin's browser      |
| created_at  | timestamp (no timezone)   | NOT NULL, DEFAULT CURRENT_TIMESTAMP| Record creation timestamp                     |

**B. Purpose**
This table records all admin impersonation sessions, tracking which admin impersonated which user, when, why, and from where. It is essential for auditability, security, and compliance, ensuring all impersonation actions are logged and traceable.

**C. Usage in Code**
- `server/routes.ts` –  
  - Lines 516–574:  
    - Insert: When an admin starts impersonating a user (`/api/admin/impersonate/:userId`), a new session is created in this table.
    - Update: When impersonation ends (`/api/admin/stop-impersonation`), the session's `end_time` is set.
    - Session info is also stored in the Express session object for tracking.
- `client/src/pages/admin.tsx` –  
  - Lines 102–1055:  
    - The admin dashboard provides UI and logic for starting and stopping impersonation, which triggers the above backend endpoints.

**D. Related Objects**
- **Foreign Keys:**  
  - `admin_id` references `users.id` (the admin performing impersonation)
  - `user_id` references `users.id` (the user being impersonated)
- **No triggers, views, or functions** directly depend on this table (based on available schema and codebase scan).
