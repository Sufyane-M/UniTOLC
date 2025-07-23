# tolc_exam_sections

---

**A. Columns**

| Name           | Data type             | Constraints & Defaults                                 | Notes                                                                 |
|----------------|----------------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id             | integer              | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each section (serial/auto-incremented)          |
| exam_type_id   | integer              | NOT NULL, FOREIGN KEY → tolc_exam_types(id)            | Links to the exam type this section belongs to                        |
| code           | character varying    | NOT NULL                                               | Short code for the section (e.g., "MATH", "LOGIC")                    |
| name           | character varying    | NOT NULL                                               | Human-readable name of the section                                    |
| description    | text                 | NULL (optional)                                        | Optional longer description of the section                            |
| time_limit     | integer              | NOT NULL                                               | Time limit for this section (in minutes)                              |
| question_count | integer              | NOT NULL                                               | Number of questions in this section                                   |
| sort_order     | integer              | NOT NULL                                               | Order of this section within the exam (for display/sequencing)        |
| created_at     | timestamp with tz    | NOT NULL, DEFAULT now()                                | Timestamp when the section was created                                |

---

**B. Purpose**

The `tolc_exam_sections` table defines the structure and metadata for each section of a TOLC exam. Each row represents a distinct section (e.g., Mathematics, Logic, Verbal Reasoning) that is part of a specific exam type. This enables the application to dynamically build exams, enforce time limits, and organize questions by section.

---

**C. Usage in Code**

- `client/src/pages/full-simulation.tsx`  
  – Fetches all exam sections for building a full simulation (line 186, `.from('tolc_exam_sections')`).

- `client/src/pages/admin/tolc-questions.tsx`  
  – Used in admin interface for managing questions by section (lines 163, 198, 200; includes joins and filters on `exam_type_id`).

- `client/src/components/practice/LiveSimulation.tsx`  
  – Retrieves exam sections for live simulation practice (line 131, `.from('tolc_exam_sections')`).

*All references are direct Supabase queries, indicating the table is actively used in both student-facing and admin-facing features.*

---

**D. Related Objects**

- **Foreign Keys**
  - `exam_type_id` → `tolc_exam_types(id)`  
    *Enforces that each section is linked to a valid exam type.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) index on `exam_type_id` for efficient joins (standard for FK columns)

- **Relationships**
  - Referenced by other tables (e.g., `tolc_section_attempts` likely references this table to track user attempts per section)
  - Used in application logic to join with `tolc_exam_types` and possibly with questions or attempts

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | exam_type_id | code  | name         | description         | time_limit | question_count | sort_order | created_at                |
|----|--------------|-------|--------------|---------------------|------------|---------------|------------|---------------------------|
| 1  | 2            | MATH  | Mathematics  | Math section        | 60         | 20            | 1          | 2024-06-01T12:00:00+00:00 |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  The foreign key constraint ensures that sections cannot exist without a valid exam type.
- **Extensibility:**  
  New sections can be added for new exam types or to update exam formats without code changes.
- **Ordering:**  
  The `sort_order` column allows flexible reordering of sections for display or exam flow.
- **Auditability:**  
  The `created_at` timestamp supports tracking when sections are added.

---

**G. Summary**

- **Status:** Actively used in both frontend and admin code.
- **Role:** Central to exam structure, enabling dynamic, configurable exams.
- **No unused/legacy status.**
