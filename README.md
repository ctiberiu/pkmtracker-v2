# Pokédex Tracker v2

A modern web application for tracking multiple Pokédexes, competing with friends, and managing TCG collections.

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel

## Features

- ✅ User authentication (signup/login)
- ✅ Create and manage multiple Pokédexes
- ✅ Track caught Pokémon per Pokédex
- ✅ Dashboard with all Pokédexes
- 🚧 Shareable preview links
- 🚧 TCG collections and photo uploads
- 🚧 Competitions between friends with referee system
- 🚧 Donation integration

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier available at https://supabase.com)

### Setup

1. **Clone and install dependencies**
   ```bash
   cd /Users/seomonitor/Projects/pkmtracker-v2
   npm install
   ```

2. **Create a Supabase project**
   - Go to https://supabase.com and create a new project
   - Choose a region close to you
   - Save your project URL and anon key

3. **Set up the database**
   - In Supabase, go to SQL Editor
   - Create a new query and paste the contents of `supabase/schema.sql`
   - Run the query to create all tables and policies

4. **Configure environment variables**
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser

## Project Structure

```
pkmtracker-v2/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles
│   │   ├── auth/
│   │   │   ├── login/page.tsx   # Login page
│   │   │   └── signup/page.tsx  # Signup page
│   │   ├── dashboard/page.tsx   # Dashboard (all pokedexes)
│   │   └── pokedex/[id]/        # Individual pokedex pages (TODO)
│   └── lib/
│       └── supabase.ts          # Supabase client
├── supabase/
│   └── schema.sql               # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Database Schema

### Tables
- `profiles` - User profiles
- `pokedexes` - User's Pokédex collections
- `caught_pokemon` - Tracked Pokémon per Pokédex
- `tcg_collections` - TCG cards per Pokémon
- `competitions` - Friend competitions
- `preview_links` - Shareable preview links

All tables have Row Level Security (RLS) enabled for data isolation.

## Next Steps

1. Set up Supabase project and database
2. Create individual Pokédex tracker page (`/pokedex/[id]`)
3. Implement Pokémon grid with filtering (migrate from v1)
4. Add shareable preview links
5. Implement TCG collections
6. Add competitions system
7. Integrate donation button

## Deployment

Deploy to Vercel:
```bash
npm install -g vercel
vercel
```

Follow the prompts to connect your GitHub repo and deploy.

## License

MIT
