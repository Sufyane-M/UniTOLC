# tolc_question_cycles

---

**A. Columns**

| Name                | Data type             | Constraints & Defaults                                 | Notes                                                                 |
|---------------------|---------------------- |--------------------------------------------------------|-----------------------------------------------------------------------|
| id                  | integer               | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each question cycle (serial/auto-incremented)   |
| user_id             | uuid                  | NOT NULL                                               | The user this cycle belongs to (references users table, not FK)       |
| section_id          | integer               | NOT NULL, FK → tolc_exam_sections(id)                  | The exam section this cycle is associated with                        |
| unseen_question_ids | integer[] (ARRAY)     | NOT NULL, DEFAULT '{}'                                 | Array of question IDs not yet seen by the user in this cycle          |
| seen_question_ids   | integer[] (ARRAY)     | NOT NULL, DEFAULT '{}'                                 | Array of question IDs already seen by the user in this cycle          |
| cycle               | integer               | NOT NULL, DEFAULT 1                                    | The current cycle number (e.g., for spaced repetition)                |
| last_updated        | timestamp with tz     | NOT NULL, DEFAULT now()                                | When this cycle was last updated                                      |
| created_at          | timestamp with tz     | NOT NULL, DEFAULT now()                                | When this cycle was created                                           |

---

**B. Purpose**

The `tolc_question_cycles` table is designed to track a user's progress through cycles of questions for a specific exam section. Each row represents a unique user-section pair and stores which questions have been seen or remain unseen, supporting features such as spaced repetition, adaptive practice, or personalized study sessions. The `cycle` column allows for multiple rounds of question review, and the arrays enable efficient tracking of question exposure.

---

**C. Usage in Code**

❗ Not referenced in the codebase.

*No direct or indirect usage was found in frontend, backend, scripts, tests, or configuration files. This table is currently unused.*

---

**D. Related Objects**

- **Foreign Keys**
  - `section_id` → `tolc_exam_sections(id)`  
    *Links each cycle to a specific exam section, enforcing referential integrity.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) index on `section_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Relationships**
  - Intended to be related to users (by `user_id`) and exam sections (by `section_id`)
  - Could be referenced by future features for personalized learning or analytics

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | user_id (uuid)                        | section_id | unseen_question_ids | seen_question_ids | cycle | last_updated                | created_at                  |
|----|---------------------------------------|------------|--------------------|-------------------|-------|-----------------------------|-----------------------------|
| 1  | 123e4567-e89b-12d3-a456-426614174000  | 2          | {101,102,103}      | {104,105}         | 1     | 2024-06-01T12:00:00+00:00   | 2024-06-01T11:00:00+00:00   |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  The foreign key constraint on `section_id` ensures cycles are always linked to valid exam sections.
- **Extensibility:**  
  The table is ready for future features such as adaptive learning, spaced repetition, or analytics.
- **Auditability:**  
  The `last_updated` and `created_at` timestamps support tracking user progress and activity.
- **Usage:**  
  Currently unused, but well-structured for advanced learning features.

---

**G. Summary**

- **Status:** Not referenced in the codebase (❗ unused table).
- **Role:** Intended for tracking user question cycles, supporting personalized learning.
- **No triggers, views, or functions** depend on this table.
