# stripe_prices

**A. Columns**
| Name                   | Data type                  | Constraints                                         | Notes                                                      |
|------------------------|---------------------------|-----------------------------------------------------|------------------------------------------------------------|
| id                     | integer                   | PRIMARY KEY, NOT NULL, auto-increment               | Unique price record identifier                             |
| stripe_price_id        | text                      | NOT NULL                                            | Price ID as defined in Stripe                              |
| stripe_product_id      | text                      | NOT NULL, FOREIGN KEY (stripe_products.stripe_product_id) | References the associated Stripe product                   |
| currency               | text                      | NOT NULL, DEFAULT 'eur'                             | Currency code (ISO 4217), default EUR                      |
| unit_amount_cents      | integer                   | NOT NULL                                            | Price amount in cents                                      |
| recurring_interval     | text                      |                                                     | Recurrence interval (e.g., 'month', 'year'), nullable      |
| recurring_interval_count| integer                  |                                                     | Number of intervals for recurrence, nullable               |
| active                 | boolean                   | NOT NULL, DEFAULT true                              | Whether the price is currently active                      |
| metadata               | jsonb                     |                                                     | Additional metadata as JSON, nullable                      |
| created_at             | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP                 | Record creation timestamp                                  |

**B. Purpose**
The `stripe_prices` table stores pricing information for products managed via Stripe. It maps Stripe price objects to local records, including currency, amount, recurrence details, and activation status. This enables the application to manage, display, and synchronize available subscription or product prices with Stripe.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- The `stripe_product_id` column is a foreign key referencing `stripe_products(stripe_product_id)`, establishing a relationship to the product this price belongs to.
- No views, functions, or triggers directly depend on `stripe_prices` in the current schema.

Note:
This table is currently unused in the application codebase. If you plan to implement dynamic pricing, product management, or Stripe integration, you may need to add logic in your backend and/or frontend to reference this table.