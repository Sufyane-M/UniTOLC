# tolc_simulation_sessions

---

**A. Columns**

| Name         | Data type           | Constraints & Defaults                                 | Notes                                                                 |
|--------------|--------------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id           | integer            | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each simulation session (serial/auto-increment) |
| user_id      | uuid               | NOT NULL                                               | The user who owns this simulation session                             |
| exam_type_id | integer            | NOT NULL, FK → tolc_exam_types(id)                     | The exam type for this simulation session                             |
| status       | character varying  | NOT NULL                                               | Status of the session (e.g., "in_progress", "completed")              |
| started_at   | timestamp with tz  | NOT NULL, DEFAULT now()                                | When the session started                                              |
| completed_at | timestamp with tz  | NULL (optional)                                        | When the session was completed                                        |
| metadata     | jsonb              | NULL, DEFAULT '{}'                                     | Additional session metadata (e.g., settings, config)                  |
| created_at   | timestamp with tz  | NOT NULL, DEFAULT now()                                | Timestamp when the session record was created                         |

---

**B. Purpose**

The `tolc_simulation_sessions` table records each user's simulation session for a TOLC exam, tracking the exam type, timing, status, and additional metadata. It enables users to start, resume, and review simulated exam attempts, and supports analytics, progress tracking, and personalized exam experiences.

---

**C. Usage in Code**

- `client/src/pages/full-simulation.tsx`  
  – Handles simulation session records (lines 209, 235, 298; direct Supabase queries for CRUD operations).

- `client/src/components/practice/LiveSimulation.tsx`  
  – Manages simulation sessions for live practice (line 471; direct Supabase query).

*All references are direct, indicating the table is actively used in simulation and practice features.*

---

**D. Related Objects**

- **Foreign Keys**
  - `exam_type_id` → `tolc_exam_types(id)`  
    *Links each session to a valid exam type, enforcing referential integrity.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) index on `exam_type_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Relationships**
  - Parent table for `tolc_section_attempts` (each session can have multiple section attempts)
  - Used in application logic to join with exam types, sections, and user analytics

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | user_id (uuid)                        | exam_type_id | status      | started_at                | completed_at              | metadata           | created_at                |
|----|---------------------------------------|--------------|-------------|---------------------------|---------------------------|---------------------|---------------------------|
| 1  | 123e4567-e89b-12d3-a456-426614174000  | 2            | completed   | 2024-06-01T12:00:00+00:00 | 2024-06-01T14:00:00+00:00 | {"mode": "timed"}  | 2024-06-01T12:00:00+00:00 |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  The foreign key constraint on `exam_type_id` ensures sessions are always linked to valid exam types.
- **Extensibility:**  
  The use of JSONB for `metadata` allows flexible storage of additional session data (e.g., settings, custom configs).
- **Auditability:**  
  The `created_at`, `started_at`, and `completed_at` timestamps support tracking user progress and activity.
- **Usage:**  
  Central to simulation, analytics, and feedback features.

---

**G. Summary**

- **Status:** Actively used in simulation and practice code.
- **Role:** Central to tracking user simulation sessions and results in TOLC exam simulations.
- **No unused/legacy status.**
