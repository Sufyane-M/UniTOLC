# questions_unified

**A. Columns**
| Name | Data type | Constraints | Notes |
|------|-----------|-------------|-------|
| id | integer | PRIMARY KEY, NOT NULL, AUTO INCREMENT | Primary key with sequence nextval('questions_unified_id_seq'::regclass) |
| topic_id | integer | NULLABLE, FOREIGN KEY → topics(id) | Links question to a specific topic |
| section_id | integer | NULLABLE, FOREIGN KEY → tolc_exam_sections(id) | Links question to a TOLC exam section |
| text | text | NOT NULL | The question text/content |
| options | jsonb | NOT NULL | Multiple choice options stored as JSON |
| correct_answer | text | NOT NULL | The correct answer identifier |
| explanation | text | NULLABLE | Optional explanation for the answer |
| difficulty | character varying | NULLABLE | Difficulty level (e.g., 'easy', 'medium', 'hard') |
| is_premium | boolean | NOT NULL, DEFAULT false | Whether question requires premium access |
| active | boolean | NOT NULL, DEFAULT true | Whether question is active/enabled |
| image_url | text | NULLABLE | Optional image URL for visual questions |
| image_alt_text | text | NULLABLE | Alt text for accessibility |
| created_at | timestamp with time zone | NOT NULL, DEFAULT now() | Creation timestamp |

**B. Purpose**
The `questions_unified` table serves as a centralized repository for all questions in the system, unifying previously separate question tables for both standard topic-based questions and TOLC exam section questions. It enables dynamic question management, randomization, and delivery across simulations, practice sessions, and administrative interfaces. The table supports both topic-based categorization (via `topic_id`) and section-based organization (via `section_id`) for TOLC exams, providing flexibility for different question types while maintaining a consistent data structure.

**C. Usage in Code**
- `shared/schema.ts` – TypeScript schema definition and type exports (lines 98-99)
- `server/routes/api/admin.ts` – Admin API endpoints for CRUD operations (lines 69, 155, 229, 241, 272, 284)
- `client/src/components/admin/TOLCQuestionForm.tsx` – Admin form component for question management (lines 85, 226, 239)
- `client/src/pages/TolcQuestionsPage.tsx` – Admin page for managing TOLC questions (referenced via API endpoints)
- `server/storage.ts` – Storage layer methods for question retrieval (lines 221, 231)

**D. Related Objects**
- **get_subjects_with_question_counts** (function) – Aggregates question counts by subject, joining through topics
- **get_tolc_sections_with_question_counts** (function) – Returns TOLC exam sections with actual question counts from this table
- **get_topic_questions** (function) – Retrieves randomized questions filtered by topic and difficulty
- **get_randomized_tolc_questions** (function) – Returns randomized questions for TOLC exam sections, respecting question count limits per section

## **E. Detailed Relationship Analysis**

### **topic_id → topics Table Connection**
The `topic_id` column establishes a **many-to-one relationship** with the `topics` table, creating a hierarchical content organization:

**Relationship Chain:**
```
subjects (id) ← topics (subject_id) ← questions_unified (topic_id)
```

**Topics Table Structure:**
- `id` (integer, PRIMARY KEY) - Referenced by questions_unified.topic_id
- `subject_id` (integer, FOREIGN KEY → subjects.id) - Links to parent subject
- `name` (text, NOT NULL) - Topic name (e.g., "Algebra", "Trigonometria")
- `description` (text, NULLABLE) - Optional topic description
- `created_at` (timestamp) - Creation timestamp

**Subjects Table Structure:**
- `id` (integer, PRIMARY KEY) - Referenced by topics.subject_id
- `name` (text, NOT NULL) - Subject name (e.g., "Matematica TOLC-I", "Logica TOLC-I")
- `description` (text, NULLABLE) - Optional subject description
- `exam_type` (USER-DEFINED) - Exam type classification
- `created_at` (timestamp) - Creation timestamp

**Real Data Example:**
```sql
-- Question: "Risolvi l'equazione: 2x² - 5x + 3 = 0"
questions_unified.topic_id = 22 
  → topics.name = "Algebra" (id: 22, subject_id: 8)
    → subjects.name = "Matematica TOLC-I" (id: 8)
```

### **section_id → tolc_exam_sections Table Connection**
The `section_id` column provides an **alternative categorization** for TOLC-specific questions:

**TOLC Exam Sections Table Structure:**
- `id` (integer, PRIMARY KEY) - Referenced by questions_unified.section_id
- `exam_type_id` (integer, FOREIGN KEY → tolc_exam_types.id)
- `code` (varchar, NOT NULL) - Section code identifier
- `name` (varchar, NOT NULL) - Section name
- `description` (text, NULLABLE) - Section description
- `time_limit` (integer, NOT NULL) - Time limit in minutes
- `question_count` (integer, NOT NULL) - Expected number of questions
- `sort_order` (integer, NOT NULL) - Display order
- `created_at` (timestamp) - Creation timestamp

### **Dual Classification System**
Questions can be classified in two ways:
1. **Topic-based** (topic_id): For general study and practice sessions
2. **Section-based** (section_id): For TOLC exam simulations

This dual system allows:
- **Flexible content organization** by academic topics
- **Structured exam delivery** following TOLC format requirements
- **Cross-referencing** between study topics and exam sections
- **Analytics and reporting** at both topic and section levels

### **Database Functions Leveraging These Relationships**
- `get_subjects_with_question_counts`: Joins subjects → topics → questions_unified to count questions per subject
- `get_topic_questions`: Filters questions by topic_id for study sessions
- `get_randomized_tolc_questions`: Uses section_id to build structured TOLC exams
- `get_tolc_sections_with_question_counts`: Aggregates actual question counts per section

The table serves as the backbone for the application's question management system, supporting both educational content delivery and administrative oversight through a unified data structure with flexible categorization options.
        