### analytics_daily_metrics

**A. Columns**
| Name                | Data type                  | Constraints                        | Notes                                         |
|---------------------|---------------------------|-------------------------------------|-----------------------------------------------|
| id                  | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique record ID                              |
| date                | date                      | NOT NULL                           | The day these metrics refer to                |
| daily_active_users  | integer                   | NOT NULL, DEFAULT 0                | Number of unique users active that day        |
| new_signups         | integer                   | NOT NULL, DEFAULT 0                | Number of new user registrations that day     |
| premium_conversions | integer                   | NOT NULL, DEFAULT 0                | Number of users who upgraded to premium       |
| total_sessions      | integer                   | NOT NULL, DEFAULT 0                | Total user sessions started that day          |
| avg_session_duration| integer                   | NOT NULL, DEFAULT 0                | Average session duration (seconds)            |
| revenue_cents       | integer                   | NOT NULL, DEFAULT 0                | Revenue for the day, in cents                 |
| churn_count         | integer                   | NOT NULL, DEFAULT 0                | Number of users who canceled premium that day |
| details             | jsonb                     | NULLABLE                           | Additional metrics or metadata (flexible)     |
| created_at          | timestamp (no timezone)   | NOT NULL, DEFAULT CURRENT_TIMESTAMP| When the record was created                   |

**B. Purpose**
This table stores daily aggregate metrics for platform analytics, including user activity, signups, premium conversions, session data, revenue, and churn. It enables trend analysis, reporting, and business intelligence for product and growth teams.

**C. Usage in Code**
- `server/routes.ts` –  
  - Lines 601–655: Used in the `/api/admin/analytics` endpoint to fetch and return daily metrics for the admin dashboard and analytics features.

**D. Related Objects**
- **No foreign keys, triggers, or functions** directly depend on this table (based on available schema and codebase scan).
