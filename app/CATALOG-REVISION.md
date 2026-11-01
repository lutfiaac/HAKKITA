# Revisi Kenali Hakmu — katalog program

Scope: /program dan route kategori program existing. Header/footer, homepage, layanan, detail dan dataset tetap dipertahankan.

## File dan komponen

- src/ProgramCatalog.jsx: tampilan katalog program, filter horizontal, dropdown sasaran, dialog filter lanjutan, chip per nilai/query, results toolbar/sorting, empty state.
- src/program-catalog.css dan src/main.jsx: style khusus katalog program dan import, grid3kolom di desktop lebar,2kolom menengah/tablet,1kolom mobile.
- src/discovery.jsx: tetap satu pemanggilan filterCatalog; reuse update/reset/URL, deduplikasi sasaran, sorting nama atas hasil filter, branch view program. Katalog layanan/pencarian global tetap memakai view sebelumnya.
- src/ui.jsx: Search menerima callback agar query tidak membuang filter; varian catalogCard mempertahankan foto/bookmark dan memakai CTA text Lihat detail program. Carousel tidak memakai varian ini.
- src/Personalization.jsx dan src/Home.jsx: ekstraksi inline personalization yang sama agar dapat dipakai bersama tanpa menduplikasi logic akun; homepage tidak berubah tampilannya.
- src/AppShell.jsx: mempertahankan fokus dan posisi scroll ketika query/filter program berubah. Navigasi menuju halaman berbeda tetap mengikuti pola sebelumnya.
- tests/ui.test.mjs: pembaruan assertion copy/kontrol, uji baru kombinasi query/kategori/wilayah/sorting, deduplikasi dan penghapusan sasaran satu per satu, fokus dropdown/Escape, reset dialog dan bookmark guest.

## Alur dan copy

Breadcrumb → introduction → Search → Filter → chip aktif → hasil/sorting → personalisasi kecil → kartu/empty state. Subheading dan placeholder program mengikuti prompt. Enam program existing tidak memerlukan pagination. Akses Cek kebutuhan tanpa akun tetap tersedia pada empty state. Empty state menghapus query/filter tanpa klaim ketidaklayakan.

Kategori7 dan wilayah memakai metadata existing; program nasional tetap dapat ditemukan saat memilih provinsi. Sasaran multi-select memakai OR sesuai filterCatalog existing; dimensi lain tetap AND. Sorting A–Z/Z–A disimpan sebagai urutan di URL dan tidak membuang filter. Tidak ada statistik/status pendaftaran fiktif, skeleton, data program baru atau duplikasi logic bookmark/filter.

## Verifikasi dan batasan

Pengujian Node/JSDOM mencakup rute, state URL, Back/Forward, kombinasi filter, sorting, fokus, modal, dan bookmark. Pemeriksaan TypeScript dan production build lulus.

QA visual: blocked. In-app browser mengembalikan The browser access host is unavailable. Tidak ada screenshot desktop/tablet/mobile, pemeriksaan overflow render, atau verifikasi keyboard browser native yang diklaim. Layout breakpoint dan wrapping masih memerlukan inspeksi browser; tes DOM tidak menggantikannya.

Hasil akhir:57pengujian lulus,0gagal. npm run typecheck dan npm run build lulus. QA visual tetap blocked karena browser access host tidak tersedia.

## Metadata waktu dan sorting

`src/program-timeline.js` mencatat baseline1November2026 untuk enam program existing. Tanggal penambahan awal tidak diketahui, sehingga addedOn tetapnull; firstRecordedOn adalah tanggal mulai pencatatan metadata, bukan peluncuran atau tanggal program ditambahkan dahulu. recordingBasis membedakan baseline dan addition. contentReviewedOn mempertahankan tanggal pemeriksaan konten existing31Oktober2026. Sumber jadwal dan tanggal verifikasi terpisah dari tanggal pemeriksaan konten.

Sorting default Terbaru dicatat memakai addedOn jika diketahui, lalu firstRecordedOn; tie memakai namaA-Z danid. Tenggat terdekat mengutamakan jadwal bertanggal valid yang belum lewat menurut kalender Asia/Jakarta. Program tanpa jadwal terverifikasi atau dengan jadwal lewat tetap ada dengan fallbackA-Z. Opsi namaA-Z/Z-A tetap tersedia, dan seluruh pilihan disimpan di urutan tanpa membuang filter/query.

Jadwal KIP Kuliah diverifikasi1November2026 dari https://kip-kuliah.kemdiktisaintek.go.id/ . Metadata menyimpan lima jalur/periode masing-masing (akun siswa, SNBP, UTBK-SNBT, MandiriPTN, MandiriPTS); sumber saat dibuka mencantumkan MandiriPTS ditutup1November2026. Jangan menyamakan tenggat akun dengan semua jalur program. Kartu pada mode tenggat menampilkan lingkup jadwal dan tautan resmi. Program lainnya belum diberi tenggat karena tidak ada jadwal program-wide yang terverifikasi pada pencatatan ini; tidak diberi tanggal buatan.

Tenggat date-only tidak memiliki jam tutup yang diketahui. Hari yang sama tetap muncul sebagai tenggat hari tersebut, tanpa klaim sedang menerima pendaftaran. Jadwal dapat berubah; referensi resmi dan scheduleVerifiedOn disimpan. Pembaruan metadata masih manual, bukan integrasi realtime.

File tambahan/perubahan: src/program-timeline.js, src/models.ts, src/data.js, src/discovery.jsx, src/ProgramCatalog.jsx, src/ui.jsx, src/program-catalog.css, tests/data.test.mjs, tests/ui.test.mjs. Pengujian mencakup validasi tanggal, sumber dan scope jadwal, timezoneJakarta, tenggat lewat/unknown, tie, nonmutating sorting dan stateURL/filter.

Revisi kartu terbaru: informasi tenggat dan tautan jadwal dihapus dari kartu sesuai permintaan pengguna. Sorting/metadata waktu tetap tersedia. Judul dan deskripsi seluruh kartu program maksimal2baris dengan line-clamp; judul lengkap tetap ada di DOM/title dan detail program. Area ringkasan disesuaikan menjadi2baris agar tidak menyisakan ruang3baris.

## Revisi Search & Filter terbaru

Sumber: attachment9ef178eb-8893-4c71-972e-46f8ce7977e0. Scope hanya search/filter/chips dan integrasi hasil; kartu, header/footer, homepage dan detail tetap.

File utama: src/ProgramCatalog.jsx, src/ProgramAdvancedFilters.jsx (baru), src/program-filters.js (opsi bersama), src/program-catalog.css, src/ui.jsx (opsi compact Search), src/discovery.jsx, src/data.js, src/metadata.ts, src/models.ts, src/program-timeline.js dan pengujian.

Search54px, max-width920px, satu ikon kiri, tombol Cari teks86px desktop/66px mobile. Label kontrol utama dibuat visually hidden untuk aksesibilitas; filter horizontal flex-wrap berukuran sesuai konten. Filter lainnya memakai tombol sliders dengan hierarki sekunder, bukan dropdown setara. Sasaran tetap multi-select dengan Hapus pilihan, count, click-outside/Escape.

Modal baru memakai draft lokal sementara, satu kolom manfaat/jenjang/periode. Pilihan hanya menjadi URL/applied state setelah Tampilkan X program. PreviewCount memakai filterCatalog yang sama; tidak mengubah hasil utama. X/Escape membuang draft. Reset filter tambahan hanya mengosongkan manfaat, pendidikan dan periode pada draft; query/kategori/wilayah/sasaran/sorting dipertahankan ketika diterapkan.

Manfaat memakai OR per opsi dan AND lintas grup; benefitTypes eksplisit ditambahkan pada metadata, mempertahankan benefitType lama. FLPP memiliki pembiayaan+subsidi berdasarkan ringkasan dan manfaat existing, tanpa deduplikasi berdasarkan nama. Tujuh opsi sesuai prompt tersedia; opsi tanpa program yang diklasifikasikan secara valid menghasilkan nol hasil, tanpa membuat program/kategori manfaat fiktif. Klasifikasi pendidikan/pelatihan/kredit/layanan existing dipertahankan.

Tingkat penyelenggara/kegiatan dihapus dari UI tambahan, metadata tetap ada. State URL lama tetap dapat dikenali dan dihapus lewat chip. Jenjang hanya ditampilkan bila kategori/metadata hasil utama relevan atau filter jenjang aktif; helper menjelaskan bahwa makna jenjang mengikuti persyaratan, bukan selalu jenjang sedang ditempuh. Periode disembunyikan karena hanya1dari6program memiliki jadwal terverifikasi, di bawah mayoritas. Utility registrationStatus membedakan open/upcoming/closed/unknown dari tanggal bersumber; unknown tidak dianggap open.

Pipeline yang sama dipakai pencarian utama dan preview, dengan OR sasaran/manfaat dan AND antargrup. Cakupan wilayah unknown tidak dianggap nasional. Label manfaat/jenjang/status menjadi chip terbaca; per nilai dapat dihapus, Hapus semua membersihkan query/filter. Sorting waktu serta A-Z/Z-A existing dipertahankan.

Verifikasi:63pengujian lulus, TypeScript lulus. Test baru memeriksa compact search satu ikon, opsi modal, preview tanpa mutasi URL/hasil, cancel lewat X/Escape, apply atomik, reset hanya tambahan, count, manfaatOR/AND, deduplikasi FLPP, pendidikan kondisional, periode unknown dan target clear. QA visual browser masih belum tersedia; tidak mengklaim screenshot atau overflow render lulus.

Regional scholarships and district filtering (1 November 2026): Added two sourced records and detail pages, bringing catalog to eight programs. Province-dependent district options are derived from program coverage (currently Kabupaten Berau). National and province-wide coverage remains included. URL, chips, clear/reset, advanced preview and province-change reset supported. Kaltim Tuntas copy distinguishes existing-recipient MONEV from new applications; JDIH repeal status linked. Berau enrollment dates remain unknown due inconsistent historical/current portal snapshots. Typecheck and 65 tests passed; visual browser QA remains unavailable.

Unified nationwide Wilayah filter: ProgramRegionFilter.jsx now contains both levels in one dismissible popover. All 38 provinces and 514 regencies/cities are bundled locally from https://wilayah.id/ (underlying dataset version 2025-07-04); no runtime API dependency. Reproducible refresh script validates totals, and tests validate unique codes/parent relationships. Province vocabulary DI Yogyakarta normalized to existing application URLs. Regional chips combined, district resets on province changes, Escape/outside/blur close, clear/Selesai retain focus. Missing local programs produce contextual empty state while national results remain explicitly explained; zero results have location-specific empty state.
