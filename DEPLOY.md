# Panduan Deploy — OSIS Hub (Vite + Convex + Vercel)

Aplikasi ini terdiri dari dua bagian:

| Bagian    | Teknologi                       | Dihosting di         |
| --------- | ------------------------------- | -------------------- |
| Frontend  | Vite + React 19 (SPA)           | Vercel               |
| Backend   | Convex (DB, auth, file storage) | Convex (cloud)       |

Urutan deploy: **1) backend Convex → 2) frontend Vercel**.

---

## 0. Prasyarat

- Node.js 20+ dan [Bun](https://bun.sh) (manajer paket proyek ini).
- Akun [Convex](https://convex.dev) dan [Vercel](https://vercel.com).
- Repo Git (GitHub/GitLab/Bitbucket) berisi folder ini.

```bash
bun install
```

---

## 1. Backend — Convex (production)

### 1a. Buat deployment produksi

```bash
# login ke Convex (sekali saja)
bunx convex login

# buat / hubungkan project, lalu tulis URL-nya
bunx convex dev --once
```

Catat nilai `VITE_CONVEX_URL` (mis. `https://xxxx.convex.cloud`).

### 1b. Production deploy key

Di dashboard Convex: **Project → Settings → Deploy Keys → Generate Production Deploy Key**.
Simpan nilainya sebagai `CONVEX_DEPLOY_KEY` (hanya untuk build Vercel, jangan di-commit).

Deploy backend secara manual (opsional, biasanya Vercel yang menjalankan ini saat build):

```bash
CONVEX_DEPLOY_KEY="prod:xxxx" bunx convex deploy
```

### 1c. Environment variable backend (WAJIB, untuk auth)

Auth Convex memerlukan 3 variabel yang sama di deployment produksi. Cara termudah:
salin dari deployment dev yang sudah berjalan, atau set lewat dashboard
**Convex → Settings → Environment Variables**.

| Variable          | Keterangan                                                        |
| ----------------- | ----------------------------------------------------------------- |
| `JWT_PRIVATE_KEY` | Kunci privat JWT (format PKCS8) — **harus sama** dengan pasangan JWKS |
| `JWKS`            | JSON Web Key Set publik pasangan dari `JWT_PRIVATE_KEY`           |
| `SITE_URL`        | URL frontend produksi, mis. `https://osis-hub.vercel.app`        |

Generate pasangan kunci baru bila perlu:

```bash
bunx @convex-dev/auth --generate-keys   # atau salin dari deployment dev
```

> Kalau auth belum dipakai di produksi, Anda tetap harus men-set ketiganya
> agar endpoint `/auth` tidak error.

### 1d. Isi data contoh (opsional)

Halaman publik otomatis memanggil seeding saat pertama dibuka, jadi tidak ada
langkah tambahan. Login admin panel: `/admin/login` dengan kredensial
`admin` / `admin123`.

---

## 2. Frontend — Vercel

1. **Import repo** ke Vercel (Add New → Project → pilih repo).
2. Vercel otomatis membaca `vercel.json`:
   - Install Command: `bun install`
   - Build Command: `npx convex deploy --cmd 'bun run build'`
   - Output Directory: `dist`
   - Rewrites SPA → `/index.html` (agar rute seperti `/anggota`, `/admin`
     tidak 404 saat di-refresh).
3. **Environment Variables** (Project → Settings → Environment Variables):

   | Variable            | Value                                   | Scope         |
   | ------------------- | --------------------------------------- | ------------- |
   | `VITE_CONVEX_URL`   | `https://xxxx.convex.cloud`              | Production    |
   | `CONVEX_DEPLOY_KEY` | production deploy key dari langkah 1b    | Production    |

   > `VITE_CONVEX_URL` harus berupa URL **deployment produksi**. Jika memakai
   > satu deployment Convex untuk dev dan prod, nilainya bisa sama.
4. Klik **Deploy**.

Setelah URL Vercel jadi, perbarui `SITE_URL` di environment Convex (langkah 1c)
ke URL tersebut, lalu redeploy bila perlu.

---

## 3. Setelah deploy

- Buka `https://<domain>.vercel.app` → halaman publik.
- `https://<domain>.vercel.app/anggota`, `/kegiatan`, `/aspirasi` → halaman publik.
- `https://<domain>.vercel.app/admin/login` → admin panel (`admin` / `admin123`).
- `https://<domain>.vercel.app/auth` → alur login pengguna (Convex Auth).

---

## Catatan tentang runtime Freebuff/Vly

Proyek ini awalnya dibuat di lingkungan Freebuff dan menyertakan beberapa
tambahan runtime yang hanya relevan di sana:

- `vite.config.ts` → `vlyPlugin()` dan pengaturan `server.hmr`.
- `src/main.tsx` → `import "@vly-ai/integrations"` dan `<VlyToolbar />`.
- `vly-toolbar-readonly.tsx`, `src/instrumentation.tsx`, `src/lib/vly-integrations.ts`.
- `main.ts` (server Deno khusus sandbox), `sst-env.d.ts`, `isolate/`.

Tambahan ini tidak mengganggu build Vercel selama dependency `@vly-ai/integrations`
ada di `package.json`. Jika build/lint Vercel mengeluh soal paket itu, Anda bisa
membersihkannya dengan menghapus `vlyPlugin()` dari `vite.config.ts` beserta
import/`<VlyToolbar />` di `src/main.tsx`.

---

## Struktur file penting

```
.
├── vercel.json                 # konfigurasi deploy Vercel
├── convex.json                 # menunjuk functions ke src/convex
├── index.html                  # entry HTML Vite
├── package.json
├── vite.config.ts
└── src
    ├── main.tsx                # router + provider
    ├── index.css               # tema Tailwind v4
    ├── convex/                 # BACKEND (schema, queries, mutations, auth)
    │   ├── schema.ts
    │   ├── adminAuth.ts        # sesi admin (admin/admin123)
    │   ├── members.ts
    │   ├── activities.ts
    │   ├── aspirations.ts
    │   ├── siteSettings.ts
    │   ├── files.ts            # upload foto
    │   ├── seed.ts             # data contoh 12 anggota + 3 kegiatan
    │   ├── helpers.ts
    │   └── _generated/         # hasil codegen Convex
    ├── lib/                    # admin-auth, upload, utils
    ├── hooks/                  # use-auth, use-mobile
    ├── pages/
    │   ├── public/             # Home, Members, Activities, Aspirations, PublicLayout
    │   ├── admin/              # AdminLayout, Dashboard, Members, Activities, Aspirations, Settings
    │   ├── AdminLogin.tsx
    │   ├── Auth.tsx            # template Convex Auth
    │   └── Dashboard.tsx       # template protected route
    └── components/
        ├── ui/                 # shadcn/ui
        ├── admin/ImagePicker.tsx
        └── RequireAuth.tsx
```
