### api_tokens

**A. Columns**
| Name         | Data type                | Constraints                        | Notes                                         |
|--------------|-------------------------|-------------------------------------|-----------------------------------------------|
| id           | integer                 | PRIMARY KEY, NOT NULL, auto-incr.  | Unique token record ID                        |
| user_id      | integer                 | NOT NULL, FOREIGN KEY (users.id)   | User who owns the API token                   |
| token        | text                    | NOT NULL                           | The API token string (should be unique/secret)|
| created_at   | timestamp with time zone| NULLABLE, DEFAULT now()            | When the token was created                    |
| expires_at   | timestamp with time zone| NOT NULL                           | When the token expires                        |
| last_used_at | timestamp with time zone| NULLABLE, DEFAULT now()            | Last time the token was used                  |

**B. Purpose**
This table stores API tokens for users, enabling programmatic or third-party access to the platform on behalf of a user. Each token is associated with a user, has an expiration, and tracks when it was last used for security and auditing.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- **Foreign Key:**  
  - `user_id` references `users.id` (the user who owns the token)
- **No triggers, views, or functions** directly depend on this table (based on available schema and codebase scan).
