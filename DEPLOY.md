# Deploy ke Vercel — Panduan Lengkap (OSIS Hub)

Panduan ini untuk pemula. Ikuti urutan **1 → 2 → 3** secara berurutan.

---

## Peta besar: apa yang dideploy ke mana

```
┌──────────────────────────┐          ┌───────────────────────────┐
│  VERCEL  (frontend)      │  HTTPS   │  CONVEX  (backend + DB)   │
│                          │ ───────► │                           │
│  • Halaman publik        │  query / │  • Database anggota       │
│  • Panel admin /admin    │  mutate  │  • Database kegiatan      │
│  • Form aspirasi         │          │  • Database aspirasi      │
│                          │  ◄─────── │  • Penyimpanan foto       │
│  Hanya file statis       │  data    │  • Auth (login)           │
└──────────────────────────┘          └───────────────────────────┘
```

Dua hal penting yang harus kamu pahami:

1. **Vercel hanya menyimpan file statis** (HTML, CSS, JS). Vercel tidak punya database.
2. **Convex adalah "otak" aplikasinya**: database, login, dan penyimpanan foto semuanya ada di sana.

Urutannya wajib: **Convex dulu, baru Vercel.** Karena saat Vercel build, ia perlu tahu alamat server Convex.

---

## Yang perlu disiapkan (checklist)

- [ ] Akun [Vercel](https://vercel.com) (bisa daftar pakai GitHub)
- [ ] Akun [Convex](https://convex.dev)
- [ ] Kode proyek di dalam repository Git (GitHub/GitLab/Bitbucket)
- [ ] 3 nilai rahasia (akan dijelaskan di Bagian 1)

---

# BAGIAN 1 — Siapkan backend Convex

## 1.1 Install paket & masuk akun Convex

Buka terminal di folder proyek, lalu jalankan:

```bash
bun install
bunx convex login
```

Perintah kedua akan membuka browser untuk login ke Convex.

## 1.2 Pastikan project Convex sudah terhubung

```bash
bunx convex dev --once
```

Kalau sukses, akan muncul baris seperti ini:

```
└─ https://xxxx-xxxx.convex.cloud
```

**Catat URL tersebut.** Ini yang nanti dipakai sebagai `VITE_CONVEX_URL` di Vercel.

> **Cara cepat (opsional):** kalau kamu mau memakai deployment Convex yang
> sekarang sudah berjalan (`https://third-tern-377.convex.cloud`), semua data
> anggota/kegiatan dan konfigurasi login sudah siap. Kamu bisa **melewati
> Bagian 1.3–1.4** dan langsung memakai URL itu sebagai `VITE_CONVEX_URL`.
> Steps 1.1–1.2 tetap perlu dilakukan.

## 1.3 Environment variable backend (untuk login/Auth)

Backend Convex butuh 3 nilai berikut. Tanpa ini, halaman `/auth` akan error.

| Nama             | Isi                                                          |
| ---------------- | ------------------------------------------------------------ |
| `JWT_PRIVATE_KEY`| Kunci privat JWT (PKCS8)                                     |
| `JWKS`           | Kunci publik (JSON Web Key Set) dari `JWT_PRIVATE_KEY` di atas |
| `SITE_URL`       | Alamat website kamu di Vercel, mis. `https://osis.vercel.app` |

**Cara termudah: salin dari deployment yang sudah jalan.**

1. Buka [dashboard.convex.dev](https://dashboard.convex.dev)
2. Pilih project Convex kamu
3. Klik **Settings → Environment Variables**
4. Salin nilai `JWT_PRIVATE_KEY`, `JWKS`, dan `SITE_URL`

**Cara lainnya, lewat terminal:**

```bash
# lihat dulu yang sudah ada
bunx convex env list

# set/update satu per satu (tambahkan --prod untuk deployment produksi)
bunx convex env set JWT_PRIVATE_KEY "isi-dari-dashboard" --prod
bunx convex env set JWKS "isi-dari-dashboard" --prod
bunx convex env set SITE_URL "https://nama-anda.vercel.app" --prod
```

> `SITE_URL` boleh diisi setelah domain Vercel kamu jadi (Bagian 3.5). Kalau
> belum tahu, isi dulu dengan URL sementara lalu perbaiki nanti.

## 1.4 Deploy backend ke Convex

Buat **Production Deploy Key**:

1. Dashboard Convex → project kamu → **Settings → Deploy Keys**
2. Klik **Generate Production Deploy Key**
3. Salin hasilnya (formatnya diawali `prod:`). **Jangan simpan di dalam kode.**

Lalu jalankan:

```bash
CONVEX_DEPLOY_KEY="prod:xxxxxxxx" bunx convex deploy
```

Kalau muncul tanda centang hijau, backend sudah live.

## 1.5 Buat deploy key untuk Vercel

Simpan `Production Deploy Key` tadi di tempat aman — nanti perlu kamu paste ke
Vercel. Vercel membutuhkannya untuk menjalankan `convex deploy` otomatis
setiap kali kamu deploy.

---

# BAGIAN 2 — Unggah kode ke GitHub

1. Buat repository baru di GitHub (boleh private).
2. Unggah isi folder proyek ke sana.

```bash
git init
git add .
git commit -m "OSIS Hub"
git branch -M main
git remote add origin https://github.com/username/nama-repo.git
git push -u origin main
```

> File `.env.local` (berisi rahasia) **sudah otomatis tidak ikut** karena
> ada di `.gitignore`. Ini benar dan harus tetap begitu.

---

# BAGIAN 3 — Deploy frontend ke Vercel

## 3.1 Buat project baru di Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Pilih **Add New… → Project**
3. Pilih repository GitHub kamu, klik **Import**

## 3.2 Set environment variable di Vercel

Sebelum klik Deploy, atur dua variabel ini.

Klik **Environment Variables** (atau atur lewat **Project → Settings →
Environment Variables**):

| Nama                | Nilai                                        |
| ------------------- | -------------------------------------------- |
| `VITE_CONVEX_URL`   | `https://xxxx-xxxx.convex.cloud` (dari 1.2)  |
| `CONVEX_DEPLOY_KEY` | `prod:xxxxxxxx` (dari 1.5)                    |

> **Kenapa `VITE_CONVEX_URL` wajib berawalan `VITE_`?**
> Vite hanya menyertakan variabel berawalan `VITE_` ke dalam kode browser.
> Nama lain tidak akan terbaca oleh frontend.

## 3.3 Konfigurasi build

Vercel membaca otomatis dari file `vercel.json` yang sudah ada di proyek:

| Setting            | Nilai                                                                              |
| ------------------ | ---------------------------------------------------------------------------------- |
| Framework          | `vite`                                                                             |
| Install Command    | `bun install`                                                                      |
| Build Command      | `npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd 'npx vite build'`   |
| Output Directory   | `dist`                                                                             |

Kalau panel Vercel menampilkan kolom kosong, biarkan saja — `vercel.json` yang
menentukan. Tapi **kalau kamu pernah mengisi Build Command manual di dashboard
Vercel, nilai itu yang menang** dan `vercel.json` diabaikan. Isi dengan perintah
di atas supaya sama.
Jangan pakai Build Command bawaan Vercel untuk Vite (`vite build`), karena
Vercel perlu codegen Convex dulu (`convex deploy` yang membuat
`src/convex/_generated`, folder itu tidak ikut ter-commit ke Git).

## 3.4 Klik "Deploy"

Vercel akan menjalankan build.通常是 1–3 menit.

Kalau sukses, kamu dapat URL seperti:
`https://osis-hub.vercel.app`

## 3.5 Perbarui SITE_URL (langkah penting)

Karena baru jadi sekarang domain Vercel kamu, kembali ke Convex:

1. Dashboard Convex → **Settings → Environment Variables**
2. Set `SITE_URL` = `https://osis-hub.vercel.app`
3. Kembali ke Vercel, klik menu **⋯** pada deployment → **Redeploy**

---

# BAGIAN 4 — Cek hasilnya

Buka URL Vercel kamu dan coba semua halaman ini:

| URL                                  | Isi                                        |
| ------------------------------------ | ------------------------------------------ |
| `/`                                   | Beranda                                    |
| `/anggota`                            | Daftar anggota (12 orang)                  |
| `/kegiatan`                           | Daftar kegiatan                           |
| `/aspirasi`                           | Form aspirasi                               |
| `/admin/login`                        | Login pengurus (`admin` / `admin123`)      |
| `/admin/anggota`                      | Kelola anggota (ubah nama, tambah, hapus)  |
| `/admin/kegiatan`                     | Kelola kegiatan (ubah judul & deskripsi)   |

Kalau semuanya tampil dan bisa diisi, deploy kamu berhasil.

---

# BAGIAN 5 — Deploy ulang (tulang belakang website kamu)

Setiap kali kamu mengubah kode:

```bash
git add .
git commit -m "perubahan baru"
git push
```

Vercel otomatis terdeteksi, build, dan deploy ulang. Tidak perlu buka Vercel
lagi.

Kalau kamu hanya ingin parse ulang isi website tanpa mengubah kode (misal
menambah anggota lewat panel admin), kamu **tidak perlu** deploy ulang sama
sekali — karena data disimpan di Convex, bukan di Vercel.

---

# Troubleshooting

| Gejala                                              | Penyebab                                          | Solusi                                                                 |
| --------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Build gagal: `convex deploy` tidak bisa             | `CONVEX_DEPLOY_KEY` belum diisi                  | Tambahkan di Vercel → Environment Variables                             |
| `ParserError: failed to parse package.json`          | `package.json` rusak/terduplikasi                | Unggah ulang `package.json` dari repo (formatnya JSON tunggal, tanpa blok `{ ... }` di atas) |
| `command not found: convex`                         | Install dan build memakai package manager beda  | Samakan: install `bun install`, build `npx convex deploy ...` (convex tetap terbaca dari `node_modules`) |
| Halaman kosong / putih                              | `VITE_CONVEX_URL` salah atau belum diisi          | Cek URL-nya, harus `https://xxx.convex.cloud` tanpa garis miring di akhir |
| Refresh `/admin` atau `/anggota` hasilnya 404        | Rewrite SPA belum aktif                            | Pastikan `vercel.json` ada dan berisi `rewrites`                         |
| Error di halaman `/auth`                            | `JWT_PRIVATE_KEY` / `JWKS` / `SITE_URL` belum di-set di Convex | Set 3 env var itu di Convex                                          |
| Perubahan kode tidak muncul                         | Build ulang Vercel belum dijalankan                 | Klik **Redeploy**                                                       |
| Foto tidak bisa diunggah                            | Storage Convex belum aktif                          |通常是 otomatis; cek kuota di dashboard Convex                          |

---

# Struktur file penting

```
.
├── vercel.json                 # konfigurasi deploy Vercel
├── convex.json                 # menunjuk functions ke src/convex
├── index.html                  # entry HTML Vite
├── package.json
├── vite.config.ts
├── DEPLOY.md                   # panduan ini
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

---

# Catatan tentang runtime Freebuff/Vly

Proyek ini awalnya dibuat di lingkungan Freebuff dan menyertakan beberapa
tambahan runtime yang hanya relevan di sana:

- `vite.config.ts` → `vlyPlugin()`
- `src/main.tsx` → `import "@vly-ai/integrations"` dan `<VlyToolbar />`
- `vly-toolbar-readonly.tsx`, `src/instrumentation.tsx`, `src/lib/vly-integrations.ts`
- `main.ts` (server Deno khusus sandbox), `sst-env.d.ts`

Tambahan ini tidak mengganggu build Vercel selama dependency
`@vly-ai/integrations` ada di `package.json`. Jika build Vercel mengeluh soal
paket itu, bersihkan dengan menghapus `vlyPlugin()` dari `vite.config.ts`
beserta import/`<VlyToolbar />` di `src/main.tsx`.

**Catatan script `build`:** di `package.json`, script `build` sengaja dibuat
sederhana (`vite build`) supaya aman di mana pun. Untuk produksi, Vercel
memakai perintah eksplisit dari `vercel.json`:
`npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd 'npx vite build'`.
Flag `--cmd-url-env-var-name VITE_CONVEX_URL` memberitahu `convex deploy`
agar mengisi `VITE_CONVEX_URL` dengan URL deployment produksi — itu yang
dibaca `src/main.tsx` (`new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)`),
jadi kamu tidak perlu menulis `VITE_CONVEX_URL` sendiri di Vercel.
Typecheck (`tsc -b`) sengaja tidak dijalankan di Vercel: Vite tidak
membutuhkannya, dan `tsconfig` proyek ini ikut membangun file khusus sandbox.
