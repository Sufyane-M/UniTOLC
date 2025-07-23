# support_tickets

**A. Columns**
| Name           | Data type                  | Constraints                                 | Notes                                             |
|----------------|---------------------------|----------------------------------------------|---------------------------------------------------|
| id             | integer                   | PRIMARY KEY, NOT NULL, auto-incr.           | Unique ticket identifier                          |
| user_id        | integer                   | NOT NULL, FK → users(id)                    | User who created the ticket                       |
| subject        | text                      | NOT NULL                                    | Ticket subject/title                              |
| description    | text                      | NOT NULL                                    | Detailed description of the issue/request         |
| status         | ticket_status (enum)      | NOT NULL, DEFAULT 'open'                    | Enum: 'open', 'pending', 'closed'                 |
| priority       | ticket_priority (enum)    | NOT NULL, DEFAULT 'medium'                  | Enum: 'low', 'medium', 'high'                     |
| assigned_to    | integer                   | NULL, FK → users(id)                        | Admin assigned to the ticket                      |
| category       | text                      | NULL                                         | Ticket category (optional)                        |
| tags           | ARRAY                     | NULL                                         | Array of tags for filtering/search                |
| has_sla_breach | boolean                   | NOT NULL, DEFAULT false                     | Whether the ticket breached SLA                   |
| created_at     | timestamp                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP         | When the ticket was created                       |
| updated_at     | timestamp                 | NOT NULL, DEFAULT CURRENT_TIMESTAMP         | Last update timestamp                             |
| closed_at      | timestamp                 | NULL                                         | When the ticket was closed (if closed)            |

**B. Purpose**
The `support_tickets` table stores user-submitted support requests, tracking their status, priority, assignment, and resolution. It enables the support/admin team to manage, prioritize, and resolve user issues efficiently.

**C. Usage in Code**
- `server/routes.ts` – API endpoints for listing, updating, and managing support tickets (lines 399+)
- `client/src/pages/admin.tsx` – Admin dashboard: fetches, displays, and updates support tickets in the "Support" tab (lines 102+, 768+)
*(No references found in user-facing pages; all usage is in admin/support context.)*

**D. Related Objects**
- **Foreign Keys**:  
  - `user_id` references `users(id)` (creator of the ticket)
  - `assigned_to` references `users(id)` (admin assigned to the ticket)
- **Enum Types**:  
  - `status` uses `ticket_status` enum (`open`, `pending`, `closed`)
  - `priority` uses `ticket_priority` enum (`low`, `medium`, `high`)
- **No triggers, views, or custom functions** directly depend on this table in the codebase.
