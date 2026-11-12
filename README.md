# Grant Tracker

Deadline and grant tracking app for small Canadian nonprofits. Built with Next.js 15, TypeScript, Supabase, and Tailwind.

## Running locally

Clone the repo and create a `.env.local` in the root with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Then run the SQL files in `supabase/migrations/` in order in the Supabase SQL editor.

Install and start it:

```
npm install
npm run dev
```

Opens on localhost:3000.
