# exam_sessions

**A. Columns**
| Name         | Data type                  | Constraints                        | Notes                                 |
|--------------|---------------------------|------------------------------------|---------------------------------------|
| id           | integer                   | PRIMARY KEY, NOT NULL, auto-incr.  | Unique session identifier             |
| user_id      | integer                   | NOT NULL, FOREIGN KEY users(id)    | User who owns the session             |
| exam_type    | character varying         | NOT NULL, DEFAULT 'TOLC-I'         | Type of exam (e.g., TOLC-I, TOLC-E)   |
| status       | character varying         | NOT NULL, DEFAULT 'created'        | Session status (created, in_progress, completed) |
| metadata     | jsonb                     | DEFAULT '{}'                       | Session metadata (sections, scores, etc.) |
| started_at   | timestamp with time zone  | NOT NULL, DEFAULT now()            | When the session started              |
| updated_at   | timestamp with time zone  | NOT NULL, DEFAULT now()            | Last update timestamp                 |
| completed_at | timestamp with time zone  |                                    | When the session was completed        |

**B. Purpose**
The `exam_sessions` table stores information about each user's exam simulation session. It tracks the session's lifecycle (creation, progress, completion), the type of exam, associated metadata (such as section progress and scores), and timestamps for auditing and analytics. This enables users to simulate official exams, track their progress, and review results.

**C. Usage in Code**
- `server/routes.ts` –  
  - `/api/exam-simulation/sessions` POST: Create a new exam simulation session (lines ~1508–1558)  
  - `/api/exam-simulation/sessions/:id` GET: Fetch a session by ID (lines ~1560–1590)  
  - `/api/exam-simulation/sessions/:id/sections/:sectionId/start` POST: Start a section in a session (lines ~1617–1812)  
  - `/api/exam-simulation/sessions/:id/sections/:sectionId/complete` POST: Complete a section and update session (lines ~1815–1910)  
  - `/api/exam-simulation/sessions/:id/results` GET: Fetch results for a completed session (lines ~1912–1960)  
  - `/api/exam-simulation/history` GET: Fetch all completed sessions for a user (lines ~1962–2010)
- `client/src/pages/full-simulation.tsx` –  
  - Handles simulation session state, but uses `tolc_simulation_sessions` (not `exam_sessions`) for actual data storage (lines ~86–227)
- `client/src/components/practice/LiveSimulation.tsx` –  
  - Uses `tolc_simulation_sessions` for session data, not `exam_sessions`
- `supabase/migrations/01_initial_schema.sql` –  
  - Table creation DDL (lines not shown, but inferred from schema)
- *(No other direct references found in frontend or shared code)*

**D. Related Objects**
- No views, functions, or triggers in the current schema or codebase are found to depend on `exam_sessions`.
- The `user_id` column is a foreign key referencing `users(id)`.
Notes:
The table is actively used in backend API endpoints for exam simulation session management.
The frontend currently uses a different table (tolc_simulation_sessions) for live simulation features, so exam_sessions may be legacy, experimental, or reserved for future use.
No triggers, views, or functions directly depend on exam_sessions in the current schema.