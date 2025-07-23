# tolc_section_attempts

---

**A. Columns**

| Name         | Data type           | Constraints & Defaults                                 | Notes                                                                 |
|--------------|--------------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id           | integer            | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each section attempt (serial/auto-incremented)  |
| session_id   | integer            | NOT NULL, FK → tolc_simulation_sessions(id)            | The simulation session this attempt belongs to                        |
| section_id   | integer            | NOT NULL, FK → tolc_exam_sections(id)                  | The exam section this attempt is for                                  |
| status       | character varying  | NOT NULL                                               | Status of the attempt (e.g., "in_progress", "completed")              |
| started_at   | timestamp with tz  | NULL (optional)                                        | When the attempt started                                              |
| completed_at | timestamp with tz  | NULL (optional)                                        | When the attempt was completed                                        |
| time_spent   | integer            | NULL (optional)                                        | Time spent on the section (in seconds or minutes)                     |
| score        | jsonb              | NULL, DEFAULT '{}'                                     | JSON object with scoring details (e.g., {"correct": 8, "total": 10})  |
| answers      | jsonb              | NULL, DEFAULT '{}'                                     | JSON object with user's answers (e.g., {"1": "A", "2": "C"})          |
| created_at   | timestamp with tz  | NOT NULL, DEFAULT now()                                | Timestamp when the attempt record was created                         |

---

**B. Purpose**

The `tolc_section_attempts` table records each user's attempt at a specific section within a simulation session. It tracks timing, status, answers, and scoring, enabling progress tracking, analytics, and result computation for TOLC exam simulations. This table is essential for reconstructing a user's simulation history, providing feedback, and supporting analytics on performance and engagement.

---

**C. Usage in Code**

- `client/src/pages/full-simulation.tsx`  
  – Handles section attempt records for simulations (line 267; direct Supabase query).

- `client/src/components/practice/LiveSimulation.tsx`  
  – Manages section attempts for live simulation practice (lines 140, 262, 289, 353, 412, 482; direct Supabase queries for CRUD operations).

*All references are direct, indicating the table is actively used in simulation and practice features.*

---

**D. Related Objects**

- **Foreign Keys**
  - `session_id` → `tolc_simulation_sessions(id)`  
    *Links each attempt to a simulation session, enforcing referential integrity.*
  - `section_id` → `tolc_exam_sections(id)`  
    *Links each attempt to a specific exam section, enforcing referential integrity.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) indexes on `session_id` and `section_id` for efficient lookups (standard for FK columns, though not explicitly listed)

- **Relationships**
  - Child table of `tolc_simulation_sessions` (each session can have multiple section attempts)
  - Child table of `tolc_exam_sections` (each section can have multiple attempts)
  - Used in application logic to join with sessions, sections, and possibly user analytics

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | session_id | section_id | status      | started_at                | completed_at              | time_spent | score                | answers                | created_at                |
|----|------------|------------|-------------|---------------------------|---------------------------|------------|----------------------|------------------------|---------------------------|
| 1  | 10         | 2          | completed   | 2024-06-01T12:00:00+00:00 | 2024-06-01T12:30:00+00:00 | 1800       | {"correct": 8}       | {"1": "A", "2": "C"}   | 2024-06-01T12:00:00+00:00 |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  Foreign key constraints ensure attempts are always linked to valid sessions and sections.
- **Extensibility:**  
  The use of JSONB for `score` and `answers` allows flexible storage of complex data structures.
- **Auditability:**  
  The `created_at`, `started_at`, and `completed_at` timestamps support tracking user progress and activity.
- **Usage:**  
  Central to simulation, analytics, and feedback features.

---

**G. Summary**

- **Status:** Actively used in simulation and practice code.
- **Role:** Central to tracking user progress and results in TOLC exam simulations.
- **No unused/legacy status.**
