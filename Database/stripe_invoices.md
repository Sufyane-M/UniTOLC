# stripe_invoices

**A. Columns**
| Name                  | Data type                  | Constraints                                   | Notes                                                      |
|-----------------------|---------------------------|-----------------------------------------------|------------------------------------------------------------|
| id                    | integer                   | PRIMARY KEY, NOT NULL, auto-increment         | Unique invoice record identifier                           |
| user_id               | integer                   | NOT NULL, FOREIGN KEY (users.id)              | References the local user                                  |
| stripe_invoice_id     | text                      | NOT NULL                                      | Invoice ID as defined in Stripe                            |
| stripe_subscription_id| text                      | FOREIGN KEY (stripe_subscriptions.stripe_subscription_id) | Stripe subscription ID (nullable)                          |
| amount_cents          | integer                   | NOT NULL                                      | Invoice amount in cents                                    |
| currency              | text                      | NOT NULL, DEFAULT 'eur'                       | Currency code (ISO 4217), default EUR                      |
| status                | text                      | NOT NULL                                      | Invoice status (e.g., 'paid', 'open', 'void', etc.)        |
| hosted_invoice_url    | text                      |                                               | URL to the hosted Stripe invoice (nullable)                |
| pdf_invoice_url       | text                      |                                               | URL to the PDF version of the invoice (nullable)           |
| payment_intent_id     | text                      |                                               | Stripe PaymentIntent ID (nullable)                         |
| created_at            | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP           | Record creation timestamp                                  |

**B. Purpose**
The `stripe_invoices` table stores metadata and references for invoices generated via Stripe for user payments. It links local users to their Stripe invoices, tracks amounts, status, and provides URLs for invoice access and download. This enables billing history, payment tracking, and integration with Stripe's invoicing system.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- The `stripe_subscription_id` column is a foreign key referencing `stripe_subscriptions(stripe_subscription_id)`, establishing a relationship to the subscription associated with the invoice.
- No views, functions, or triggers directly depend on `stripe_invoices` in the current schema.

Note:
This table is currently unused in the application codebase. If you plan to implement invoice management or display billing history, you may need to add logic in your backend and/or frontend to reference this table.