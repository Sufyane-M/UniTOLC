# stripe_coupons

**A. Columns**
| Name              | Data type                  | Constraints                        | Notes                                         |
|-------------------|---------------------------|------------------------------------|-----------------------------------------------|
| id                | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique coupon record identifier               |
| stripe_coupon_id  | text                      | NOT NULL                           | Coupon ID as defined in Stripe                |
| code              | text                      | NOT NULL                           | Human-readable coupon code                    |
| amount_off_cents  | integer                   |                                    | Fixed discount amount in cents (optional)     |
| percent_off       | smallint                  |                                    | Percentage discount (optional)                |
| duration          | text                      | NOT NULL                           | Duration type (e.g., 'once', 'repeating')     |
| duration_in_months| integer                   |                                    | Number of months for repeating coupons        |
| max_redemptions   | integer                   |                                    | Maximum number of redemptions (optional)      |
| times_redeemed    | integer                   | NOT NULL, DEFAULT 0                | Number of times this coupon has been redeemed |
| valid_from        | timestamp without time zone|                                   | When the coupon becomes valid (optional)      |
| valid_until       | timestamp without time zone|                                   | When the coupon expires (optional)            |
| created_at        | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP| Record creation timestamp                     |

**B. Purpose**
The `stripe_coupons` table stores metadata and configuration for promotional coupons that can be redeemed by users for discounts on paid plans or purchases. It tracks both Stripe's coupon identifiers and local usage, supporting both fixed and percentage discounts, redemption limits, and validity periods.

**C. Usage in Code**
❗ Not referenced in the codebase.

**D. Related Objects**
- No views, functions, or triggers directly depend on `stripe_coupons` in the current schema.

Note:
This table is currently unused in the application codebase. If you plan to implement coupon functionality, you may need to add logic in your backend and/or frontend to reference this table.