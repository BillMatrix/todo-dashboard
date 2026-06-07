# Todo Dashboard

Task management dashboard with subject-based organization and status tabs (Not Started, In Progress, Done).

## Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the SQL migration**: Copy the contents of `supabase/setup.sql` into the Supabase SQL Editor and run it. This creates the schema and seeds data from your Google Doc.
3. **Get your project credentials** from Supabase Settings > API:
   - Project URL
   - anon/public key
4. **Create `.env.local`**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your credentials
   ```
5. **Install & run**:
   ```bash
   npm install
   npm run dev
   ```
6. **Deploy to Vercel**: Push to GitHub and import your repo in Vercel. Set the env vars in your Vercel project settings.

## Features

- **Subjects sidebar**: Browse tasks by company/department
- **Status tabs**: Filter by Not Started, In Progress, or Done
- **Task cards**: Click the circle to cycle status, or edit/delete
- **Add/Edit tasks**: Modal form with title, description, deadline, subject, status
- **Overdue alerts**: Tasks past their deadline are highlighted in red
