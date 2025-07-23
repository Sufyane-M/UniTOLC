# user_coupon_redemptions

---

**A. Columns**

| Name                   | Data type | Constraints & Defaults                                 | Notes                                                                 |
|------------------------|-----------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id                     | integer   | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each redemption record (serial/auto-incremented)|
| user_id                | integer   | NOT NULL, FK → users(id)                               | The user who redeemed the coupon                                      |
| stripe_coupon_id       | text      | NOT NULL, FK → stripe_coupons(stripe_coupon_id)        | The Stripe coupon that was redeemed                                   |
| stripe_subscription_id | text      | NULL, FK → stripe_subscriptions(stripe_subscription_id)| The Stripe subscription associated with the redemption (if any)       |
| redeemed_at            | timestamp | NOT NULL, DEFAULT CURRENT_TIMESTAMP                    | Timestamp when the coupon was redeemed                                |

---

**B. Purpose**

The `user_coupon_redemptions` table records when a user redeems a Stripe coupon, supporting tracking, analytics, and enforcement of coupon usage for subscriptions and promotions. It enables the application to prevent duplicate redemptions, audit coupon usage, and link redemptions to specific subscriptions for billing and support.

---

**C. Usage in Code**

❗ Not referenced in the codebase.

*No direct or indirect usage was found in frontend, backend, scripts, tests, or configuration files. This table is currently unused.*

---

**D. Related Objects**

- **Foreign Keys**
  - `user_id` → `users(id)`  
    *Links each redemption to a valid user, enforcing referential integrity.*
  - `stripe_coupon_id` → `stripe_coupons(stripe_coupon_id)`  
    *Links each redemption to a valid Stripe coupon, enforcing referential integrity.*
  - `stripe_subscription_id` → `stripe_subscriptions(stripe_subscription_id)`  
    *Links each redemption to a valid Stripe subscription, if applicable.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) indexes on `user_id`, `stripe_coupon_id`, and `stripe_subscription_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Relationships**
  - Intended to be used with users, Stripe coupons, and Stripe subscriptions for billing, analytics, and support
  - Could be referenced by future features for coupon management, reporting, or fraud prevention

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | user_id | stripe_coupon_id | stripe_subscription_id | redeemed_at           |
|----|---------|------------------|-----------------------|-----------------------|
| 1  | 42      | "promo2024"      | "sub_123456789"       | 2024-06-01T12:00:00   |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  Foreign key constraints ensure redemptions are always linked to valid users, coupons, and (optionally) subscriptions.
- **Extensibility:**  
  The table is ready for future features such as coupon usage limits, reporting, or integration with other billing systems.
- **Auditability:**  
  The `redeemed_at` timestamp supports tracking coupon usage over time for analytics and support.
- **Usage:**  
  Currently unused, but well-structured for robust coupon redemption tracking.

---

**G. Summary**

- **Status:** Not referenced in the codebase (❗ unused table).
- **Role:** Intended for tracking user coupon redemptions, supporting billing, analytics, and fraud prevention.
- **No triggers, views, or functions** depend on this table.
