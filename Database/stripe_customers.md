# stripe_customers

**A. Columns**
| Name              | Data type                  | Constraints                        | Notes                                         |
|-------------------|---------------------------|------------------------------------|-----------------------------------------------|
| id                | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique customer record identifier             |
| user_id           | integer                   | NOT NULL, FOREIGN KEY (users.id)   | References the local user                     |
| stripe_customer_id| text                      | NOT NULL                           | Customer ID as defined in Stripe              |
| payment_methods   | jsonb                     |                                    | JSON array of payment methods (optional)      |
| created_at        | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP| Record creation timestamp                     |
| updated_at        | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP| Last update timestamp                         |

**B. Purpose**
The `stripe_customers` table stores the mapping between local users and their corresponding customer records in Stripe. It is used to associate users with their Stripe customer IDs and store related payment method information for billing and subscription management.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- No views, functions, or triggers directly depend on `stripe_customers` in the current schema.
Note:
This table is currently unused in the application codebase. If you plan to implement Stripe customer management, you may need to add logic in your backend and/or frontend to reference this table.