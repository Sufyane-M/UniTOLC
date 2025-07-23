# Student Exam Prep Platform

A web application for students preparing for university entrance exams like TOLC, powered by Supabase.

## Project Overview

This application helps students prepare for university entrance exams with:

- Personalized study plans
- Practice quizzes and tests
- Performance tracking and analytics
- Daily challenges and streak tracking
- Premium content for subscribed users

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Supabase (PostgreSQL, Auth, Realtime)
- **Deployment**: Any platform supporting Node.js and Supabase

## Architecture Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────────────┐
│             │       │             │       │                     │
│  React UI   │◄─────►│  Express.js │◄─────►│  Supabase           │
│  (Client)   │       │  (Server)   │       │  - Auth             │
│             │       │             │       │  - Database         │
└─────────────┘       └─────────────┘       │  - Storage          │
                                            │  - Realtime         │
                                            └─────────────────────┘
```

## Local Setup Guide

### Prerequisites

- Node.js 18+ 
- npm, pnpm, or yarn
- Docker (for local Supabase)
- Supabase CLI (optional, for local development)

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone [repository-url]
cd StudentExamPrep

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env

# Edit the .env file with your Supabase credentials
```

### Step 3: Setup Supabase

Option A: Use Supabase Cloud
1. Create a project at https://supabase.com
2. Run the SQL migrations from the `migrations` folder in the Supabase SQL Editor
3. Update your .env file with your project URL and anon key

Option B: Run Supabase Locally
1. Install the Supabase CLI: `npm install -g supabase`
2. Initialize Supabase: `supabase init`
3. Start Supabase: `supabase start`
4. Apply migrations: `supabase db push`

### Step 4: Run the Application

```bash
# Start the development server
npm run dev
```

The application will be available at http://localhost:5000

## Database Schema

The database includes tables for:
- Users and authentication
- Exams and study materials
- Quizzes and quiz attempts
- Study sessions and progress tracking
- Premium content management

## Authentication

The application uses Supabase Auth for:
- Email/password authentication
- Email verification
- Password reset
- Profile management

## Row-Level Security (RLS)

All tables are protected by Row-Level Security policies to ensure:
- Users can only access their own data
- Premium content is restricted to premium users
- Public content is accessible to all authenticated users

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run supabase:start` - Start the local Supabase instance
- `npm run supabase:stop` - Stop the local Supabase instance

## Deployment Notes

### Deploying to Supabase Cloud

1. Create a new Supabase project
2. Run the SQL migrations in the Supabase SQL Editor
3. Set up your environment variables with Supabase credentials
4. Deploy the application to your preferred hosting provider

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 