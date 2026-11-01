# Hakkita — QA kartu program, 1 November 2026

final result: blocked

Target: gambar kartu program yang dilampirkan pengguna (628×637 px, ukuran CSS dan density tidak diketahui). Foto di atas, pill kategori, judul navy, ringkasan, divider, CTA biru bulat, bookmark.

Implementasi: `src/ui.jsx`, `src/homepage.css`; semua kartu program memakai struktur baru. Kartu layanan tidak berubah. Tiga foto ilustratif hasil generasi tersimpan lokal di `public/program-education.png`, `public/program-opportunity.png`, dan `public/program-community.png`. Foto bukan dokumentasi resmi penyelenggara.

Hasil otomatis: 53 pengujian lulus, termasuk bookmark guest/akun, rute detail, pencarian/filter, carousel drag/keyboard/reduced motion. TypeScript lulus. Verifikasi file aset lokal berhasil.

Bukti render dan perbandingan: belum tersedia. Akses in-app browser mengembalikan `The browser access host is unavailable`. Tidak ada screenshot implementasi, viewport atau density yang dapat diklaim. Full-view dan focused comparison belum dapat dilakukan.

Permukaan fidelity: Geist dan token biru dipertahankan; spacing/radius/tata letak diatur mengikuti referensi; foto dibuat sesuai konteks Indonesia. Tipografi, wrapping, crop, warna hasil render dan responsivitas masih memerlukan perbandingan visual, bukan dinyatakan lulus dari kode saja.

Tindak lanjut: pulihkan akses browser, buka homepage dan katalog desktop/mobile, bandingkan kartu pada keadaan/ukuran yang sama dengan referensi; periksa gambar, wrapping judul, CTA, fokus, serta overflow. Tidak ada perubahan visual berbasis screenshot yang diklaim.

---

Riwayat QA sebelumnya:
# Hakkita â€” QA revisi master frontend

final result: blocked

Tanggal: 31 Oktober 2026.

## Target visual dan preferensi pengguna

- Referensi LifeSG: `C:/Users/LENOVO/Downloads/screencapture-life-gov-sg-2026-10-31-15_30_51.png`, lebar referensi 1920px; density dan CSS viewport asal tidak dapat dikonfirmasi.
- Target produk diperbarui oleh master revision prompt: beranda berpusat pada penemuan program, akun opsional, dan personalisasi.
- Geist, logo PNG asli, hero `public/hero-lakeside.png`, heading ringan, navigasi putih, hero krem, dan footer tanpa ilustrasi dipertahankan.
- Screenshot referensi mewakili inspirasi LifeSG; konten dan arsitektur baru sengaja mengikuti prompt Hakkita, bukan salinan teks LifeSG.

## Bukti implementasi

- Preview: http://127.0.0.1:4173/ â€” pemeriksaan HTTP 200 berhasil.
- Implementation screenshot: **belum tersedia**.
- Viewport, pixel dimensions, CSS size, density normalization: **belum tersedia**.
- Full-view comparison dan focused comparison: **belum dapat dilakukan** karena tidak ada capture hasil render.

## Blocker browser pada revisi ini

In-app browser mengembalikan **â€œThe browser access host is unavailable.â€** Inventori juga melaporkan browser access host tidak tersedia. Tidak ada screenshot, console browser sungguhan, atau hasil visual yang diklaim berasal dari revisi ini. Kegagalan native Chrome pada sesi sebelumnya tidak dipakai sebagai bukti audit baru.

## Verifikasi fungsional yang lulus

- TypeScript check dan build produksi.
- **45 pengujian otomatis**, 0 gagal, menggunakan React/JSDOM dan Node test runner.
- Happy/alternate paths akun, skip profil, bookmark setelah registrasi, data per identitas, checklist, impor simpanan lama, storage unavailable, serta logout.
- Search/filter/alias, deep link varian, invalid route, kategori kosong, dan seluruh tautan internal yang ditemukan pada halaman publik.
- Recalculation rekomendasi, unknown vs conflict, serta jawaban ekonomi tidak tersimpan.
- Grafik/tabel/empty state anggaran.
- Fokus dialog, Escape, filter sheet mobile, menu mobile, label form publik, dan ID unik.
- Tidak ada React console error selama pengujian DOM.

Pengujian tersebut **tidak menggantikan** review browser, pengukuran responsive/overflow, atau uji kontras aktual.

## Lima fidelity surfaces

| Surface | Implementasi | Status visual |
| --- | --- | --- |
| Font/typography | Geist lokal 400â€“800; hero 600 dengan ukuran pilihan pengguna | Wrapping, optical balance, dan fallback belum diperiksa di browser |
| Spacing/layout | Search-centered hero, program grid, signature section, kategori teks, footer sederhana | Proporsi, alignment, dan overflow pada viewport aktual belum diperiksa |
| Colors/tokens | Biru `#196dcc`, cream `#fffaf4`, charcoal, white, light borders | Sampling dan contrast visual belum diperiksa |
| Image quality | Logo dan hero PNG asli digunakan; rasio panorama dipertahankan | Crop/scale pada desktop/mobile belum diperiksa pada halaman |
| Copy/content | Heading dan FAQ master prompt, sumber resmi, no fabricated status, akun lokal dijelaskan dengan jujur | Konten diverifikasi melalui DOM; appearance belum diperiksa |

## Comparison history

Belum ada iterasi perbandingan screenshot yang valid. Perbaikan logika dan pengujian tidak dicatat sebagai iterasi visual.

## Langkah untuk menyelesaikan visual QA

1. Pulihkan browser surface yang bisa membaca URL dan mengambil screenshot.
2. Capture beranda desktop dan mobile, serta katalog, dialog bookmark, daftar/masuk, profil, rekomendasi, Rencanaku, dan anggaran.
3. Bandingkan referensi dan capture dalam comparison input yang sama, dengan crop/density yang sesuai.
4. Periksa header, proporsi hero, ukuran logo, gambar, typography, section rhythm, CTA, dan footer.
5. Periksa keyboard, console browser, actual overflow, contrast, dan touch target.
6. Perbaiki P0/P1/P2 yang ditemukan, capture ulang, baru ubah hasil menjadi passed.

final result: blocked


## Revisi Mengenal Hakkita — dua kartu

Sumber layout/copy: `C:/Users/LENOVO/Downloads/mengenal-hakkita-dua-kartu.html`. Instruksi pengguna membatasi adopsi ke layout dan copy; style tetap memakai Hakkita. Implementasi: `src/Introduction.jsx`, dipanggil dari `src/Home.jsx`, style di `src/homepage.css`.

Pengantar rata tengah, dua kartu desktop/satu kolom mobile, pratinjau statis disembunyikan dari accessibility tree, CTA mengarah ke `/program` dan `/layanan`. Font Geist, token biru/warm-neutral dan radius Hakkita dipertahankan. Copy dan catatan ilustrasi mengikuti file sumber.

Validasi: 53 tes otomatis lulus, TypeScript lulus. QA visual belum diverifikasi; akses browser sebelumnya tidak tersedia. Tidak ada klaim perbandingan screenshot atau hasil visual lulus.

## Revisi kategori program — category cards

Sumber ketentuan: attachment `d138cbec-85e8-41e6-a4ac-69591bb1922d/Pasted text.txt`. Scope hanya section kategori homepage.

Heading/subheading diperbarui; tujuh kategori memakai kartu putih, badge ikon biru pastel, label navy, dan chevron melingkar. CSS mengatur3kolom>=1024px,2kolom640–1023px,1kolom<640px, focus ring dan reduced motion. Rute kategori existing dipertahankan; personalisasi tetap di Program Pilihan sesuai instruksi sebelumnya. Tidak ada angka program fiktif.

Validasi visual browser belum dilakukan; breakpoint, overflow, hover dan fokus masih memerlukan pemeriksaan render. Pengujian rute/katalog dan build dijalankan untuk perubahan ini.

## Revisi Program Pilihan — ringkasan dan CTA

Sumber: attachment72d27206-6644-445d-b86d-3d1d4ea4883d. File: `src/Home.jsx`, `src/ProgramCarousel.jsx`, `src/ui.jsx`, `src/homepage.css`; assertion copy di `tests/ui.test.mjs` diperbarui.

Heading menjadi Program pilihan; subheading/section CTA mengikuti spesifikasi. Ringkasan enam program dibuat ringkas sebagai presentation copy khusus carousel tanpa mengganti dataset/detail. KUR tetap skema kredit; FLPP tetap pembiayaan bersubsidi; ATENSI tetap dukungan sesuai asesmen. Label kategori lebih ringan, judul dua baris dengan judul lengkap pada link, summary tiga baris, footer sejajar, CTA text link Lihat detail program. Foto dan mekanisme carousel/bookmark tidak diubah. Personalisasi tetap inline dan berdasarkan kelengkapan profil. Tidak menambahkan status pendaftaran, popularitas atau angka fiktif.

QA visual belum diverifikasi melalui browser; wrapping, tinggi dan overflow hasil render belum dinyatakan lulus dari CSS saja.

## Revisi Layanan Publik — akses langsung panduan

Sumber: attachment638a02c3-7b41-4ce5-a3ca-015b2486bc4f. Scope: section homepage layanan serta anchor katalog yang diperlukan.

File: `src/HomepageServices.jsx` (komponen baru), `src/Home.jsx`, `src/homepage.css`, `src/discovery.jsx` (anchor/label kategori), `src/AppShell.jsx` (route hash dan fokus/scroll), `tests/ui.test.mjs`.

Enam kartu memuat ikon, nama task-first, deskripsi panduan dan chevron. Headline dipertahankan; subheadline, label LAYANAN PILIHAN dan CTA bawah ditambahkan sesuai prompt. BPJS hanya menjanjikan panduan pendaftaran JKN yang tersedia pada dataset. CTA atas ke /layanan; CTA bawah ke /layanan#kategori-layanan, memberi fokus dan scroll ke12kategori. Struktur kategori katalog dan dataset tidak diubah. CSS3/2/1kolom, focus ring, reduced motion.

Uji otomatis baru memeriksa keenam rute detail, hash kategori, fokus/scroll,12kategori, filter pajak, reset semua layanan dan perbedaan CTA atas/bawah. QA visual browser tetap belum terverifikasi; tidak mengklaim screenshot, overflow atau wrapping aktual lulus.

## Revisi Transparansi Informasi

Sumber: attachment0240b913-b4e0-4b2f-8b4b-07eeca6c03a6. File berubah: `src/Home.jsx` dan `src/homepage.css`.

Satu panel konten, grid kiri1.85fr/kanan1fr dengan gap48px; background#F4F7FB, radius18px, padding44px desktop/32px tablet/24px mobile. Stack satu kolom<=800px. Eyebrow, headline dan deskripsi sesuai prompt; ikon perisai dihapus. Dua baris tautan /sumber dan /anggaran dipisahkan divider dengan arrow-up-right, target52px, hover/fokus, reduced motion. Tidak ada data anggaran baru, perubahan dataset, route baru atau perubahan section lain.

QA visual browser belum tersedia; proporsi, wrapping dan overflow hasil render belum diverifikasi. Build dan pengujian rute dijalankan; tidak disamakan dengan hasil QA visual.

## Revisi FAQ homepage — accordion berbasis divider

Sumber: attachment5c97f43d-aa50-486a-ab04-caeadfbc4bba. File: `src/Home.jsx`, `src/ui.jsx`, `src/faq.js`, `src/homepage.css`, `tests/ui.test.mjs`.

Homepage memakai tujuh pertanyaan/jawaban sesuai arahan terbaru melalui dataset khusus; FAQ halaman /bantuan tetap5item existing. Blok Pusat Bantuan dan nomor urut dihapus. Copy pengantar ditambahkan. Dua kolom sekitar35/65 dengan gap56px; satu kolom<=760px. Accordion transparan dengan divider, pertanyaan16px, jawaban14px. Varian minimal komponen FAQ memakai button semantik, aria-expanded/controls, panel ber-ID, label region, inert dan aria-hidden saat tertutup. Default semua tertutup, satu jawaban terbuka dalam satu waktu. Animasi grid200ms dinonaktifkan pada reduced motion.

Pengujian baru memeriksa7button, default tertutup, toggling dan single-open, hubungan panel/ID, fokus button, visibilitas aksesibilitas, dan halaman bantuan tidak berubah. Enter/Space memakai perilaku button native; pengujian browser keyboard/render belum tersedia. QA visual, wrapping dan overflow tidak dinyatakan lulus tanpa screenshot browser.

## Revisi alignment header — tiga area

File: `src/AppShell.jsx`, `src/revision.css`. Header existing dipertahankan; empat menu dibungkus dalam .header-main-nav, Rencanaku/akun dalam .header-account-actions, tetap satu nav dan satu set link. Desktop memakai grid1fr/auto/1fr dengan gap36px, menu28px, actions14px. Logo kiri, empat link tepat di tengah, actions kanan. Active underline dan gaya tombol dipertahankan. Dropdown existing digunakan<=1150px dengan media focus-trap yang sama, tanpa perubahan tinggi/padding container.

Target lebar1920/1440/1280px memakai grid desktop; mobile memakai hamburger. Pemeriksaan CSS/DOM dan tes fungsi tidak menggantikan inspeksi screenshot pada ukuran tersebut. QA visual dan overflow aktual belum diverifikasi karena akses browser sebelumnya tidak tersedia.

## Revisi katalog Kenali Hakmu

Laporan perubahan dan batas verifikasi: CATALOG-REVISION.md. Search/filter horizontal menggantikan sidebar khusus /program; katalog layanan, homepage dan detail dipertahankan. QA visual percobaan terbaru blocked: in-app browser mengembalikan The browser access host is unavailable. TypeScript dan build lulus; regresi fungsi diuji melalui Node/JSDOM. Tidak ada screenshot atau overflow visual yang diklaim lulus.

## Revisi compact search dan filter

Laporan rinci: CATALOG-REVISION.md, bagian Revisi Search & Filter terbaru. Modal kini transactional dengan preview/draft/apply/cancel, bukan live apply.63tes otomatis dan TypeScript lulus. Data periode masih terbatas1/6program sehingga kontrol periode disembunyikan. Tampilan desktop/tablet/mobile dan overflow aktual belum diverifikasi karena browser access host belum tersedia.

## Dynamic program detail revision â€” 1 November 2026
Implemented program-only dynamic shell and schema, mechanism-specific actions, structured sources, conditional documents/access routes, and justified related guides. Automated validation: 82 tests pass; typecheck and production build pass. Local dev server responds on port 5173. Browser preview attempt returned 'The browser access host is unavailable'; desktop/tablet/mobile screenshot verification remains blocked. Full implementation and data limitations: PROGRAM-DETAIL-REVISION.md.

## Focused authentication revision â€” 1 November 2026
Masuk/Daftar/Pemulihan now use focused440px layout, minimal header, no breadcrumbs/global footer, requested copy and disabled provider-aware controls. Existing local identity mode isolated under /demo routes and marked; data retained. Typecheck and89 automated UI/domain/regression tests pass. Real Google/email/reset/session integration remains pending because no provider/backend is configured. Browser preview again reports access host unavailable; rendered desktop/mobile QA remains pending. Full audit/boundaries: AUTH-REVISION.md.

## User-requested browser-session login demo
Primary login/register and Google dummy enabled explicitly; sessionStorage identity/profile/plan adapter separate from legacy local data. Google G logo added; visible simulation notice, no actual OAuth/database or stored passwords/tokens.93 automated tests and typecheck pass; real-provider integration still absent. Rendered browser QA remains unavailable.

## Dynamic homepage featured programs
Home.jsx now uses homepage-featured.ts to select guest/general/personal programs from existing account/profile state and shared eligibility evaluation. Known mandatory conflicts and legacy/discontinued programs excluded from personal selections. Incomplete/empty personal results use clearly general programs. Carousel/card components and styles unchanged; full catalog CTA remains /program.99 tests pass, including live login/profile/logout updates and no-match fallback; typecheck and production build pass. Visual browser QA remains unavailable.

## Profile flow revision

Profile overview, account dropdown and optional editor revised; coded regional fields, activities/interests, transactional save/delete and unsaved-change navigation guards implemented. All 110 automated tests pass, including failed storage writes, retry, browser Back, logout confirmation and preservation of bookmarks when clearing personalization. Typecheck and production build pass (existing bundle-size warning only). Browser preview returned 'The browser access host is unavailable'; rendered desktop/mobile QA is not verified. Production provider synchronization and permanent account deletion remain unsupported. Details: PROFILE-REVISION.md.
