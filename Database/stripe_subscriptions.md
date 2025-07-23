# stripe_subscriptions

**A. Columns**
| Name                   | Data type                  | Constraints                                   | Notes                                                      |
|------------------------|---------------------------|------------------------------------------------|------------------------------------------------------------|
| id                     | integer                   | PRIMARY KEY, NOT NULL, auto-increment          | Unique subscription record identifier                      |
| user_id                | integer                   | NOT NULL, FOREIGN KEY → users(id)              | Local user associated with the subscription                |
| stripe_customer_id     | text                      | NOT NULL, FOREIGN KEY → stripe_customers(stripe_customer_id) | Stripe customer identifier                                 |
| stripe_subscription_id | text                      | NOT NULL                                       | Subscription ID as defined in Stripe                       |
| stripe_price_id        | text                      | NOT NULL, FOREIGN KEY → stripe_prices(stripe_price_id) | Stripe price identifier for this subscription              |
| status                 | text                      | NOT NULL                                       | Current status (e.g., active, canceled, trialing, etc.)    |
| current_period_start   | timestamp without time zone| NOT NULL                                       | Start of the current billing period                        |
| current_period_end     | timestamp without time zone| NOT NULL                                       | End of the current billing period                          |
| cancel_at              | timestamp without time zone|                                                | Scheduled cancellation time, nullable                      |
| canceled_at            | timestamp without time zone|                                                | Actual cancellation time, nullable                         |
| trial_start            | timestamp without time zone|                                                | Trial period start, nullable                               |
| trial_end              | timestamp without time zone|                                                | Trial period end, nullable                                 |
| metadata               | jsonb                     |                                                | Additional metadata as JSON, nullable                      |
| created_at             | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP            | Record creation timestamp                                  |
| updated_at             | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP            | Last update timestamp                                      |

**B. Purpose**
The `stripe_subscriptions` table stores and tracks the lifecycle of user subscriptions as managed by Stripe. It links local users to their Stripe subscription and customer records, records the current status and billing period, and stores relevant Stripe identifiers and metadata. This enables the application to synchronize, audit, and manage subscription states and billing events.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- **Foreign Key Relationships:**
  - `user_id` → `users(id)`: Associates the subscription with a local user.
  - `stripe_customer_id` → `stripe_customers(stripe_customer_id)`: Links to the Stripe customer record.
  - `stripe_price_id` → `stripe_prices(stripe_price_id)`: Associates the subscription with a specific Stripe price.
- **No views, functions, or triggers** directly depend on `stripe_subscriptions` in the current schema.

Note:
This table is currently unused in the application codebase. If you plan to implement subscription management or Stripe integration, you may need to add logic in your backend and/or frontend to reference this table.