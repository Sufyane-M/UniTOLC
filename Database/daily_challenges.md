# daily_challenges

**A. Columns**
| Name        | Data type                    | Constraints                        | Notes                                      |
|-------------|-----------------------------|------------------------------------|--------------------------------------------|
| id          | integer                     | PRIMARY KEY, NOT NULL, auto-incr.  | Unique challenge identifier                |
| title       | text                        | NOT NULL                           | Challenge title                            |
| description | text                        | NOT NULL                           | Challenge description                      |
| type        | text                        | NOT NULL                           | E.g., quiz, flashcard, studio, etc.        |
| target_id   | integer                     |                                    | ID of related quiz/resource (nullable)     |
| xp_reward   | integer                     | NOT NULL                           | XP awarded for completion                  |
| date        | date                        | NOT NULL                           | Date the challenge is available            |
| difficulty  | USER-DEFINED (difficulty)   | NOT NULL, DEFAULT 'media'          | Enum: facile, media, difficile             |
| created_at  | timestamp without time zone | NOT NULL, DEFAULT CURRENT_TIMESTAMP| Creation timestamp                         |

**B. Purpose**
The `daily_challenges` table stores the definition of daily challenges presented to users. Each record represents a unique challenge available on a specific date, with metadata such as type, difficulty, XP reward, and an optional link to a target resource (e.g., a quiz). This enables the platform to motivate and engage users with daily tasks that reward experience points upon completion.

**C. Usage in Code**
- `shared/schema.ts` – Table schema definition for backend/frontend type safety (lines 145–155)
- `server/storage.ts` – 
  - `getDailyChallenges(date)` fetches challenges for a given date (lines ~364–370)
  - `completeChallenge(userId, challengeId)` awards XP and marks a challenge as completed (lines ~375–410)
  - `getUserCompletedChallenges(userId, date)` joins with `daily_challenges` to fetch completed challenges (lines ~411–430)
- `server/routes.ts` – 
  - `/api/daily-challenges` GET: returns today’s challenges with completion status (lines ~312–336)
  - `/api/daily-challenges/:id/complete` POST: marks a challenge as completed (lines ~340–357)
- `client/src/components/dashboard/DailyChallenge.tsx` – 
  - Fetches and displays daily challenges, allows completion, and shows XP rewards (entire file)
- `client/src/pages/dashboard.tsx` – 
  - Imports and renders the `DailyChallenge` component in the dashboard (lines ~1, ~44)
- `supabase/migrations/01_initial_schema.sql` – Table creation DDL (lines ~108–118)
- `supabase/migrations/02_rls_policies.sql` – RLS policy: allows authenticated users to view daily challenges (lines ~51, ~151)
- `client/src/pages/admin.tsx` – 
  - Option in a select input for challenge type (line ~464, value: "daily_challenge")

**D. Related Objects**
- **user_challenge_completions** (table):  
  - Stores which users have completed which daily challenges. Has a foreign key to `daily_challenges(id)` (ON DELETE CASCADE).
- **RLS Policy**:  
  - `"Anyone can view daily challenges"`: Allows all authenticated users to select from this table.
- **No triggers or views** directly reference `daily_challenges` (based on available schema and migration files).
