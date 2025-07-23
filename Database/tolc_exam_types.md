# tolc_exam_types

---

**A. Columns**

| Name           | Data type             | Constraints & Defaults                                 | Notes                                                                 |
|----------------|----------------------|--------------------------------------------------------|-----------------------------------------------------------------------|
| id             | integer              | PRIMARY KEY, NOT NULL, DEFAULT nextval(...), auto-inc. | Unique identifier for each exam type (serial/auto-incremented)        |
| code           | character varying    | NOT NULL                                               | Short code for the exam type (e.g., "TOLC-I", "TOLC-E")               |
| name           | character varying    | NOT NULL                                               | Human-readable name of the exam type                                  |
| description    | text                 | NULL (optional)                                        | Optional longer description of the exam type                          |
| total_duration | integer              | NOT NULL                                               | Total duration of the exam (in minutes)                               |
| total_sections | integer              | NOT NULL                                               | Number of sections in this exam type                                  |
| created_at     | timestamp with tz    | NOT NULL, DEFAULT now()                                | Timestamp when the exam type was created                              |

---

**B. Purpose**

The `tolc_exam_types` table defines the master list of available TOLC exam types. Each row represents a distinct exam format (e.g., TOLC-I, TOLC-E), including its code, name, description, total duration, and number of sections. This enables the application to dynamically configure exams, associate sections, and manage exam templates.

---

**C. Usage in Code**

- `client/src/pages/full-simulation.tsx`  
  – Fetches all exam types for building a full simulation (line 167, `.from('tolc_exam_types')`).

- `client/src/pages/admin/tolc-questions.tsx`  
  – Used in admin interface for managing questions by exam type (line 131, `.from('tolc_exam_types')`).

- `client/src/components/practice/LiveSimulation.tsx`  
  – Retrieves exam types for live simulation practice (line 122, `.from('tolc_exam_types')`).

*All references are direct Supabase queries, indicating the table is actively used in both student-facing and admin-facing features.*

---

**D. Related Objects**

- **Foreign Keys**
  - Referenced by `tolc_exam_sections.exam_type_id`  
    *Each section is linked to a valid exam type, enforcing referential integrity.*

- **Indexes**
  - Primary key index on `id`
  - (Likely) index on `code` for fast lookups (standard for code columns, though not explicitly listed)

- **Relationships**
  - Parent table for `tolc_exam_sections` (sections are grouped under an exam type)
  - Indirectly related to user attempts, simulations, and question management via sections

- **Triggers, Views, Functions**
  - No triggers, views, or custom SQL functions directly reference this table (based on codebase and SQL search).

---

**E. Example Row**

| id | code   | name         | description         | total_duration | total_sections | created_at                |
|----|--------|--------------|---------------------|----------------|----------------|---------------------------|
| 1  | TOLC-I | TOLC Ingegneria | Engineering exam type | 120            | 4              | 2024-06-01T12:00:00+00:00 |

---

**F. Notes & Best Practices**

- **Data Integrity:**  
  The table acts as the authoritative source for exam types, ensuring all sections and related data reference valid types.
- **Extensibility:**  
  New exam types can be added without code changes, supporting future exam formats.
- **Auditability:**  
  The `created_at` timestamp supports tracking when exam types are added or modified.
- **Usage:**  
  Central to exam configuration, simulation, and admin management features.

---

**G. Summary**

- **Status:** Actively used in both frontend and admin code.
- **Role:** Central to exam structure, enabling dynamic, configurable exams.
- **No unused/legacy status.**
