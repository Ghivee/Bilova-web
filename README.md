# Bilova

Antibiotic adherence reminder web app. Patients log doses, symptoms and quiz answers; an admin dashboard shows the data behind them. It was written as a frontend over a Supabase backend.

[Bahasa Indonesia](README.id.md)

## What it does

- Patients sign up, sign in and reset a forgotten password.
- A medication schedule with dose confirmation. Confirming a dose reduces the stock of that medication.
- Symptom logging, a compliance history, daily tips, educational articles and a short quiz.
- A patient profile page and a patient data page.
- An admin area with pages for patient data, compliance records, educational articles and quiz questions. Users are redirected to the admin dashboard or the patient home depending on the `role` column in `profiles`.

## Tech stack

React, Vite, React Router, Supabase (Auth and Postgres), Framer Motion, Lucide icons.

## Getting started

Requirements: a current LTS release of Node.js and a Supabase project.

```bash
npm install
cp .env.example .env     # fill in your Supabase URL and anon key
npm run dev
```

Set up the database by running the SQL files in `database/` in the Supabase SQL editor: `schema.sql` first, then `migration_complete.sql` and `quiz_migration.sql`. `seed_dummy.sql` adds sample rows for local testing.

Accounts are created through Supabase Auth. To make an admin, set `role` to `admin` in that user's row in `profiles`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run deploy` | Build and publish `dist/` to GitHub Pages with `gh-pages` |

## Project structure

```
src/pages/auth     login, register, forgot password
src/pages/main     patient pages
src/pages/admin    admin dashboard
src/components     shared UI
src/contexts       auth state
src/lib            Supabase client
database/          SQL schema, migrations, seed data
```
