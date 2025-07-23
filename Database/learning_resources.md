# learning_resources

**A. Columns**
| Name        | Data type                    | Constraints                        | Notes                                      |
|-------------|-----------------------------|------------------------------------|--------------------------------------------|
| id          | integer                     | PRIMARY KEY, NOT NULL, auto-incr.  | Unique resource identifier                 |
| title       | text                        | NOT NULL                           | Resource title                             |
| description | text                        |                                    | Optional description                       |
| type        | text                        | NOT NULL                           | Resource type (e.g., pdf, video, link)     |
| url         | text                        |                                    | URL to the resource (if applicable)        |
| content     | text                        |                                    | Embedded content (if applicable)           |
| topic_id    | integer                     | FOREIGN KEY topics(id), ON DELETE SET NULL | Associated topic (nullable)        |
| is_premium  | boolean                     | DEFAULT false                      | True if resource is for premium users      |
| created_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP| Creation timestamp                         |

**B. Purpose**
The `learning_resources` table stores study materials and resources (such as PDFs, videos, links, and text content) organized by topic. It supports both free and premium content, enabling users to access curated learning materials relevant to their exam preparation.

**C. Usage in Code**
- `shared/schema.ts` – Table schema definition for backend/frontend type safety (lines 166–179)
- `server/storage.ts` – 
  - `getLearningResources(topicId?)` fetches resources, optionally filtered by topic (lines ~430–444)
- `client/src/pages/resources.tsx` – 
  - Fetches and displays resources for users, with filtering and premium access logic (entire file)
- `supabase/migrations/01_initial_schema.sql` – Table creation DDL (lines ~155–165)
- `supabase/migrations/02_rls_policies.sql` – 
  - RLS policy: allows authenticated users to view non-premium resources, premium users to view all (lines ~201–210)

**D. Related Objects**
- The `topic_id` column is a foreign key referencing `topics(id)` (ON DELETE SET NULL).
- RLS Policy: `"View non-premium learning resources"` restricts access based on user premium status.
- No views, functions, or triggers in the current schema or codebase are found to depend on `learning_resources`.
Notes:
The table is actively used in both backend and frontend code for resource management and display.
It supports both free and premium content, with access controlled by RLS policies.