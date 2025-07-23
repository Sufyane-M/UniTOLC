### analytics_cohorts

**A. Columns**
| Name           | Data type                  | Constraints                        | Notes                                         |
|----------------|---------------------------|-------------------------------------|-----------------------------------------------|
| id             | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique cohort record ID                       |
| cohort_date    | date                      | NOT NULL                           | Date representing the cohort's start/join date|
| cohort_size    | integer                   | NOT NULL                           | Number of users in the cohort                 |
| retention_data | jsonb                     | NOT NULL                           | Retention metrics (e.g., day 1/7/30 retention)|
| created_at     | timestamp (no timezone)   | NULLABLE, DEFAULT CURRENT_TIMESTAMP| When the record was created                   |

**B. Purpose**
This table stores cohort analytics for user retention and engagement. Each row represents a cohort (group of users who joined on the same date), the size of that cohort, and a JSONB object with retention data (e.g., how many users returned after 1, 7, 30 days). It is used for product analytics and growth tracking.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- **No foreign keys, triggers, or functions** directly depend on this table (based on available schema and codebase scan).
