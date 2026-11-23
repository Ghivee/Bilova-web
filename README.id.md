# Bilova

Aplikasi web pengingat kepatuhan minum antibiotik. Pasien mencatat dosis, gejala, dan jawaban kuis, sedangkan dashboard admin menampilkan datanya. Proyek ini dibuat sebagai frontend di atas backend Supabase.

[English](README.md)

## Fungsi

- Pasien mendaftar, masuk, dan mengatur ulang kata sandi yang terlupa.
- Jadwal obat dengan konfirmasi dosis. Konfirmasi dosis mengurangi stok obat yang bersangkutan.
- Pencatatan gejala, riwayat kepatuhan, tips harian, artikel edukasi, dan kuis singkat.
- Halaman profil dan halaman data pasien.
- Area admin dengan halaman data pasien, catatan kepatuhan, artikel edukasi, dan soal kuis. Setelah masuk, pengguna diarahkan ke dashboard admin atau beranda pasien sesuai kolom `role` di tabel `profiles`.

## Teknologi

React, Vite, React Router, Supabase (Auth dan Postgres), Framer Motion, ikon Lucide.

## Menjalankan

Kebutuhan: Node.js rilis LTS terbaru dan satu proyek Supabase.

```bash
npm install
cp .env.example .env     # isi URL dan anon key Supabase
npm run dev
```

Siapkan database dengan menjalankan berkas SQL di `database/` pada SQL editor Supabase: `schema.sql` lebih dulu, lalu `migration_complete.sql` dan `quiz_migration.sql`. `seed_dummy.sql` menambahkan data contoh untuk uji lokal.

Akun dibuat lewat Supabase Auth. Untuk membuat admin, ubah `role` menjadi `admin` pada baris pengguna itu di tabel `profiles`.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | Menjalankan server dev Vite |
| `npm run build` | Build produksi ke `dist/` |
| `npm run preview` | Menyajikan hasil build secara lokal |
| `npm run deploy` | Build lalu publikasi `dist/` ke GitHub Pages lewat `gh-pages` |

## Struktur

```
src/pages/auth     login, daftar, lupa kata sandi
src/pages/main     halaman pasien
src/pages/admin    dashboard admin
src/components     komponen UI bersama
src/contexts       state autentikasi
src/lib            klien Supabase
database/          skema SQL, migrasi, data contoh
```
