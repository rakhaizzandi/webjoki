# Deploy Webjoki ke Vercel + Vercel Postgres

Project yang di-deploy adalah folder `webjoki`. API sudah berjalan sebagai Next.js Route Handlers di `/api/*`, jadi tidak perlu menjalankan folder `Backend` terpisah di Vercel.

## 1. Buat dan Link Database

1. Buka Vercel Dashboard.
2. Masuk ke project Vercel kamu, atau buat project baru dari repository ini.
3. Buka tab **Storage**.
4. Pilih **Create Database** lalu pilih **Postgres**.
5. Link database tersebut ke project `webjoki`.

Setelah database di-link, Vercel akan mengisi environment variable database seperti `POSTGRES_URL` atau `DATABASE_URL`.

## 2. Environment Variables

Tambahkan variable berikut di Vercel Project Settings > Environment Variables:

```env
JWT_SECRET=isi-dengan-string-random-yang-panjang
```

Database variable biasanya otomatis dari Vercel Storage. Jika belum ada, tambahkan salah satu:

```env
POSTGRES_URL=postgres://username:password@host.neon.tech/dbname?sslmode=require
DATABASE_URL=postgres://username:password@host.neon.tech/dbname?sslmode=require
```

Untuk development lokal, buat file `.env.local` dari `.env.example`.

## 3. Build Settings Vercel

Jika repository root berisi folder lain, atur:

```text
Root Directory: webjoki
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
Output Directory: .next
```

File `vercel.json` di folder ini sudah disiapkan untuk setting tersebut.

## 4. Inisialisasi Database

Jalankan dari folder `webjoki` setelah `.env.local` berisi connection string Postgres:

```bash
npm run db:setup
```

Atau jalankan terpisah:

```bash
npm run db:schema
npm run db:seed
```

Data demo yang dibuat:

```text
admin@example.com / admin123
user1@example.com / user1234
user2@example.com / joki1234
```

## 5. Deploy

Push repository ke GitHub, lalu deploy lewat Vercel. Setelah deploy selesai, cek endpoint:

```text
/api/services
/api/auth/register
/api/auth/login
/api/orders
/api/admin/orders
/api/admin/stats
/api/users
```

Jika ada error database, cek ulang apakah Vercel project sudah terhubung ke database dan variable `POSTGRES_URL` atau `DATABASE_URL` tersedia untuk environment Production.
