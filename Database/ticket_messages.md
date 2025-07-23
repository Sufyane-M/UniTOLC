# ticket_messages

**A. Columns**
| Name         | Data type      | Constraints                          | Notes                                      |
|--------------|---------------|--------------------------------------|--------------------------------------------|
| id           | integer       | PRIMARY KEY, NOT NULL, auto-incr.    | Unique message identifier                  |
| ticket_id    | integer       | NOT NULL, FK → support_tickets(id)   | The support ticket this message belongs to  |
| user_id      | integer       | NOT NULL, FK → users(id)             | User (customer or admin) who sent message   |
| message      | text          | NOT NULL                             | The message content                        |
| is_internal  | boolean       | NOT NULL, DEFAULT false              | True if message is internal/admin-only      |
| attachments  | jsonb         | NULL                                 | JSON array of attachment metadata           |
| created_at   | timestamp     | NOT NULL, DEFAULT CURRENT_TIMESTAMP  | When the message was created                |

**B. Purpose**
The `ticket_messages` table stores individual messages exchanged within a support ticket, including both user and admin communications, as well as internal notes and optional attachments.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- **Foreign Keys**:
  - `ticket_id` references `support_tickets(id)` (the parent support ticket)
  - `user_id` references `users(id)` (the sender of the message)
- **No triggers, views, or custom functions** directly depend on this table.

Note:
This table is currently unused in the application codebase. If you plan to implement ticket conversations or threaded support, this table is ready for use.