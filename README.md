# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev## 🧪 Informasi Login Demo

Gunakan akun berikut untuk mencoba fitur User dan Admin:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Pasien** | `user@bilova.com` | `12345678` |
| **Admin** | `admin@bilova.com` | `12345678` |

> **Catatan**: Pastikan akun tersebut sudah didaftarkan di Supabase Auth dan field `role` di tabel `profiles` sesuai. Jika belum, Anda bisa mendaftar secara manual dan mengubah role via SQL Editor di Supabase Dashboard.

## 🛠️ Persiapan Database (Supabase)

1. Jalankan query di `database/schema.sql` pada SQL Editor Supabase.
2. Tambahkan variabel lingkungan berikut di file `.env`:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 🚀 Fitur Baru

- **Role-Based Redirect**: Otomatis mengarahkan ke Dashboard Admin atau Beranda User setelah login.
- **Error Handling Cerdas**: Pesan kesalahan yang lebih jelas dalam Bahasa Indonesia.
- **Sinkronisasi Data Otomatis**: Pengurangan stok obat otomatis saat dikonfirmasi diminum.

## 📂 Struktur Proyek

- `src/pages/auth`: Halaman Login, Register, dan Lupa Password.
- `src/pages/main`: Halaman utama pasien (Beranda, Gejala, Edukasi, Profil).
- `src/pages/admin`: Dashboard kontrol untuk admin/dokter.
- `src/components`: Komponen UI yang dapat digunakan kembali.
- `src/contexts`: Manajemen state (Autentikasi).
- `src/lib`: Konfigurasi library eksternal (Supabase).
- `database`: Skema database SQL untuk Supabase.

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
