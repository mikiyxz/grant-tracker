# Grant Tracker

Deadline and grant management tool for small Canadian nonprofits.

## Stack

Next.js 15, TypeScript, Supabase, Tailwind CSS

## Running locally

```
git clone https://github.com/mikiyxz/grant-tracker.git
cd grant-tracker
npm install
```

Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Both values are in your Supabase project under Settings > API.

```
npm run dev
```

The app runs on http://localhost:3000.

## Database

The schema lives in `supabase/migrations/`. Run the files in order against your Supabase project, either through the SQL editor or the Supabase CLI.
