# Bilova

Bilova is a web app that helps a patient stay on an antibiotic course. Stopping antibiotics early, or missing doses, is one of the main reasons bacteria become resistant to them, and it is easy to lose track of a multi-day course by memory alone. Bilova gives each patient a schedule, a one-tap way to confirm a dose, and a place to log symptoms, while a doctor or pharmacist (the admin) can see that data and manage the educational content and quiz that go with it. It is a React frontend over a Supabase backend (Postgres plus authentication).

[Baca dalam Bahasa Indonesia di bawah](#bahasa-indonesia)

## What it does

- **Authentication.** Patients and admins sign up and sign in through Supabase Auth. A forgotten password can be reset by email. After signing in, the app reads the `role` column on the user's row in `profiles` and sends them to either the patient home or the admin dashboard.
- **Medication schedule and dose confirmation.** Each patient sees their course of medication with the times doses are due. Confirming a dose is recorded in `compliance_logs` and reduces the remaining stock of that medication, so the patient (and the admin, through the dashboard) can see at a glance how many doses are left.
- **Symptom logging.** Patients can log symptoms as they occur (`symptom_logs`), which gives a doctor a timeline instead of only what the patient remembers to mention at a follow-up visit.
- **Education and a short quiz.** `educational_articles` and `quiz_questions` let the admin publish short reading material and a quiz, so patients get the "why" behind taking a course to completion, not just reminders.
- **Daily tips.** A small rotating tip (`daily_tips`) shown on the patient home screen.
- **Admin dashboard.** A separate set of pages lets an admin manage patient data, adherence records, educational articles and quiz questions, without touching the database directly.

## Why this architecture

The app has no custom backend server: every read and write from the React app talks to Supabase directly through its JavaScript client (`src/lib`), using Postgres row-level security (configured in `database/schema.sql`) to decide who can see or change what. That keeps the project small enough for one person to maintain while still giving each patient their own private data and the admin a wider view.

## Tech stack

React, Vite, React Router, Supabase (Postgres and Auth), Framer Motion for the small transitions in the UI, Lucide for icons.

## Getting started

Requirements: a current LTS release of Node.js and a Supabase project (free tier is enough).

```bash
npm install
cp .env.example .env     # fill in your Supabase project URL and anon key
npm run dev
```

Set up the database by running the SQL files in `database/` in the Supabase SQL editor, in this order: `schema.sql` first (creates the tables and row-level security policies), then `migration_complete.sql` and `quiz_migration.sql` (later additions), and optionally `seed_dummy.sql` if you want sample rows to click through locally.

Accounts are created through Supabase Auth, either from the app's own sign-up form or directly in the Supabase dashboard. To make a user an admin, open their row in the `profiles` table and set `role` to `admin`; everyone else defaults to the patient experience.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally, to sanity-check it before deploying |
| `npm run deploy` | Build, then publish `dist/` to GitHub Pages using `gh-pages` |

## Project structure

```
src/pages/auth     login, registration, forgot password
src/pages/main     patient-facing pages: home, symptoms, education, quiz, profile
src/pages/admin    admin dashboard: patient data, compliance, education, quiz management
src/components     UI pieces shared across pages
src/contexts       authentication state, shared across the app with React context
src/lib            the Supabase client and its configuration
database/          SQL schema, later migrations, and seed data for local testing
```

---

## Bahasa Indonesia

Bilova adalah aplikasi web yang membantu pasien menuntaskan masa minum antibiotik. Berhenti minum antibiotik lebih cepat, atau melewatkan dosis, adalah salah satu sebab utama bakteri menjadi resistan, dan mudah sekali kehilangan jejak jadwal yang berlangsung berhari-hari kalau hanya diandalkan dari ingatan. Bilova memberi setiap pasien jadwal, cara konfirmasi dosis dengan satu ketukan, dan tempat mencatat gejala, sementara dokter atau apoteker (admin) bisa melihat data itu serta mengelola konten edukasi dan kuis yang menyertainya. Ini adalah frontend React di atas backend Supabase (Postgres plus autentikasi).

### Fungsi

- **Autentikasi.** Pasien dan admin mendaftar serta masuk lewat Supabase Auth. Kata sandi yang terlupa bisa direset lewat email. Setelah masuk, aplikasi membaca kolom `role` pada baris pengguna di tabel `profiles` dan mengarahkannya ke beranda pasien atau dashboard admin.
- **Jadwal obat dan konfirmasi dosis.** Setiap pasien melihat jadwal minum obatnya beserta waktu dosis berikutnya. Konfirmasi dosis tercatat di `compliance_logs` dan mengurangi sisa stok obat tersebut, sehingga pasien (dan admin, lewat dashboard) bisa langsung tahu berapa dosis yang masih tersisa.
- **Pencatatan gejala.** Pasien bisa mencatat gejala saat terjadi (`symptom_logs`), sehingga dokter mendapat garis waktu yang lebih lengkap, bukan hanya apa yang diingat pasien saat kontrol.
- **Edukasi dan kuis singkat.** `educational_articles` dan `quiz_questions` memungkinkan admin menerbitkan materi bacaan singkat dan kuis, sehingga pasien mendapat alasan "mengapa" di balik anjuran menuntaskan obat, bukan sekadar pengingat.
- **Tips harian.** Tips singkat yang bergilir (`daily_tips`) tampil di layar beranda pasien.
- **Dashboard admin.** Serangkaian halaman terpisah untuk admin mengelola data pasien, catatan kepatuhan, artikel edukasi, dan soal kuis, tanpa harus menyentuh database langsung.

### Mengapa arsitektur ini

Aplikasi ini tidak punya server backend sendiri: setiap baca dan tulis dari aplikasi React langsung berbicara ke Supabase lewat klien JavaScript-nya (`src/lib`), memakai row-level security Postgres (dikonfigurasi di `database/schema.sql`) untuk menentukan siapa boleh melihat atau mengubah apa. Pendekatan ini membuat proyek cukup ringkas untuk dirawat satu orang, sambil tetap memberi tiap pasien data pribadinya sendiri dan admin pandangan yang lebih luas.

### Teknologi

React, Vite, React Router, Supabase (Postgres dan Auth), Framer Motion untuk transisi kecil di UI, Lucide untuk ikon.

### Menjalankan

Kebutuhan: Node.js rilis LTS terbaru dan satu proyek Supabase (tingkat gratis sudah cukup).

```bash
npm install
cp .env.example .env     # isi URL proyek dan anon key Supabase
npm run dev
```

Siapkan database dengan menjalankan berkas SQL di `database/` pada SQL editor Supabase, dengan urutan ini: `schema.sql` lebih dulu (membuat tabel dan kebijakan row-level security), lalu `migration_complete.sql` dan `quiz_migration.sql` (penambahan berikutnya), dan opsional `seed_dummy.sql` bila ingin data contoh untuk dicoba secara lokal.

Akun dibuat lewat Supabase Auth, baik dari formulir pendaftaran aplikasi sendiri maupun langsung di dashboard Supabase. Untuk membuat pengguna menjadi admin, buka barisnya di tabel `profiles` dan ubah `role` menjadi `admin`; pengguna lain secara default mendapat tampilan pasien.

### Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server pengembangan Vite dengan hot reload |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Menyajikan hasil build produksi secara lokal, untuk dicek sebelum dideploy |
| `npm run deploy` | Build, lalu menerbitkan `dist/` ke GitHub Pages lewat `gh-pages` |

### Struktur

```
src/pages/auth     login, pendaftaran, lupa kata sandi
src/pages/main     halaman untuk pasien: beranda, gejala, edukasi, kuis, profil
src/pages/admin    dashboard admin: data pasien, kepatuhan, edukasi, kelola kuis
src/components     komponen UI yang dipakai bersama di banyak halaman
src/contexts       state autentikasi, dibagikan ke seluruh aplikasi lewat React context
src/lib            klien Supabase dan konfigurasinya
database/          skema SQL, migrasi berikutnya, dan data contoh untuk uji lokal
```
