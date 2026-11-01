# Hakkita

Website informasi program pemerintah dan layanan publik Indonesia, dengan visual yang merujuk screenshot LifeSG dan konten yang disesuaikan untuk Hakkita.

Kode aplikasi berada di `app/`. Revisi master frontend diterapkan pada aplikasi existing: katalog program/layanan terpisah, rekomendasi profil, serta akun contoh lokal yang opsional.

## Menjalankan

- `npm run dev -- --host 127.0.0.1 --port 4173` dari folder ini.
- `npm run build` menghasilkan `app/dist/client/` beserta Worker fallback untuk deep link.
- `npm test` menjalankan pengujian data, logika pencocokan, interaksi DOM, dan fallback routing.
- `npm --prefix app run typecheck` memeriksa modul TypeScript.
- Untuk instalasi baru: `npm --prefix app ci` terlebih dahulu. Node 24 digunakan dalam pengembangan.

Preview sesi ini: http://127.0.0.1:4173/

## Dokumentasi

- [Laporan implementasi, sumber, dan batasan](app/IMPLEMENTATION.md)
- [Status pemeriksaan visual](app/design-qa.md)

Stack: React 19, Vite 6, modul TypeScript, CSS responsif, Geist lokal, Phosphor Icons. Pencarian dan rekomendasi memakai katalog lokal. Akun contoh menggunakan alamat `@example.test` tanpa password, dengan simpanan terpisah per identitas di browser ini. Jawaban ekonomi tambahan hanya berada dalam memori sesi. Tidak ada akun server, unggahan dokumen identitas, pengajuan pemerintah, atau sinkronisasi lintas perangkat.
