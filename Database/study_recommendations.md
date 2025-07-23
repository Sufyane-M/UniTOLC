# study_recommendations

**A. Columns**
| Name       | Data type                  | Constraints                                   | Notes                                         |
|------------|---------------------------|------------------------------------------------|-----------------------------------------------|
| id         | integer                   | PRIMARY KEY, NOT NULL, auto-increment          | Unique recommendation record identifier       |
| user_id    | integer                   | NOT NULL, FOREIGN KEY → users(id)              | User receiving the recommendation             |
| topic_id   | integer                   | NOT NULL, FOREIGN KEY → topics(id)             | Topic the recommendation refers to            |
| priority   | text                      | NOT NULL                                       | Priority level (e.g., alta, media, bassa)     |
| reason     | text                      |                                                | Explanation for the recommendation, nullable  |
| created_at | timestamp without time zone| NOT NULL, DEFAULT CURRENT_TIMESTAMP            | When the recommendation was created           |

**B. Purpose**
The `study_recommendations` table stores personalized study suggestions for users, each linked to a specific topic. Recommendations are prioritized and may include a reason, helping guide users toward areas where focused study is most beneficial.

**C. Usage in Code**
- `client/src/components/dashboard/StudyRecommendations.tsx` – UI component for displaying study recommendations on the dashboard.
- `shared/schema.ts` – Table schema and TypeScript type definition.
- `server/storage.ts` – `getStudyRecommendations(userId)` function fetches recommendations for a user.
- `supabase/migrations/01_initial_schema.sql` – Table creation in initial schema migration.
- `supabase/migrations/02_rls_policies.sql` – Row-level security policy for user access.

**D. Related Objects**
- **Foreign Key Relationships:**
  - `user_id` → `users(id)`: Associates the recommendation with a user.
  - `topic_id` → `topics(id)`: Associates the recommendation with a topic.
- **Row-Level Security Policy:**  
  - `"Users can view their recommendations"`: Restricts access so users can only view their own recommendations.

_No views, functions, or triggers directly depend on `study_recommendations` in the current schema._