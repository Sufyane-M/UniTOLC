# subscription (realtime)

**A. Columns**
| Name            | Data type                  | Constraints                | Notes                                                      |
|-----------------|---------------------------|----------------------------|------------------------------------------------------------|
| id              | bigint                    | NOT NULL                   | Internal unique identifier                                 |
| subscription_id | uuid                      | NOT NULL                   | Unique identifier for the subscription                     |
| entity          | regclass                  | NOT NULL                   | The database entity (table/class) this subscription targets |
| filters         | ARRAY (user_defined_filter)| NOT NULL, DEFAULT '{}'     | Array of filters for the subscription                      |
| claims          | jsonb                     | NOT NULL                   | JWT claims for access control                              |
| claims_role     | regrole                   | NOT NULL                   | Database role for the claims                               |
| created_at      | timestamp without time zone| NOT NULL, DEFAULT now()    | Timestamp of subscription creation (UTC)                   |

**B. Purpose**
The `subscription` table in the `realtime` schema tracks active realtime subscriptions for database changes. Each row represents a client or process subscribing to changes (e.g., INSERT/UPDATE/DELETE) on a specific table or entity, with associated filters and access control claims. This enables the Supabase Realtime engine to deliver live updates to connected clients.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- No views, functions, or triggers in the user codebase directly depend on this table.
- This table is managed internally by the Supabase Realtime engine for handling websocket subscriptions and is not intended for direct application use.