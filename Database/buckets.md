# buckets

**A. Columns**
| Name               | Data type                  | Constraints                | Notes                                 |
|--------------------|---------------------------|----------------------------|---------------------------------------|
| id                 | text                      | NOT NULL                   | Unique bucket identifier              |
| name               | text                      | NOT NULL                   | Human-readable bucket name            |
| owner              | uuid                      | NULLABLE                   | Deprecated; use `owner_id` instead    |
| created_at         | timestamp with time zone  | NULLABLE, default now()    | Creation timestamp                    |
| updated_at         | timestamp with time zone  | NULLABLE, default now()    | Last update timestamp                 |
| public             | boolean                   | NULLABLE, default false    | If true, bucket is public             |
| avif_autodetection | boolean                   | NULLABLE, default false    | AVIF image autodetection enabled      |
| file_size_limit    | bigint                    | NULLABLE                   | Max file size allowed in bytes        |
| allowed_mime_types | ARRAY                     | NULLABLE                   | List of allowed MIME types            |
| owner_id           | text                      | NULLABLE                   | New owner field (supersedes `owner`)  |

**B. Purpose**
The `buckets` table is part of the Supabase Storage system. It stores metadata about storage buckets, which are logical containers for organizing and managing files (objects) uploaded to the platform. Each bucket can have its own access rules, file size limits, and allowed MIME types. Buckets enable multi-tenancy, public/private access, and custom storage policies for user-generated or application assets.

**C. Usage in Code**
❗ Not referenced in the codebase.

- No direct or indirect references to the `buckets` table were found in backend, frontend, scripts, or configuration files.
- No usage of the Supabase Storage API (e.g., `supabase.storage`) was detected in the codebase.
- No SQL queries, migrations, or business logic interact with this table.

**D. Related Objects**
- `storage.objects` – The `objects` table in the `storage` schema references `bucket_id` (text) to associate files with their parent bucket. This is a core relationship: every object belongs to a bucket.
- No triggers, views, or functions in the codebase or database were found that directly depend on the `buckets` table.