# stripe_products

**A. Columns**
| Name             | Data type                  | Constraints                        | Notes                                         |
|------------------|---------------------------|------------------------------------|-----------------------------------------------|
| id               | integer                    | PRIMARY KEY, NOT NULL, auto-increment | Unique product record identifier           |
| stripe_product_id| text                       | NOT NULL                           | Product ID as defined in Stripe                |
| name             | text                       | NOT NULL                           | Product name                                  |
| description      | text                       |                                    | Product description, nullable                 |
| active           | boolean                    | NOT NULL, DEFAULT true             | Whether the product is currently active        |
| metadata         | jsonb                      |                                    | Additional metadata as JSON, nullable         |
| created_at       | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP| Record creation timestamp                     |

**B. Purpose**
The `stripe_products` table stores product information synchronized with Stripe. It maps Stripe product objects to local records, including name, description, activation status, and metadata. This enables the application to manage, display, and synchronize available products with Stripe for billing and subscription purposes.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- The `stripe_products` table is referenced by the `stripe_prices` table via the `stripe_product_id` foreign key, establishing a relationship between products and their prices.
- No views, functions, or triggers directly depend on `stripe_products` in the current schema.

Note:
This table is currently unused in the application codebase. If you plan to implement product management or Stripe integration, you may need to add logic in your backend and/or frontend to reference this table.