# Hakkita — laporan revisi master frontend

Tanggal: **31 Oktober 2026** (Asia/Jakarta). Implementasi langsung pada aplikasi existing di `app/`.

## Hasil utama

Kenali Hakmu menjadi fokus beranda. Alur publik tetap terbuka; akun contoh dan profil bersifat opsional. Katalog memiliki **6 program canonical**, **8 layanan canonical**, **7 kategori program**, dan **12 kategori layanan**. Kategori yang belum memiliki data menampilkan empty state dan jalur eksplorasi lain.

Struktur visual LifeSG yang sudah dipilih pengguna dipertahankan: header putih, hero krem dengan pencarian terpusat, biru primary, whitespace, border tipis, dan footer sederhana. Geist, logo pengguna berukuran 152px/132px, headline weight 600, ilustrasi `hero-lakeside.png`, penghapusan strip atas, serta footer tanpa ilustrasi tetap berlaku. Copy headline mengikuti master revision terbaru: **“Temukan program yang sesuai dengan kebutuhanmu.”**

## Arsitektur

React 19/Vite dipertahankan; tidak dimigrasikan ke Next.js karena proyek existing adalah React/Vite dan tidak memerlukan pergantian teknologi. Phosphor dan CSS existing dipertahankan. Modul TypeScript ditambahkan untuk kontrak data, kategori, metadata, aturan rekomendasi, dan penyimpanan akun. UI existing tetap JSX; `tsc --noEmit` memeriksa modul TypeScript dengan mode strict, bukan pemeriksaan strict penuh terhadap semua JSX.

| Modul | Tanggung jawab |
| --- | --- |
| `App.jsx` | Entry export |
| `AppShell.jsx` | Routing, header/footer, dialog bookmark, pengembalian konteks masuk |
| `Home.jsx` | Beranda baru dan state personalisasi |
| `discovery.jsx` | Katalog, filter, detail, varian, dan kanal/lokasi |
| `ui.jsx` | Search, Card, Modal, FAQ, breadcrumb, empty state, CTA eksternal |
| `AccountContext.tsx` | Identitas aktif, profil, jawaban sementara, state simpanan |
| `account-store.ts` | Adapter akun lokal, validasi identitas, sanitasi data, return path |
| `AccountPages.jsx` | Masuk/daftar, welcome, profil/edit, rekomendasi, guest gate |
| `Plans.jsx` | Checklist, tujuan, filter, hapus/urungkan, impor simpanan lama |
| `models.ts`, `taxonomy.ts`, `metadata.ts` | Tipe domain dan kategori program/layanan yang terpisah |
| `recommendations.ts` | Evaluasi met/not-met/unknown dan rekomendasi profil |
| `data.js`, `additional-data.js` | Satu canonical record per program/layanan |
| `budget.js` | Snapshot anggaran bersumber dan filter tanpa nilai fiktif |
| `faq.js` | Satu sumber copy FAQ untuk beranda dan halaman FAQ |
| `pages.jsx` | Cek kebutuhan tanpa akun, anggaran, halaman informasi |
| `revision.css` | Penyesuaian visual dan responsive untuk fitur revisi |

Komponen katalog/detail/Rencanaku lama yang digantikan dihapus agar tidak ada dua implementasi aktif. Evaluasi cek kebutuhan tanpa akun dan rekomendasi profil memakai aturan dari metadata yang sama.

## Route

| Route | Perilaku |
| --- | --- |
| `/` | Hero, 6 program pilihan, personalisasi, 7 kategori, 3 langkah, 6 layanan, Rencanaku kondisional, transparansi, 7 FAQ |
| `/program` | Search, filter utama/lanjutan, active chips, reset, simpan |
| `/program/kategori/:slug` | Katalog dengan kategori aktif |
| `/program/:slug` | Detail dan sumber resmi |
| `/program/:slug/persyaratan` | Persyaratan, dokumen, dan pemeriksaan terhadap profil |
| `/program/rekomendasi` | Hasil berdasarkan profil; guest memiliki jalur masuk dan eksplorasi manual |
| `/layanan` | Preview prioritas, 12 kategori, semua layanan dan filter |
| `/layanan/kategori/:slug` | Katalog layanan berdasarkan kategori |
| `/layanan/:slug` | Panduan dan sumber |
| `/layanan/ktp-el/:variant` | `baru`, `hilang`, `rusak`, `perubahan-data`; dokumen dan simpanan terpisah |
| `/layanan/lokasi?layanan=:id` | Kanal resmi; tidak membuat kantor/alamat yang belum diverifikasi |
| `/cari` | Global search dan label Program/Layanan |
| `/cocokkan` | Cek kebutuhan tanpa akun yang sudah ada dipertahankan |
| `/masuk`, `/daftar` | Alur identitas contoh lokal tanpa password |
| `/selamat-datang` | Profil opsional atau lanjut eksplorasi |
| `/profil`, `/profil/edit` | Baca/ubah/hapus profil, keluar, reset identitas lokal |
| `/rencanaku` | Simpanan per identitas, tujuan, checklist, hapus, urungkan |
| `/anggaran` | Grafik/tabel APBD dengan filter level, tahun, wilayah, kelompok |
| `/bantuan`, `/tentang`, `/sumber`, `/privasi` | Informasi pendukung |

Alias `/pencarian`, `/faq`, `/sumber-informasi` memakai komponen route existing yang setara, bukan halaman duplikat. Slug atau varian yang tidak dikenal memiliki halaman pemulihan. History API dan fallback Worker mendukung deep link dan back/forward.

## Akun dan privasi

- Identitas contoh memakai nama tampilan dan alamat `@example.test`. Email pribadi dan password tidak diminta. Validasi mencakup kosong, format, panjang, dan whitespace.
- Identitas disimpan pada browser ini, bukan server. Tidak ada email verifikasi, reset password, atau sinkronisasi antarperangkat yang diklaim.
- Login memilih identitas yang memang sudah tersimpan pada perangkat. Duplikasi identitas diperiksa hanya pada penyimpanan lokal.
- Bookmark guest membuka dialog yang dapat ditutup tanpa kehilangan halaman/varian. Aksi dilanjutkan setelah masuk/daftar dengan tujuan internal yang divalidasi.
- Simpanan, checklist, dan profil dipisahkan untuk setiap identitas. Keluar tidak menggabungkan data ke identitas lain.
- Profil dapat dilewati atau disimpan sebagian. Nama tampilan dapat diubah. Tidak ada skor persentase kelengkapan.
- Jawaban ekonomi, kepemilikan usaha tambahan, kondisi kepemilikan rumah, dan riwayat subsidi hunian hanya berada di memori sesi. Jawaban tersebut tidak masuk localStorage dan dihapus ketika keluar, berganti identitas, atau refresh.
- Profil non-sensitif yang disimpan dibatasi oleh whitelist: wilayah kasar, kegiatan, pendidikan, tahun kelulusan, minat, rentang usia, dan status pelajar. Tidak ada NIK, KK, alamat lengkap, data pendapatan, atau dokumen pribadi yang dikumpulkan.
- Adapter sanitasi hanya menulis field yang dikenal, menangani JSON rusak, menolak key identitas khusus, dan memvalidasi return path agar tidak keluar origin.
- Simpanan format lama tidak otomatis digabungkan. Pengguna dapat memilih impor secara eksplisit; penanda pemilik mencegah impor ulang ke identitas lain.
- Jika localStorage tidak tersedia, sesi dan simpanan tetap dapat digunakan dalam memori dengan pemberitahuan yang sesuai.

## Penemuan dan rekomendasi

Program dan layanan memakai taksonomi serta metadata yang berbeda. Program dapat memiliki kategori sekunder tanpa diduplikasi. Filter antardimensi memakai AND; beberapa sasaran dalam satu filter memakai OR. Filter non-sensitif tersimpan pada URL.

Program: kategori, wilayah, sasaran, jenis manfaat, pusat/daerah, jenjang, kegiatan, dan periode terverifikasi. Filter lanjutan tersembunyi sampai dibuka. Tidak ada tanggal pendaftaran yang diasumsikan; filter periode dapat memiliki hasil kosong.

Layanan: kategori, wilayah, kanal online/tatap muka. Program/kebijakan nasional tetap muncul ketika memilih provinsi; panduan KTP khusus DKI tidak ditampilkan untuk provinsi lain. Kebijakan nasional, panduan sumber daerah, dan lokasi pelaksanaan dijelaskan pada detail.

Search mengenali alias seperti **“bikin NPWP”**, **“perpanjang SIM”**, **“KTP hilang”**, dan **“KTP rusak”**. Query varian membuka deep link panduan yang sesuai. Hasil global diberi label Program/Layanan.

Rekomendasi memakai label **Berpotensi Relevan**, **Perlu Periksa Persyaratan**, atau **Belum Sesuai dengan Kondisi**. Syarat unknown tidak dianggap terpenuhi. Ketidaksesuaian wajib tidak ditutupi oleh minat pengguna. Penjelasan berasal dari kategori, sasaran, cakupan, dan aturan yang benar-benar tersedia. Hasil dihitung ulang langsung setelah profil berubah. Penetapan penerima tetap pada penyelenggara.

## Dataset dan sumber

Tanggal pemeriksaan: **31 Oktober 2026**. Entri existing mempertahankan sumber yang telah diperiksa pada tanggal yang sama; tambahan di bawah ditelusuri pada revisi ini.

| Program | Sumber |
| --- | --- |
| KIP Kuliah | [Panduan KIP Kuliah 2026](https://kip-kuliah.kemdiktisaintek.go.id/panduan); CTA langsung [portal KIP Kuliah](https://kip-kuliah.kemdiktisaintek.go.id/) |
| Program Indonesia Pintar | [SIPINTAR Kemendikdasmen](https://pip.kemendikdasmen.go.id/home_v1) |
| Pelatihan Vokasi Nasional | [Skillhub Kemnaker](https://skillhub.kemnaker.go.id/) |
| Kredit Usaha Rakyat | [Ketentuan penyalur Bank Mandiri](https://www.bankmandiri.co.id/kredit-usaha-rakyat-kur) |
| KPR Sejahtera FLPP — tambahan | [BP Tapera: persyaratan dan pengajuan](https://www.tapera.go.id/kpr-flpp/) |
| ATENSI — tambahan | [Pedoman Operasional Kemensos](https://kemensos.go.id/uploads/topics/17035995429363.pdf), [glosarium JDIH](https://jdih.kemensos.go.id/glosarium) |

KUR dan FLPP dinyatakan sebagai pembiayaan dengan kewajiban pengembalian/angsuran. Tidak ada nominal bantuan atau jadwal buka yang diciptakan. ATENSI ditandai memerlukan asesmen, bukan otomatis sesuai berdasarkan label kelompok sasaran.

| Layanan | Sumber |
| --- | --- |
| KTP-el — 4 varian | [Dukcapil DKI Jakarta](https://kependudukancapil.jakarta.go.id/kartu-tanda-penduduk-elektronik-e-ktp/1000/) |
| Perpanjangan SIM | [Digital Korlantas/SINAR](https://digitalkorlantas.polri.go.id/sim/) |
| Paspor baru dewasa | [Imigrasi Jakarta Pusat](https://jakartapusat.imigrasi.go.id/layanan/warga-negara-indonesia-wni/paspor-baru) |
| Pendaftaran peserta JKN | [BPJS Kesehatan: administrasi JKN](https://bpjs-kesehatan.go.id/user-manual-mobile-jkn/administrasi%20JKN.html) |
| Pendaftaran NPWP — tambahan | [DJP: wajib pajak orang pribadi](https://www.pajak.go.id/coretaxpedia/pendaftaran-wp-orang-pribadi), [dokumen Coretax](https://pajak.go.id/coretaxpedia/dokumen-yang-perlu-disiapkan) |
| SKCK — tambahan | [Portal SKCK POLRI](https://skck-online.polri.go.id/), [alur pelayanan Polda Jatim](https://tribratanews.jatim.polri.go.id/informasi-penerbitan-skck) |
| NIB — tambahan | [OSS: panduan UMK perseorangan risiko rendah/menengah rendah](https://s3.oss.go.id/oss/cms/%28z%29-2025_Perizinan-Berusaha-UMK-Risiko-Rendah-dan-Menengah-Rendah---Orang-Perseorangan-9a47a94cdbba5065cde976891a2c90f5.pdf) |
| SP4N-LAPOR! — tambahan | [kanal alternatif resmi](https://prod.lapor.go.id/), [pengumuman pemeliharaan](https://lapor.go.id/) |

Pada tanggal pemeriksaan, `lapor.go.id` memuat pengumuman pemeliharaan dan mengarahkan ke `prod.lapor.go.id`; katalog menggunakan kanal alternatif tersebut dengan konteks tanggalnya. Biaya SKCK mengikuti informasi portal resmi; dokumen spesifik yang belum diverifikasi tidak diperlakukan sebagai checklist universal.

## Anggaran

Snapshot existing dari [Portal Data SIKD DJPK](https://djpk.kemenkeu.go.id/portal/data/apbd) dipertahankan: APBD agregat 546 pemda, data diterima 30 Oktober 2026, realisasi sampai Oktober 2026. Total alokasi **1.266.675,33 M**, total realisasi **754.363,82 M**, unit miliar rupiah. Empat kelompok tidak dicampur dengan baris turunannya. Selisih pembulatan rincian 0,01 M diperlakukan dengan toleransi pada pengujian.

Filter wilayah, kelompok, tahun, dan APBN/APBD berfungsi. Hanya agregat nasional APBD 2026 yang memiliki snapshot. Pilihan lain menampilkan data belum tersedia, bukan nol. Formatter membedakan null dari angka nol. Tampilan tabel dan grafik menggunakan data yang sama. Tidak ada relasi pendanaan program yang dibuat tanpa sumber.

## Pengujian yang benar-benar dijalankan

- `npm run typecheck`: **lulus**.
- `npm run build`: **lulus**, menghasilkan client, Worker, serta metadata build; tidak dipublikasikan ke hosting.
- `npm test`: **45 lulus, 0 gagal**.
- HTTP lokal untuk preview mengembalikan **200**.

Pengujian memakai Node, React, dan JSDOM. Cakupannya:

1. Tujuh dan dua belas kategori, schema metadata, URL sumber, unique route, related items.
2. Search, alias, query aman sebagai teks, kombinasi filter, sasaran OR, wilayah nasional/khusus, periode kosong.
3. Met/not-met/unknown, tahun/usia/pendidikan yang bertentangan, data belum tahu, hasil baru setelah profil berubah.
4. Form daftar, validasi, tanpa password/email nyata, skip profil, welcome, masuk ulang.
5. Bookmark guest → dialog → daftar → kembali ke varian → simpan tanpa profil wajib.
6. Close/Escape/focus trap dialog, menu mobile, filter sheet.
7. Toggle simpanan, checklist, tujuan, hapus/urungkan, refresh state, item tidak tersedia.
8. Keluar, ganti identitas, JSON rusak, penyimpanan gagal, impor simpanan lama dengan kepemilikan eksplisit.
9. History API back/forward mempertahankan filter.
10. KTP baru/hilang/rusak/perubahan-data, invalid variant, invalid slug, halaman kanal tanpa daftar kantor.
11. Grafik/tabel, kategori anggaran, wilayah/tahun tanpa data, null/zero formatter, pembulatan sumber.
12. Seluruh tautan internal yang dirender menuju route yang tersedia; form publik memiliki label dan tidak ada ID duplikat.
13. Tidak ada console error React selama pengujian DOM.
14. Fallback Worker, aset statis, API/write bukan SPA, dan kelengkapan artefak build.

**Batas pengujian:** tidak ada hasil end-to-end browser sungguhan, screenshot implementasi, review console browser, atau pengukuran overflow/kontras pixel. In-app browser mengembalikan “The browser access host is unavailable” pada revisi ini. Mode mobile dan keyboard diuji sebagai interaksi DOM; kelulusan visual desktop/mobile belum diklaim. Lihat `design-qa.md`.

## Batasan dan pekerjaan yang memerlukan integrasi

- Akun server, autentikasi, reset password/email, dan sinkronisasi lintas perangkat membutuhkan backend. Adapter lokal sengaja dipisah agar dapat diganti.
- Tidak ada pengajuan pemerintah atau tracking permohonan. Checklist hanya persiapan pribadi.
- PKH, PBI-JKN, Beasiswa Unggulan, dan MagangHub belum dimasukkan karena belum ada rangkaian informasi resmi lengkap yang berhasil diverifikasi pada revisi ini. Halaman PKH/Cek Bansos mengalami timeout. Tidak ada entri fiktif untuk mengisi kategori.
- Beberapa kategori layanan masih memiliki empty state. Tidak semua layanan atau varian pada daftar kandidat master prompt tersedia; hanya panduan yang memiliki sumber dipasang sebagai entri.
- Paspor anak/penggantian dan SIM baru belum digeneralisasi dari varian existing.
- Daftar alamat/jadwal kantor dan durasi pengurusan belum ditambahkan karena tidak ada dataset terverifikasi yang cocok.
- ATENSI memakai pedoman operasional umum; ketentuan terkini, dokumen spesifik, dan jalur unit setempat perlu dikonfirmasi penyelenggara.
- KUR memakai rincian penyalur Bank Mandiri; penyalur lain dapat berbeda.
- Data anggaran dan katalog merupakan snapshot, bukan sinkronisasi pemerintah secara langsung. Tanggal serta status sumber perlu diperiksa ulang sebelum pengajuan.

## Design tokens

Font `Geist, Arial, sans-serif`; primary `#196dcc`; hover `#1256a3`; heading `#292b2e`; body `#555c64`; border `#dce1e6`; hero `#fffaf4`; supporting blue `#f0f6fd`. Kontainer 1184px/1320px, radius kartu 14–16px. Responsive tambahan mendukung satu kolom, menu ringkas, filter sheet, form dan CTA yang dapat dibungkus.
